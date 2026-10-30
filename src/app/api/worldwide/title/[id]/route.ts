import { NextRequest, NextResponse } from 'next/server';
import { getTitleById, appendOrUpdateTitle } from '@/lib/api/movieStore';
import { fetchFromTmdb, normalizeTmdbItem, isTmdbConfigured } from '@/lib/api/tmdb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: 'Title ID required' }, { status: 400 });
  }

  // 1. Check local catalog
  const localItem = getTitleById(id);
  if (localItem) {
    return NextResponse.json({ title: localItem, source: 'local_master_catalog' });
  }

  // 2. If not local and TMDB configured, attempt worldwide live resolution
  if (isTmdbConfigured()) {
    try {
      // Check if ID is an IMDb ID: starts with tt
      if (id.startsWith('tt')) {
        const findData = await fetchFromTmdb<any>(`/find/${id}`, {
          external_source: 'imdb_id',
        });
        if (findData) {
          if (findData.movie_results && findData.movie_results.length > 0) {
            const raw = findData.movie_results[0];
            const fullMovie = await fetchFromTmdb<any>(`/movie/${raw.id}`, {
              append_to_response: 'credits,videos',
            });
            const normalized = normalizeTmdbItem(fullMovie || raw, 'movie');
            appendOrUpdateTitle(normalized);
            return NextResponse.json({ title: normalized, source: 'tmdb_worldwide_federation' });
          }
          if (findData.tv_results && findData.tv_results.length > 0) {
            const raw = findData.tv_results[0];
            const fullTv = await fetchFromTmdb<any>(`/tv/${raw.id}`, {
              append_to_response: 'credits,videos',
            });
            const normalized = normalizeTmdbItem(fullTv || raw, 'tv');
            appendOrUpdateTitle(normalized);
            return NextResponse.json({ title: normalized, source: 'tmdb_worldwide_federation' });
          }
        }
      }

      // Check if ID is numeric (direct TMDB ID) or starts with tmdb-
      let tmdbNumericId = id;
      let mediaType: 'movie' | 'tv' = 'movie';

      if (id.startsWith('tmdb-movie-')) {
        tmdbNumericId = id.replace('tmdb-movie-', '');
        mediaType = 'movie';
      } else if (id.startsWith('tmdb-tv-')) {
        tmdbNumericId = id.replace('tmdb-tv-', '');
        mediaType = 'tv';
      }

      if (/^\d+$/.test(tmdbNumericId)) {
        // Try movie first
        let raw = await fetchFromTmdb<any>(`/${mediaType}/${tmdbNumericId}`, {
          append_to_response: 'credits,videos',
        });
        if (!raw && mediaType === 'movie') {
          // fallback to tv
          raw = await fetchFromTmdb<any>(`/tv/${tmdbNumericId}`, {
            append_to_response: 'credits,videos',
          });
          if (raw) mediaType = 'tv';
        }

        if (raw) {
          const normalized = normalizeTmdbItem(raw, mediaType);
          appendOrUpdateTitle(normalized);
          return NextResponse.json({ title: normalized, source: 'tmdb_worldwide_federation' });
        }
      }
    } catch (err) {
      console.error('Worldwide title resolution error:', err);
    }
  }

  return NextResponse.json({ error: 'Title not found in global datasets' }, { status: 404 });
}

