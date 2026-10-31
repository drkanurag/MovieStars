import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { SetIntersectionEngine } from '../ds/SetIntersection';

export class AvailabilityService {
  private static instance: AvailabilityService;
  // Inverted indexes for fast set intersections:
  private genreIndex: Map<string, Set<string>>;
  // country -> platform -> Set<titleId>
  private platformIndex: Map<string, Map<string, Set<string>>>;
  private languageIndex: Map<string, Set<string>>;
  private typeIndex: Map<string, Set<string>>;
  private originCountryIndex: Map<string, Set<string>>;

  private constructor() {
    this.genreIndex = new Map();
    this.platformIndex = new Map();
    this.languageIndex = new Map();
    this.typeIndex = new Map();
    this.originCountryIndex = new Map();
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
      this.indexTitle(movie);
    }
  }

  public indexTitle(movie: TitleItem): void {
    // Index Type
    if (!this.typeIndex.has(movie.type)) this.typeIndex.set(movie.type, new Set());
    this.typeIndex.get(movie.type)!.add(movie.id);

    // Index Language
    const lang = movie.originalLanguage.toLowerCase();
    if (!this.languageIndex.has(lang)) this.languageIndex.set(lang, new Set());
    this.languageIndex.get(lang)!.add(movie.id);

    // Index Origin Country
    if (movie.originCountry) {
      const oc = movie.originCountry.toUpperCase();
      if (!this.originCountryIndex.has(oc)) this.originCountryIndex.set(oc, new Set());
      this.originCountryIndex.get(oc)!.add(movie.id);
    }

    // Index Genres
    for (const g of movie.genres) {
      const gn = g.name.toLowerCase();
      if (!this.genreIndex.has(gn)) this.genreIndex.set(gn, new Set());
      this.genreIndex.get(gn)!.add(movie.id);
    }

    // Index Platforms by Country Region
    for (const [countryCode, regionData] of Object.entries(movie.availability)) {
      const code = countryCode.toUpperCase();
      if (!this.platformIndex.has(code)) {
        this.platformIndex.set(code, new Map());
      }
      const countryMap = this.platformIndex.get(code)!;

      const allOffers = [...regionData.stream, ...regionData.rent, ...regionData.buy];
      for (const offer of allOffers) {
        const prov = offer.provider.name.toLowerCase();
        if (!countryMap.has(prov)) countryMap.set(prov, new Set());
        countryMap.get(prov)!.add(movie.id);
      }
    }
  }

  /**
   * Multi-filter query using Set Intersection:
   * Returns Set<titleId> matching genre ∩ platform ∩ language ∩ type ∩ country.
   * Unknown filter values return empty sets (zero matches) instead of being silently ignored.
   */
  public queryByFilters(filters: {
    type?: string;
    genre?: string;
    language?: string;
    platform?: string;
    country?: string;
    originCountry?: string;
  }): Set<string> {
    const candidateSets: Set<string>[] = [];
    const country = (filters.country || 'IN').toUpperCase();

    // 1. Type Filter
    if (filters.type && filters.type !== 'all') {
      const targetType = filters.type.toLowerCase();
      if (this.typeIndex.has(targetType)) {
        candidateSets.push(this.typeIndex.get(targetType)!);
      } else {
        // Unknown filter type: explicitly returns 0 matches
        return new Set();
      }
    }

    // 2. Genre Filter
    if (filters.genre && filters.genre !== 'all') {
      const targetGenre = filters.genre.toLowerCase();
      if (this.genreIndex.has(targetGenre)) {
        candidateSets.push(this.genreIndex.get(targetGenre)!);
      } else {
        // Unknown genre: returns 0 matches
        return new Set();
      }
    }

    // 3. Language Filter
    if (filters.language && filters.language !== 'all') {
      const targetLang = filters.language.toLowerCase();
      if (this.languageIndex.has(targetLang)) {
        candidateSets.push(this.languageIndex.get(targetLang)!);
      } else {
        // Unknown language: returns 0 matches
        return new Set();
      }
    }

    // 4. Origin Country Filter
    if (filters.originCountry && filters.originCountry !== 'all') {
      const targetOrigin = filters.originCountry.toUpperCase();
      if (this.originCountryIndex.has(targetOrigin)) {
        candidateSets.push(this.originCountryIndex.get(targetOrigin)!);
      } else {
        // Unknown origin country: returns 0 matches
        return new Set();
      }
    }

    // 5. Platform & Region Filter
    if (filters.platform && filters.platform !== 'all') {
      const targetProv = filters.platform.toLowerCase();
      const countryMap = this.platformIndex.get(country) || this.platformIndex.get('IN');
      if (!countryMap) {
        return new Set();
      }

      const matchKey = Array.from(countryMap.keys()).find((k) => k.includes(targetProv));
      if (matchKey) {
        candidateSets.push(countryMap.get(matchKey)!);
      } else {
        // Unknown platform: returns 0 matches
        return new Set();
      }
    }

    if (candidateSets.length === 0) {
      // No filters applied, return all titles
      return new Set(INITIAL_MOVIES.map((m) => m.id));
    }

    return SetIntersectionEngine.intersectMany(candidateSets);
  }

  public getStats() {
    return {
      indexedCountries: this.platformIndex.size,
      indexedGenres: this.genreIndex.size,
      indexedLanguages: this.languageIndex.size,
      indexedTypes: this.typeIndex.size,
    };
  }
}
