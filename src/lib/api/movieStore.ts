import { TitleItem, FilterOptions } from '@/types/movie';
import { INITIAL_MOVIES } from '../data/mockMovies';

let inMemoryCatalog: TitleItem[] = [...INITIAL_MOVIES];

export function getCatalog(): TitleItem[] {
  return inMemoryCatalog;
}

export function getTitleById(id: string): TitleItem | undefined {
  return inMemoryCatalog.find(
    (item) => item.id === id || String(item.tmdbId) === id || item.imdbId === id
  );
}

export function getUpcomingTitles(): TitleItem[] {
  return inMemoryCatalog
    .filter((item) => item.status === 'upcoming')
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
}

export function getTrendingTitles(): TitleItem[] {
  return [...inMemoryCatalog].sort((a, b) => b.popularity - a.popularity);
}

export function getBestOfAllTime(): TitleItem[] {
  return [...inMemoryCatalog]
    .filter((item) => item.status === 'released')
    .sort((a, b) => b.ratings.bayesianScore - a.ratings.bayesianScore);
}

export function filterAndSortTitles(filters: Partial<FilterOptions>): {
  items: TitleItem[];
  total: number;
} {
  let result = [...inMemoryCatalog];

  // Filter by Type
  if (filters.type && filters.type !== 'all') {
    result = result.filter((item) => item.type === filters.type);
  }

  // Filter by Genre
  if (filters.genre && filters.genre !== 'all') {
    result = result.filter((item) =>
      item.genres.some((g) => g.name.toLowerCase() === filters.genre?.toLowerCase())
    );
  }

  // Filter by Language
  if (filters.language && filters.language !== 'all') {
    result = result.filter(
      (item) => item.originalLanguage.toLowerCase() === filters.language?.toLowerCase()
    );
  }

  // Filter by Release Year
  if (filters.year && filters.year !== 'all') {
    result = result.filter((item) => item.releaseDate.startsWith(filters.year!));
  }

  // Filter by Minimum Rating (scale 0-5 stars)
  if (filters.ratingMin !== undefined && filters.ratingMin > 0) {
    result = result.filter(
      (item) => item.ratings.bayesianScore / 2 >= filters.ratingMin!
    );
  }

  // Filter by Streaming Platform
  if (filters.provider && filters.provider !== 'all') {
    const country = filters.country || 'IN';
    result = result.filter((item) => {
      const regionData = item.availability[country] || item.availability['IN'];
      if (!regionData) return false;
      const allOffers = [...regionData.stream, ...regionData.rent, ...regionData.buy];
      return allOffers.some(
        (o) =>
          o.provider.name.toLowerCase().includes(filters.provider!.toLowerCase()) ||
          o.provider.id.toString() === filters.provider
      );
    });
  }

  // Search Query
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.overview.toLowerCase().includes(q) ||
        item.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        item.directors.some((d) => d.name.toLowerCase().includes(q))
    );
  }

  // Sorting
  const sortBy = filters.sortBy || 'bayesian';
  switch (sortBy) {
    case 'bayesian':
      result.sort((a, b) => b.ratings.bayesianScore - a.ratings.bayesianScore);
      break;
    case 'popularity':
      result.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'releaseDate':
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      break;
    case 'votes':
      result.sort((a, b) => {
        const aVotes = (a.ratings.imdb?.votes ?? 0) + (a.ratings.tmdb?.votes ?? 0);
        const bVotes = (b.ratings.imdb?.votes ?? 0) + (b.ratings.tmdb?.votes ?? 0);
        return bVotes - aVotes;
      });
      break;
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  return {
    items: result,
    total: result.length,
  };
}

export function searchCatalogAutocomplete(query: string, limit = 6) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  return inMemoryCatalog
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        item.directors.some((d) => d.name.toLowerCase().includes(q))
    )
    .slice(0, limit);
}

export function appendOrUpdateTitle(title: TitleItem) {
  const index = inMemoryCatalog.findIndex((t) => t.id === title.id || t.tmdbId === title.tmdbId);
  if (index >= 0) {
    inMemoryCatalog[index] = title;
  } else {
    inMemoryCatalog.unshift(title);
  }
}

