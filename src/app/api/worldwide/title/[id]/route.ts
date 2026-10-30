import { NextRequest, NextResponse } from 'next/server';
import { getTitleById, appendOrUpdateTitle } from '@/lib/api/movieStore';
import { resolveWorldwideTitle } from '@/lib/api/worldwideFederation';
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
  if (localItem && localItem.cast && localItem.cast.length > 0) {
    return NextResponse.json({ title: localItem, source: 'local_master_catalog' });
  }

  // 2. Open Worldwide Federation (Covers all 11.2M+ IMDb titles and TVMaze series)
  try {
    const federated = await resolveWorldwideTitle(id);
    if (federated) {
      appendOrUpdateTitle(federated);
      return NextResponse.json({ title: federated, source: 'open_worldwide_federation' });
    }
  } catch (e) {
    console.warn('Open worldwide federation lookup failed:', e);
  }

  // 3. Fallback to TMDB if configured
  if (isTmdbConfigured()) {
    try {
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
    } catch (err) {
      console.error('TMDB fallback lookup error:', err);
    }
  }

  if (localItem) {
    return NextResponse.json({ title: localItem, source: 'local_master_catalog' });
  }

  return NextResponse.json({ error: 'Title not found in global datasets' }, { status: 404 });
}
