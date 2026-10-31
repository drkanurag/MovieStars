import { NextRequest, NextResponse } from 'next/server';
import { getTitleById, getCatalog } from '@/lib/api/movieStore';
import { fetchFromTmdb, isTmdbConfigured } from '@/lib/api/tmdb';

// In-memory cache for resolved trailer metadata
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

  // 2. Check local verified catalog by ID or title
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

  // 3. Official TMDB Video Metadata Lookup
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
            source: 'tmdb_official_videos_api',
          });
        }
      }
    } catch (e) {
      console.warn('TMDB official trailer lookup error:', e);
    }
  }

  // 4. Official YouTube Data API v3 (if YOUTUBE_API_KEY is configured)
  const ytApiKey = process.env.YOUTUBE_API_KEY;
  if (ytApiKey && title) {
    try {
      const query = `${title} ${year} official trailer`.trim();
      const ytApiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&maxResults=1&key=${encodeURIComponent(ytApiKey)}`
      );
      if (ytApiRes.ok) {
        const data = await ytApiRes.json();
        const item = data.items?.[0];
        const videoId = item?.id?.videoId;
        if (videoId) {
          trailerCache.set(queryKey, { key: videoId, videoTitle: item.snippet?.title });
          return NextResponse.json({
            youtubeKey: videoId,
            videoTitle: item.snippet?.title || `${title} Official Trailer`,
            watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
            searchUrl,
            source: 'youtube_official_data_api',
          });
        }
      }
    } catch (e) {
      console.warn('YouTube Data API v3 lookup error:', e);
    }
  }

  // 5. Official structured direct destination (no brittle HTML web scraping)
  return NextResponse.json({
    youtubeKey: null,
    searchUrl,
    watchUrl: searchUrl,
    message: 'Trailer available via official YouTube search.',
    source: 'official_search_redirect',
  });
}
