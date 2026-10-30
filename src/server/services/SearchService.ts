import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { AutocompleteTrie, TrieResult } from '../ds/Trie';
import { InvertedIndex } from '../ds/InvertedIndex';
import { EventBus } from '../events/EventBus';

export class SearchService {
  private static instance: SearchService;
  private trie: AutocompleteTrie;
  private invertedIndex: InvertedIndex;

  private constructor() {
    this.trie = new AutocompleteTrie();
    this.invertedIndex = new InvertedIndex();
    this.buildIndex();
    this.registerEventSubscriptions();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  private buildIndex(): void {
    for (const movie of INITIAL_MOVIES) {
      this.indexTitle(movie);
    }
  }

  private registerEventSubscriptions(): void {
    const eventBus = EventBus.getInstance();
    // Asynchronous event subscriber: When IngestionService pulls new title, index it!
    eventBus.subscribe<TitleItem>('title:ingested', (event) => {
      this.indexTitle(event.payload);
    });
  }

  public indexTitle(movie: TitleItem): void {
    const entry: TrieResult = {
      titleId: movie.id,
      title: movie.title,
      type: movie.type,
      score: movie.ratings.bayesianScore,
    };

    // Insert title into Trie
    this.trie.insert(movie.title, entry);

    // Also insert cast & directors so users can search by actor name
    for (const c of movie.cast) {
      this.trie.insert(c.name, entry);
    }
    for (const d of movie.directors) {
      this.trie.insert(d.name, entry);
    }

    // Insert into Inverted Index for BM25 full-text matching
    this.invertedIndex.addDocument(movie.id, {
      title: movie.title,
      overview: movie.overview,
      keywords: [
        ...movie.genres.map((g) => g.name),
        ...movie.cast.map((c) => c.name),
        ...movie.directors.map((d) => d.name),
      ],
    });
  }

  /**
   * O(L) Instant Prefix Autocomplete
   */
  public searchAutocomplete(query: string, limit = 6): TrieResult[] {
    return this.trie.searchPrefix(query, limit);
  }

  /**
   * Full-text search with Inverted Index
   */
  public searchFullText(query: string, limit = 10): Array<{ titleId: string; score: number }> {
    return this.invertedIndex.search(query, limit);
  }

  public getStats() {
    return {
      trieNodes: this.trie.getNodeCount(),
      vocabularyTerms: this.invertedIndex.getVocabularySize(),
    };
  }
}

