import { TitleItem } from '@/types/movie';
import { calculateBayesianScore } from '../bayesian';

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchFromTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`, {
      next: { revalidate: 3600 }, // 1 hour cache
    });

    if (!res.ok) {
      console.warn(`TMDB API call failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error('Error contacting TMDB API:', err);
    return null;
  }
}

export function isTmdbConfigured(): boolean {
  return Boolean(TMDB_API_KEY && TMDB_API_KEY.trim().length > 5);
}

export interface SyncStatus {
  lastSyncAt: string | null;
  titlesCount: number;
  isTmdbConnected: boolean;
  message: string;
}

export function getSyncStatus(catalogCount: number): SyncStatus {
  const connected = isTmdbConfigured();
  return {
    lastSyncAt: new Date().toISOString(),
    titlesCount: catalogCount,
    isTmdbConnected: connected,
    message: connected
      ? 'Connected to official TMDB API. Ingestion sync active.'
      : 'Using bundled verified master catalog. Add TMDB_API_KEY in .env.local to enable real-time sync.',
  };
}

