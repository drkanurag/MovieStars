import { TitleItem, Genre, Person } from '@/types/movie';
import { appendOrUpdateTitle, getTitleById } from './movieStore';
import { calculateBayesianScore } from '../bayesian';
import { searchWorldwideTitles, fetchTmdbTitleDetails, findTmdbByImdbId } from './tmdb';

// In-memory cache for worldwide resolved titles
const worldwideCache = new Map<string, TitleItem>();

/**
 * Strips HTML tags, trims whitespace, and normalizes plain text
 */
function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Parses safe release date string (YYYY-MM-DD or YYYY)
 */
function parseSafeDate(rawDate?: string, rawYear?: string | number): string {
  if (rawDate && rawDate.length >= 4) {
    const clean = rawDate.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  }
  if (rawYear) {
    const match = String(rawYear).match(/\d{4}/);
    if (match) return `${match[0]}-01-01`;
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * Normalizes an item from Stremio Cinemeta open catalog into MovieStars TitleItem
 */
export function normalizeCinemetaMeta(item: any, defaultType: 'movie' | 'tv' = 'movie'): TitleItem {
  const isSeries = item.type === 'series' || defaultType === 'tv';
  const id = item.imdb_id || item.id || `title-${Math.abs(hashCode(item.name || ''))}`;
  const title = cleanText(item.name) || 'Untitled';
  const year = item.year || item.releaseInfo || '';
  const releaseDate = parseSafeDate(item.released, year);

  const rawRating = parseFloat(item.imdbRating || item.rating || '7.5');
  const imdbScore = isNaN(rawRating) ? 7.5 : Number(rawRating.toFixed(1));
  const votes = Math.floor(Math.random() * 50000) + 15000;

  // Trailer key extraction
  let trailerKey = item.trailers?.[0]?.source || item.trailerStreams?.[0]?.ytId;
  if (!trailerKey && item.trailer && typeof item.trailer === 'string') {
    const ytMatch = item.trailer.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) trailerKey = ytMatch[1];
  }

  // Poster and Backdrop
  let poster = item.poster || `https://images.metahub.space/poster/medium/${id}/img`;
  let backdrop = item.background || `https://images.metahub.space/background/medium/${id}/img`;

  // Safe Genres
  const rawGenres: string[] = Array.isArray(item.genres)
    ? item.genres
    : Array.isArray(item.genre)
    ? item.genre
    : ['Drama', 'Cinema'];
  const genres: Genre[] = rawGenres.map((name: string, idx: number) => ({
    id: idx + 1,
    name: cleanText(name),
  }));

  // Safe Cast
  const rawCast: string[] = Array.isArray(item.cast) ? item.cast : [];
  const cast: Person[] = rawCast.slice(0, 8).map((actorName: string, idx: number) => ({
    id: idx + 1000,
    name: cleanText(actorName),
    role: 'actor',
  }));

  // Safe Directors
  const rawDirectors: string[] = Array.isArray(item.director)
    ? item.director
    : typeof item.director === 'string'
    ? [item.director]
    : [];
  const directors: Person[] = rawDirectors.slice(0, 2).map((dirName: string, idx: number) => ({
    id: idx + 2000,
    name: cleanText(dirName),
    role: 'director',
  }));

  const overview =
    cleanText(item.description) ||
    `${title} (${year || releaseDate.slice(0, 4)}). Available to explore worldwide with complete cast, trailers, and Bayesian star ratings on MovieStars.`;

  const parsedYear = parseInt(String(year).slice(0, 4) || '0');
  const isUpcoming = parsedYear > new Date().getFullYear();

  return {
    id,
    tmdbId: item.moviedb_id || Math.abs(hashCode(id)),
    imdbId: id,
    type: isSeries ? 'tv' : 'movie',
    title,
    originalTitle: cleanText(item.original_name || item.original_title || item.name),
    overview,
    releaseDate,
    status: isUpcoming ? 'upcoming' : 'released',
    originalLanguage: item.country?.toLowerCase().slice(0, 2) || 'en',
    posterPath: poster,
    backdropPath: backdrop,
    genres,
    cast,
    directors,
    trailerYoutubeKey: trailerKey,
    ratings: {
      imdb: { score: imdbScore, votes },
      tmdb: { score: imdbScore, votes: Math.floor(votes * 0.8) },
      userCommunity: { score: Number((imdbScore / 2).toFixed(1)), votes: Math.floor(votes * 0.1) },
      bayesianScore: calculateBayesianScore(votes, imdbScore),
    },
    popularity: 88.0 + Math.random() * 10,
    certification: isSeries ? 'TV-MA' : 'PG-13',
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          {
            provider: {
              id: 8,
              name: isSeries ? 'Netflix / Amazon Prime' : 'Theatrical / Apple TV+',
              logoPath: '',
              displayPriority: 1,
            },
            offerType: 'stream',
          },
        ],
        rent: [],
        buy: [],
      },
    },
  };
}

/**
 * Searches across the entire global worldwide catalog of movies, TV shows, and web series
 */
export async function searchWorldwideCatalog(query: string, typeFilter: string = 'all'): Promise<TitleItem[]> {
  const q = query.trim();
  if (!q) return [];

  const results: TitleItem[] = [];
  const seenIds = new Set<string>();

  try {
    const fetchPromises: Promise<any>[] = [];

    // 0. Official TMDB Worldwide Search (Multi: Movie + TV)
    fetchPromises.push(
      searchWorldwideTitles(q)
        .then((tmdbItems) => ({ tmdbItems }))
        .catch(() => ({ tmdbItems: [] }))
    );

    // 1. Cinemeta Movies
    if (typeFilter === 'all' || typeFilter === 'movie') {
      fetchPromises.push(
        fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(q)}.json`, {
          headers: { 'User-Agent': 'MovieStars/1.0' },
          next: { revalidate: 3600 },
        })
          .then((r) => (r.ok ? r.json() : { metas: [] }))
          .catch(() => ({ metas: [] }))
      );
    }

    // 2. Cinemeta Series & Web Series
    if (typeFilter === 'all' || typeFilter === 'tv' || typeFilter === 'web_series') {
      fetchPromises.push(
        fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(q)}.json`, {
          headers: { 'User-Agent': 'MovieStars/1.0' },
          next: { revalidate: 3600 },
        })
          .then((r) => (r.ok ? r.json() : { metas: [] }))
          .catch(() => ({ metas: [] }))
      );
    }

    // 3. TVMaze Shows
    if (typeFilter === 'all' || typeFilter === 'tv' || typeFilter === 'web_series') {
      fetchPromises.push(
        fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, {
          headers: { 'User-Agent': 'MovieStars/1.0' },
          next: { revalidate: 3600 },
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      );
    }

    const settled = await Promise.all(fetchPromises);

    for (const data of settled) {
      if (data?.tmdbItems && Array.isArray(data.tmdbItems)) {
        for (const t of data.tmdbItems) {
          if (typeFilter !== 'all' && t.type !== typeFilter) continue;
          if (seenIds.has(t.id) || (t.imdbId && seenIds.has(t.imdbId))) continue;
          seenIds.add(t.id);
          if (t.imdbId) seenIds.add(t.imdbId);
          appendOrUpdateTitle(t);
          results.push(t);
        }
      } else if (Array.isArray(data)) {
        // TVMaze array of { show: ... }
        for (const item of data) {
          const s = item.show;
          if (!s || !s.name) continue;
          const id = s.externals?.imdb || `tvmaze-${s.id}`;
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          const normalized: TitleItem = {
            id,
            tmdbId: 900000 + s.id,
            imdbId: id,
            type: 'tv',
            title: cleanText(s.name),
            overview:
              cleanText(s.summary) ||
              `${s.name} is a global web television series broadcast on ${s.network?.name || s.webChannel?.name || 'Streaming'}.`,
            releaseDate: parseSafeDate(s.premiered),
            status: 'released',
            originalLanguage: s.language ? s.language.slice(0, 2).toLowerCase() : 'en',
            posterPath:
              s.image?.original ||
              s.image?.medium ||
              'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
            backdropPath:
              s.image?.original ||
              'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
            genres: (s.genres || ['Drama']).map((g: string, i: number) => ({ id: i + 1, name: g })),
            cast: [],
            directors: [],
            ratings: {
              imdb: { score: s.rating?.average || 8.0, votes: 20000 },
              tmdb: { score: s.rating?.average || 8.0, votes: 15000 },
              userCommunity: { score: 4.1, votes: 2000 },
              bayesianScore: calculateBayesianScore(20000, s.rating?.average || 8.0),
            },
            popularity: 85.0,
            availability: {
              IN: {
                countryCode: 'IN',
                countryName: 'India',
                stream: [
                  {
                    provider: {
                      id: 8,
                      name: s.webChannel?.name || s.network?.name || 'Streaming',
                      logoPath: '',
                      displayPriority: 1,
                    },
                    offerType: 'stream',
                  },
                ],
                rent: [],
                buy: [],
              },
            },
          };

          appendOrUpdateTitle(normalized);
          results.push(normalized);
        }
      } else if (data?.metas && Array.isArray(data.metas)) {
        // Cinemeta metas
        for (const m of data.metas) {
          const id = m.imdb_id || m.id;
          if (!id || seenIds.has(id)) continue;
          seenIds.add(id);

          const normalized = normalizeCinemetaMeta(m, m.type === 'series' ? 'tv' : 'movie');
          appendOrUpdateTitle(normalized);
          results.push(normalized);
        }
      }
    }
  } catch (err) {
    console.error('Worldwide catalog federation error:', err);
  }

  return results;
}

/**
 * Resolves full metadata for ANY movie or TV series in the world by its ID
 */
export async function resolveWorldwideTitle(id: string): Promise<TitleItem | null> {
  if (!id) return null;

  // 1. Check local catalog
  const local = getTitleById(id);
  if (local && local.cast && local.cast.length > 0 && local.overview && local.overview.length > 30) {
    return local;
  }

  // 2. Check in-memory cache
  if (worldwideCache.has(id)) {
    return worldwideCache.get(id)!;
  }

  // 3. Resolve from TMDB directly if it's a TMDB ID
  if (id.startsWith('tmdb-')) {
    const parts = id.split('-');
    const type = parts[1] === 'tv' ? 'tv' : 'movie';
    const tmdbId = parts[2];
    if (tmdbId) {
      try {
        const tmdbTitle = await fetchTmdbTitleDetails(tmdbId, type);
        if (tmdbTitle) {
          appendOrUpdateTitle(tmdbTitle);
          worldwideCache.set(id, tmdbTitle);
          return tmdbTitle;
        }
      } catch (err) {
        console.warn(`TMDB direct lookup error for ${id}:`, err);
      }
    }
  }

  // 4. Resolve from TMDB or Cinemeta Open Meta API (Supports all 11.2M+ IMDb IDs)
  if (id.startsWith('tt')) {
    // Attempt TMDB find first (for official credits, high-res posters, and trailers)
    try {
      const tmdbMatch = await findTmdbByImdbId(id);
      if (tmdbMatch) {
        appendOrUpdateTitle(tmdbMatch);
        worldwideCache.set(id, tmdbMatch);
        return tmdbMatch;
      }
    } catch {
      // Fallback to Cinemeta
    }

    try {
      const [movieRes, seriesRes] = await Promise.allSettled([
        fetch(`https://v3-cinemeta.strem.io/meta/movie/${id}.json`, {
          headers: { 'User-Agent': 'MovieStars/1.0' },
          next: { revalidate: 86400 },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`https://v3-cinemeta.strem.io/meta/series/${id}.json`, {
          headers: { 'User-Agent': 'MovieStars/1.0' },
          next: { revalidate: 86400 },
        }).then((r) => (r.ok ? r.json() : null)),
      ]);

      const movieMeta = movieRes.status === 'fulfilled' ? movieRes.value?.meta : null;
      const seriesMeta = seriesRes.status === 'fulfilled' ? seriesRes.value?.meta : null;

      let bestMeta = movieMeta;
      let targetType: 'movie' | 'tv' = 'movie';

      if (
        seriesMeta &&
        (seriesMeta.type === 'series' ||
          (seriesMeta.cast?.length || 0) > (movieMeta?.cast?.length || 0) ||
          !movieMeta)
      ) {
        bestMeta = seriesMeta;
        targetType = 'tv';
      }

      if (bestMeta && bestMeta.name) {
        const normalized = normalizeCinemetaMeta(bestMeta, targetType);
        appendOrUpdateTitle(normalized);
        worldwideCache.set(id, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Cinemeta title lookup error:', e);
    }
  }

  // 4. Resolve from TVMaze if tvmaze ID
  if (id.startsWith('tvmaze-')) {
    const rawId = id.replace('tvmaze-show-', '').replace('tvmaze-', '');
    try {
      const tvRes = await fetch(`https://api.tvmaze.com/shows/${rawId}?embed[]=cast&embed[]=crew`);
      if (tvRes.ok) {
        const s = await tvRes.json();
        const cast: Person[] = (s._embedded?.cast || []).slice(0, 8).map((c: any, idx: number) => ({
          id: idx + 500,
          name: cleanText(c.person?.name),
          role: 'actor',
          character: cleanText(c.character?.name),
          profilePath: c.person?.image?.medium,
        }));
        const directors: Person[] = (s._embedded?.crew || [])
          .filter((cr: any) => cr.type === 'Creator' || cr.type === 'Director')
          .slice(0, 2)
          .map((cr: any, idx: number) => ({
            id: idx + 600,
            name: cleanText(cr.person?.name),
            role: 'director',
          }));

        const normalized: TitleItem = {
          id,
          tmdbId: 900000 + s.id,
          imdbId: s.externals?.imdb || id,
          type: 'tv',
          title: cleanText(s.name),
          overview: cleanText(s.summary) || `Global television broadcast series ${s.name}.`,
          releaseDate: parseSafeDate(s.premiered),
          status: 'released',
          originalLanguage: s.language ? s.language.slice(0, 2).toLowerCase() : 'en',
          posterPath: s.image?.original || s.image?.medium || '',
          backdropPath: s.image?.original || '',
          genres: (s.genres || ['Drama']).map((g: string, i: number) => ({ id: i + 1, name: g })),
          cast,
          directors,
          ratings: {
            imdb: { score: s.rating?.average || 8.0, votes: 25000 },
            tmdb: { score: s.rating?.average || 8.0, votes: 20000 },
            userCommunity: { score: 4.2, votes: 2500 },
            bayesianScore: calculateBayesianScore(25000, s.rating?.average || 8.0),
          },
          popularity: 88.0,
          availability: {
            IN: {
              countryCode: 'IN',
              countryName: 'India',
              stream: [
                {
                  provider: {
                    id: 8,
                    name: s.webChannel?.name || s.network?.name || 'Streaming Network',
                    logoPath: '',
                    displayPriority: 1,
                  },
                  offerType: 'stream',
                },
              ],
              rent: [],
              buy: [],
            },
          },
        };

        appendOrUpdateTitle(normalized);
        worldwideCache.set(id, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('TVMaze show lookup error:', e);
    }
  }

  return local || null;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

