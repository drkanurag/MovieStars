import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { SetIntersectionEngine } from '../ds/SetIntersection';

export class AvailabilityService {
  private static instance: AvailabilityService;
  // Inverted indexes for fast set intersections:
  private genreIndex: Map<string, Set<string>>;
  private platformIndex: Map<string, Set<string>>;
  private languageIndex: Map<string, Set<string>>;
  private typeIndex: Map<string, Set<string>>;

  private constructor() {
    this.genreIndex = new Map();
    this.platformIndex = new Map();
    this.languageIndex = new Map();
    this.typeIndex = new Map();
    this.buildFilterIndexes();
  }

  public static getInstance(): AvailabilityService {
    if (!AvailabilityService.instance) {
      AvailabilityService.instance = new AvailabilityService();
    }
    return AvailabilityService.instance;
  }

  private buildFilterIndexes(): void {
    for (const movie of INITIAL_MOVIES) {
      // Index Type
      if (!this.typeIndex.has(movie.type)) this.typeIndex.set(movie.type, new Set());
      this.typeIndex.get(movie.type)!.add(movie.id);

      // Index Language
      const lang = movie.originalLanguage.toLowerCase();
      if (!this.languageIndex.has(lang)) this.languageIndex.set(lang, new Set());
      this.languageIndex.get(lang)!.add(movie.id);

      // Index Genres
      for (const g of movie.genres) {
        const gn = g.name.toLowerCase();
        if (!this.genreIndex.has(gn)) this.genreIndex.set(gn, new Set());
        this.genreIndex.get(gn)!.add(movie.id);
      }

      // Index Platforms for India (IN)
      const inData = movie.availability['IN'];
      if (inData) {
        const allOffers = [...inData.stream, ...inData.rent, ...inData.buy];
        for (const offer of allOffers) {
          const prov = offer.provider.name.toLowerCase();
          if (!this.platformIndex.has(prov)) this.platformIndex.set(prov, new Set());
          this.platformIndex.get(prov)!.add(movie.id);
        }
      }
    }
  }

  /**
   * Fast multi-filter query using Set Intersection:
   * Returns Set<titleId> matching genre ∩ platform ∩ language ∩ type
   */
  public queryByFilters(filters: {
    type?: string;
    genre?: string;
    language?: string;
    platform?: string;
  }): Set<string> {
    const candidateSets: Set<string>[] = [];

    if (filters.type && filters.type !== 'all' && this.typeIndex.has(filters.type)) {
      candidateSets.push(this.typeIndex.get(filters.type)!);
    }
    if (filters.genre && filters.genre !== 'all' && this.genreIndex.has(filters.genre.toLowerCase())) {
      candidateSets.push(this.genreIndex.get(filters.genre.toLowerCase())!);
    }
    if (filters.language && filters.language !== 'all' && this.languageIndex.has(filters.language.toLowerCase())) {
      candidateSets.push(this.languageIndex.get(filters.language.toLowerCase())!);
    }
    if (filters.platform && filters.platform !== 'all') {
      const matchKey = Array.from(this.platformIndex.keys()).find((k) =>
        k.includes(filters.platform!.toLowerCase())
      );
      if (matchKey) {
        candidateSets.push(this.platformIndex.get(matchKey)!);
      }
    }

    if (candidateSets.length === 0) {
      // No strict filters applied, return all titles
      return new Set(INITIAL_MOVIES.map((m) => m.id));
    }

    return SetIntersectionEngine.intersectMany(candidateSets);
  }

  public getStats() {
    return {
      indexedPlatforms: this.platformIndex.size,
      indexedGenres: this.genreIndex.size,
      indexedLanguages: this.languageIndex.size,
    };
  }
}

