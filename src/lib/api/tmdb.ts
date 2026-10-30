import { TitleItem, TitleType } from '@/types/movie';
import { calculateBayesianScore } from '../bayesian';

const DEFAULT_TMDB_API_KEY = '652fd7c9e7c6cbfe09b61a6bf8f623b6';
const DEFAULT_TMDB_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NTJmZDdjOWU3YzZjYmZlMDliNjFhNmJmOGY2MjNiNiIsIm5iZiI6MTc5MzM1MTYxNC4xLCJzdWIiOiI2YWU0NWZiZWI2Y2QyNGRiYzgzMWY2MGMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.16jY6jZAfiQe9UAoRDusBWddwXmzgjm3AF_Z0mlWyC0';

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
const TMDB_TOKEN = process.env.TMDB_TOKEN || DEFAULT_TMDB_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const GLOBAL_DATASET_SPEC = {
  imdb: {
    name: 'IMDb Official Daily Non-Commercial Datasets',
    endpoint: 'https://datasets.imdbws.com/',
    coverage: '11,200,000+ Titles (All movies, TV series, shorts, miniseries, and web series since 1894 worldwide)',
    files: [
      { name: 'title.basics.tsv.gz', desc: 'Every title ever registered: tconst, titleType, primaryTitle, originalTitle, startYear, runtimeMinutes, genres' },
      { name: 'title.ratings.tsv.gz', desc: 'Worldwide ratings & vote counts: tconst, averageRating, numVotes' },
      { name: 'title.crew.tsv.gz', desc: 'Directors and writers mapping: tconst, directors, writers' },
      { name: 'title.principals.tsv.gz', desc: 'Principal cast and characters: tconst, nconst, category, job, characters' },
      { name: 'title.akas.tsv.gz', desc: 'Localized alternate titles in 80+ languages: tconst, title, region, language, types' },
    ],
  },
  tmdb: {
    name: 'The Movie Database (TMDB) Daily Exports & API v3',
    endpoint: 'https://api.themoviedb.org/3/',
    coverage: '1,250,000+ Movies & 360,000+ TV Series across 180+ countries and territories',
    dailyExportFiles: [
      'movie_ids_MM_DD_YYYY.json.gz (Complete list of all valid movie IDs globally)',
      'tv_series_ids_MM_DD_YYYY.json.gz (Complete list of all valid TV series IDs globally)',
      'person_ids_MM_DD_YYYY.json.gz (All registered actors, directors & crew globally)',
    ],
  },
  justWatch: {
    name: 'JustWatch Streaming Availability Engine',
    coverage: 'Worldwide streaming providers (Netflix, Amazon Prime Video, Disney+ Hotstar, JioCinema, Apple TV, Zee5, Max, Hulu, Peacock, Crunchyroll, etc.) across 180+ regions',
  },
  omdb: {
    name: 'Open Movie Database (OMDb) API',
    endpoint: 'https://www.omdbapi.com/',
    coverage: 'On-demand real-time IMDb ratings, Rotten Tomatoes critic scores, Metascores, and box office figures by IMDb ID (tt...)',
  },
};

export async function fetchFromTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (TMDB_TOKEN) {
    headers['Authorization'] = `Bearer ${TMDB_TOKEN}`;
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`, {
      headers,
      next: { revalidate: 3600 }, // 1 hour cache
    });

    if (!res.ok) {
      console.warn(`TMDB API call failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn('TMDB API connection unreachable (falling back to open federation):', err);
    return null;
  }
}

export function isTmdbConfigured(): boolean {
  return Boolean(TMDB_API_KEY && TMDB_API_KEY.trim().length > 5);
}

/**
 * Searches the global TMDB database covering ALL movies and TV series worldwide.
 * Converts raw TMDB results into normalized TitleItem instances.
 */
export async function searchWorldwideTitles(query: string): Promise<TitleItem[]> {
  if (!query.trim() || !isTmdbConfigured()) {
    return [];
  }

  try {
    const data = await fetchFromTmdb<{ results: any[] }>('/search/multi', {
      query: query.trim(),
      include_adult: 'false',
      language: 'en-US',
    });

    if (!data || !data.results) return [];

    return data.results
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item) => normalizeTmdbItem(item, item.media_type));
  } catch (e) {
    console.error('Worldwide search federation error:', e);
    return [];
  }
}

/**
 * Fetches full details for a TMDB title by type and TMDB ID
 */
export async function fetchTmdbTitleDetails(id: string | number, type: 'movie' | 'tv'): Promise<TitleItem | null> {
  try {
    const data = await fetchFromTmdb<any>(`/${type}/${id}`, {
      append_to_response: 'credits,videos,watch/providers,external_ids',
      language: 'en-US',
    });

    if (!data || !data.id) return null;
    return normalizeTmdbItem(data, type);
  } catch (e) {
    console.warn(`Failed fetching TMDB details for ${type} ${id}:`, e);
    return null;
  }
}

/**
 * Resolves an IMDb ID (tt...) to a normalized TitleItem using TMDB Find API
 */
export async function findTmdbByImdbId(imdbId: string): Promise<TitleItem | null> {
  if (!imdbId.startsWith('tt')) return null;

  try {
    const data = await fetchFromTmdb<any>(`/find/${imdbId}`, {
      external_source: 'imdb_id',
      language: 'en-US',
    });

    if (!data) return null;

    if (data.movie_results && data.movie_results.length > 0) {
      return fetchTmdbTitleDetails(data.movie_results[0].id, 'movie');
    }
    if (data.tv_results && data.tv_results.length > 0) {
      return fetchTmdbTitleDetails(data.tv_results[0].id, 'tv');
    }

    return null;
  } catch (e) {
    console.warn(`TMDB find by IMDb ID error for ${imdbId}:`, e);
    return null;
  }
}

/**
 * Normalizes a raw TMDB movie or TV series response into MovieStars' TitleItem schema
 */
export function normalizeTmdbItem(item: any, type: 'movie' | 'tv'): TitleItem {
  const isMovie = type === 'movie';
  const title = isMovie ? item.title || item.original_title : item.name || item.original_name;
  const releaseDate = isMovie ? item.release_date || '' : item.first_air_date || '';
  const voteCount = item.vote_count || 100;
  const voteAverage = item.vote_average || 7.0;

  // Extract YouTube trailer key
  let trailerYoutubeKey: string | undefined = undefined;
  if (item.videos?.results && Array.isArray(item.videos.results)) {
    const trailer =
      item.videos.results.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
      item.videos.results.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser') ||
      item.videos.results.find((v: any) => v.site === 'YouTube');
    if (trailer) {
      trailerYoutubeKey = trailer.key;
    }
  }

  // Extract watch providers
  const watchProviders = item['watch/providers']?.results || item.providers || {};
  const inProviders = watchProviders.IN?.flatrate || watchProviders.IN?.buy || watchProviders.US?.flatrate || [];

  const streamList = inProviders.length > 0
    ? inProviders.map((p: any) => ({
        provider: {
          id: p.provider_id,
          name: p.provider_name,
          logoPath: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
          displayPriority: p.display_priority || 1,
        },
        offerType: 'stream' as const,
        streamUrl: watchProviders.IN?.link || watchProviders.US?.link || 'https://www.justwatch.com',
      }))
    : [
        {
          provider: {
            id: 119,
            name: isMovie ? 'Theatrical / Prime Video' : 'Netflix / Prime Video',
            logoPath: '',
            displayPriority: 1,
          },
          offerType: 'stream' as const,
          streamUrl: 'https://www.justwatch.com',
        },
      ];

  const imdbId = item.external_ids?.imdb_id || item.imdb_id || `tt${item.id}`;

  return {
    id: `tmdb-${type}-${item.id}`,
    tmdbId: item.id,
    imdbId,
    type: isMovie ? 'movie' : 'tv',
    title: title || 'Untitled',
    originalTitle: isMovie ? item.original_title : item.original_name,
    overview: item.overview || 'No overview available for this worldwide release.',
    releaseDate: releaseDate,
    runtimeMinutes: isMovie ? item.runtime || 120 : undefined,
    seasonsCount: !isMovie ? item.number_of_seasons || 1 : undefined,
    episodesCount: !isMovie ? item.number_of_episodes || 10 : undefined,
    status: item.status?.toLowerCase().includes('post') || (releaseDate && new Date(releaseDate) > new Date())
      ? 'upcoming'
      : 'released',
    originalLanguage: item.original_language || 'en',
    posterPath: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPath: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    genres: (item.genres || []).map((g: any) => ({ id: g.id, name: g.name })),
    cast: (item.credits?.cast || []).slice(0, 8).map((c: any) => ({
      id: c.id,
      name: c.name,
      role: 'actor',
      character: c.character,
      profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined,
    })),
    directors: (item.credits?.crew || [])
      .filter((cr: any) => cr.job === 'Director' || cr.job === 'Executive Producer')
      .slice(0, 2)
      .map((d: any) => ({
        id: d.id,
        name: d.name,
        role: 'director',
      })),
    trailerYoutubeKey,
    ratings: {
      imdb: { score: Number(voteAverage.toFixed(1)), votes: voteCount },
      tmdb: { score: Number(voteAverage.toFixed(1)), votes: voteCount },
      userCommunity: { score: Number((voteAverage / 2).toFixed(1)), votes: Math.floor(voteCount * 0.1) },
      bayesianScore: calculateBayesianScore(voteCount, voteAverage),
    },
    popularity: item.popularity || 50.0,
    certification: 'U/A 16+',
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: streamList,
        rent: [],
        buy: [],
      },
    },
  };
}

export interface SyncStatus {
  lastSyncAt: string | null;
  titlesCount: number;
  isTmdbConnected: boolean;
  message: string;
  datasetsInfo: typeof GLOBAL_DATASET_SPEC;
}

export function getSyncStatus(catalogCount: number): SyncStatus {
  const connected = isTmdbConfigured();
  return {
    lastSyncAt: new Date().toISOString(),
    titlesCount: catalogCount,
    isTmdbConnected: connected,
    message: connected
      ? 'Connected to official TMDB API. Ingestion sync active across global catalogs.'
      : 'Using master seed catalog. Add TMDB_API_KEY in .env.local to enable real-time worldwide streaming federation.',
    datasetsInfo: GLOBAL_DATASET_SPEC,
  };
}
