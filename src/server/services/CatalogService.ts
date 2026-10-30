import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { LRUCache } from '../ds/LRUCache';
import { MovieGraph } from '../ds/MovieGraph';

export class CatalogService {
  private static instance: CatalogService;
  private titles: Map<string, TitleItem>;
  private lruCache: LRUCache<string, TitleItem>;
  private movieGraph: MovieGraph;

  private constructor() {
    this.titles = new Map();
    this.lruCache = new LRUCache<string, TitleItem>(50); // Cache 50 hottest titles in memory
    this.movieGraph = new MovieGraph();
    this.initializeData();
  }

  public static getInstance(): CatalogService {
    if (!CatalogService.instance) {
      CatalogService.instance = new CatalogService();
    }
    return CatalogService.instance;
  }

  private initializeData(): void {
    for (const movie of INITIAL_MOVIES) {
      this.titles.set(movie.id, movie);
      this.movieGraph.indexTitle(movie.id, {
        genres: movie.genres.map((g) => g.name),
        cast: movie.cast.map((c) => c.name),
        directors: movie.directors.map((d) => d.name),
      });
    }
  }

  /**
   * O(1) Title Detail Lookup using LRU Cache with fallback to primary store
   */
  public getTitleById(id: string): TitleItem | null {
    const cached = this.lruCache.get(id);
    if (cached) return cached;

    const title = this.titles.get(id) || null;
    if (title) {
      this.lruCache.put(id, title);
    }
    return title;
  }

  /**
   * Keyset / Cursor-Based Pagination
   * Avoids high-cost SQL OFFSET by paginating with (lastReleaseDate, lastId)
   */
  public getTitlesPaginated(cursor?: string, limit = 10): {
    items: TitleItem[];
    nextCursor: string | null;
    hasMore: boolean;
  } {
    const all = Array.from(this.titles.values()).sort(
      (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );

    let startIndex = 0;
    if (cursor) {
      const idx = all.findIndex((t) => t.id === cursor);
      if (idx >= 0) {
        startIndex = idx + 1;
      }
    }

    const items = all.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < all.length;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  /**
   * Graph-Based Recommendations based on Jaccard neighbor overlap
   */
  public getSimilarTitles(titleId: string, limit = 4): TitleItem[] {
    const allIds = Array.from(this.titles.keys());
    const similar = this.movieGraph.findSimilarMovies(titleId, allIds, limit);

    return similar
      .map((s) => this.getTitleById(s.titleId))
      .filter((t): t is TitleItem => t !== null);
  }

  public addOrUpdateTitle(title: TitleItem): void {
    this.titles.set(title.id, title);
    this.lruCache.put(title.id, title);
    this.movieGraph.indexTitle(title.id, {
      genres: title.genres.map((g) => g.name),
      cast: title.cast.map((c) => c.name),
      directors: title.directors.map((d) => d.name),
    });
  }

  public getAllTitles(): TitleItem[] {
    return Array.from(this.titles.values());
  }

  public getCacheStats() {
    return this.lruCache.getStats();
  }

  public getGraphStats() {
    return this.movieGraph.getStats();
  }
}

