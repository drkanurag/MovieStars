import { NextRequest, NextResponse } from 'next/server';
import { getTitleById, getCatalog } from '@/lib/api/movieStore';
import { fetchFromTmdb, isTmdbConfigured } from '@/lib/api/tmdb';

// Simple in-memory cache to prevent redundant YouTube lookups
const trailerCache = new Map<string, { key: string; videoTitle?: string }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title')?.trim();
  const year = searchParams.get('year')?.trim() || '';
  const id = searchParams.get('id')?.trim();

  if (!title && !id) {
    return NextResponse.json({ error: 'Title or ID parameter is required' }, { status: 400 });
  }

  const queryKey = `${id || ''}:${title || ''}:${year}`.toLowerCase();
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title || ''} ${year} official trailer`.trim()
  )}`;

  // 1. Check in-memory cache
  if (trailerCache.has(queryKey)) {
    const cached = trailerCache.get(queryKey)!;
    return NextResponse.json({
      youtubeKey: cached.key,
      videoTitle: cached.videoTitle,
      watchUrl: `https://www.youtube.com/watch?v=${cached.key}`,
      searchUrl,
      source: 'memory_cache',
    });
  }

  // 2. Check local catalog by ID or title
  if (id) {
    const local = getTitleById(id);
    if (local?.trailerYoutubeKey) {
      trailerCache.set(queryKey, { key: local.trailerYoutubeKey, videoTitle: `${local.title} Official Trailer` });
      return NextResponse.json({
        youtubeKey: local.trailerYoutubeKey,
        videoTitle: `${local.title} Official Trailer`,
        watchUrl: `https://www.youtube.com/watch?v=${local.trailerYoutubeKey}`,
        searchUrl,
        source: 'local_catalog',
      });
    }
  }

  if (title) {
    const all = getCatalog();
    const found = all.find(
      (m) => m.title.toLowerCase() === title.toLowerCase() && m.trailerYoutubeKey
    );
    if (found?.trailerYoutubeKey) {
      trailerCache.set(queryKey, { key: found.trailerYoutubeKey, videoTitle: `${found.title} Official Trailer` });
      return NextResponse.json({
        youtubeKey: found.trailerYoutubeKey,
        videoTitle: `${found.title} Official Trailer`,
        watchUrl: `https://www.youtube.com/watch?v=${found.trailerYoutubeKey}`,
        searchUrl,
        source: 'local_catalog_title_match',
      });
    }
  }

  // 3. Check TMDB if configured
  if (isTmdbConfigured() && title) {
    try {
      const searchRes = await fetchFromTmdb<{ results: any[] }>('/search/multi', {
        query: title,
        include_adult: 'false',
      });
      const topMatch = searchRes?.results?.[0];
      if (topMatch) {
        const mediaType = topMatch.media_type === 'tv' ? 'tv' : 'movie';
        const details = await fetchFromTmdb<any>(`/${mediaType}/${topMatch.id}`, {
          append_to_response: 'videos',
        });
        const trailer = details?.videos?.results?.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (trailer?.key) {
          trailerCache.set(queryKey, { key: trailer.key, videoTitle: trailer.name });
          return NextResponse.json({
            youtubeKey: trailer.key,
            videoTitle: trailer.name || `${title} Official Trailer`,
            watchUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
            searchUrl,
            source: 'tmdb_api',
          });
        }
      }
    } catch (e) {
      console.warn('TMDB trailer search error:', e);
    }
  }

  // 4. Dynamic YouTube Search Fallback
  if (title) {
    try {
      const searchQuery = `${title} ${year} official trailer`.trim();
      const ytRes = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          next: { revalidate: 86400 }, // Cache 24h
        }
      );

      if (ytRes.ok) {
        const html = await ytRes.text();
        const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
        const unique = [...new Set(matches)];

        // Validate top candidate with oEmbed
        for (const candidateKey of unique.slice(0, 3)) {
          try {
            const check = await fetch(
              `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${candidateKey}&format=json`,
              { signal: AbortSignal.timeout(3000) }
            );
            if (check.ok) {
              const data = (await check.json()) as { title?: string };
              trailerCache.set(queryKey, { key: candidateKey, videoTitle: data.title });
              return NextResponse.json({
                youtubeKey: candidateKey,
                videoTitle: data.title || `${title} Official Trailer`,
                watchUrl: `https://www.youtube.com/watch?v=${candidateKey}`,
                searchUrl,
                source: 'youtube_search_discovery',
              });
            }
          } catch {
            // continue to next candidate
          }
        }

        // If oEmbed check timed out but we have a candidate, use the first key
        if (unique.length > 0) {
          const firstKey = unique[0];
          trailerCache.set(queryKey, { key: firstKey });
          return NextResponse.json({
            youtubeKey: firstKey,
            videoTitle: `${title} Official Trailer`,
            watchUrl: `https://www.youtube.com/watch?v=${firstKey}`,
            searchUrl,
            source: 'youtube_search_fast',
          });
        }
      }
    } catch (e) {
      console.warn('YouTube search fallback error:', e);
    }
  }

  // 5. If all else fails, return the direct search link
  return NextResponse.json({
    youtubeKey: null,
    searchUrl,
    watchUrl: searchUrl,
    message: 'Could not resolve exact embed key; open direct YouTube search.',
  });
}

