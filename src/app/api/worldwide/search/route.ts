import { NextRequest, NextResponse } from 'next/server';
import { getCatalog, appendOrUpdateTitle } from '@/lib/api/movieStore';
import { searchWorldwideCatalog } from '@/lib/api/worldwideFederation';
import { searchWorldwideTitles, GLOBAL_DATASET_SPEC, isTmdbConfigured } from '@/lib/api/tmdb';
import { TitleItem } from '@/types/movie';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  if (!q.trim()) {
    return NextResponse.json({
      results: [],
      total: 0,
      federated: false,
      datasetsInfo: GLOBAL_DATASET_SPEC,
    });
  }

  const query = q.trim().toLowerCase();
  const localCatalog = getCatalog();

  // 1. Local Master Catalog search
  let matchedLocal = localCatalog.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const origMatch = item.originalTitle?.toLowerCase().includes(query);
    const overviewMatch = item.overview.toLowerCase().includes(query);
    const castMatch = (item.cast || []).some((c) => c.name.toLowerCase().includes(query));
    const dirMatch = (item.directors || []).some((d) => d.name.toLowerCase().includes(query));
    const genreMatch = (item.genres || []).some((g) => g.name.toLowerCase().includes(query));

    return titleMatch || origMatch || overviewMatch || castMatch || dirMatch || genreMatch;
  });

  if (type !== 'all') {
    matchedLocal = matchedLocal.filter((item) => item.type === type);
  }

  // 2. Just-In-Time (JIT) Dynamic Open Federation (Cinemeta + TVMaze)
  let federatedResults: TitleItem[] = [];
  try {
    const openMatches = await searchWorldwideCatalog(query, type);
    for (const item of openMatches) {
      if (
        !matchedLocal.some(
          (m) => m.id === item.id || m.imdbId === item.imdbId || m.title.toLowerCase() === item.title.toLowerCase()
        )
      ) {
        appendOrUpdateTitle(item);
        federatedResults.push(item);
      }
    }
  } catch (e) {
    console.warn('Open federation search error:', e);
  }

  // 3. Optional TMDB if configured
  if (isTmdbConfigured()) {
    try {
      const tmdbTitles = await searchWorldwideTitles(query);
      for (const item of tmdbTitles) {
        if (
          !matchedLocal.some((m) => m.id === item.id || m.imdbId === item.imdbId) &&
          !federatedResults.some((f) => f.id === item.id || f.imdbId === item.imdbId)
        ) {
          appendOrUpdateTitle(item);
          federatedResults.push(item);
        }
      }
    } catch (err) {
      console.warn('TMDB search error:', err);
    }
  }

  const combined = [...matchedLocal, ...federatedResults];

  return NextResponse.json({
    results: combined,
    total: combined.length,
    localMatches: matchedLocal.length,
    federatedMatches: federatedResults.length,
    federated: true,
    datasetsInfo: GLOBAL_DATASET_SPEC,
  });
}
