import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { MinHeap } from '../ds/MinHeap';
import { calculateBayesianScore, DEFAULT_MIN_VOTES, DEFAULT_GLOBAL_MEAN } from '@/lib/bayesian';
import { EventBus } from '../events/EventBus';

export class RatingService {
  private static instance: RatingService;
  private minHeapTopK: MinHeap<TitleItem>;
  private ratingsMap: Map<string, TitleItem['ratings']>;
  private titlesMap: Map<string, TitleItem>;
  // titleId -> (userId -> stars)
  private userRatings: Map<string, Map<string, number>>;

  private constructor() {
    this.minHeapTopK = new MinHeap<TitleItem>(250); // Store Top 250 in O(N log K) priority queue
    this.ratingsMap = new Map();
    this.titlesMap = new Map();
    this.userRatings = new Map();
    this.initializeData();
    this.registerEventSubscriptions();
  }

  public static getInstance(): RatingService {
    if (!RatingService.instance) {
      RatingService.instance = new RatingService();
    }
    return RatingService.instance;
  }

  private initializeData(): void {
    for (const movie of INITIAL_MOVIES) {
      this.titlesMap.set(movie.id, { ...movie });
      this.ratingsMap.set(movie.id, { ...movie.ratings });
      if (movie.status === 'released') {
        this.minHeapTopK.push(movie.ratings.bayesianScore, movie);
      }
    }
  }

  private registerEventSubscriptions(): void {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe<{ titleId: string; userId?: string; newStar: number }>('rating:submitted', (event) => {
      this.submitUserRating(event.payload.titleId, event.payload.userId || 'anonymous', event.payload.newStar);
    });
  }

  /**
   * Computes Bayesian Weighted Rating
   */
  public computeBayesian(votes: number, rawScore: number, m = DEFAULT_MIN_VOTES, C = DEFAULT_GLOBAL_MEAN): number {
    return calculateBayesianScore(votes, rawScore, { minVotes: m, globalMean: C });
  }

  /**
   * Streaming Top-K ranked titles from Min-Heap
   */
  public getTopKBest(limit = 10): TitleItem[] {
    const top = this.minHeapTopK.getTopK();
    return top.slice(0, limit).map((item) => item.data);
  }

  /**
   * Idempotent user rating submission:
   * Replaces that user's previous rating if already rated rather than incrementing votes indefinitely.
   * Recalculates community score, updates Bayesian weighted rating, and refreshes the leaderboard heap.
   */
  public submitUserRating(titleId: string, userId: string, stars: number): TitleItem['ratings'] | null {
    let titleRatings = this.ratingsMap.get(titleId);
    let titleItem = this.titlesMap.get(titleId);

    if (!titleRatings) {
      titleRatings = {
        userCommunity: { score: 0, votes: 0 },
        bayesianScore: 5.0,
      };
      this.ratingsMap.set(titleId, titleRatings);
    }

    if (!this.userRatings.has(titleId)) {
      this.userRatings.set(titleId, new Map());
    }

    const titleUserMap = this.userRatings.get(titleId)!;
    const previousRating = titleUserMap.get(userId);

    const prevVotes = titleRatings.userCommunity?.votes || 0;
    const prevScore = titleRatings.userCommunity?.score || 0;

    let newVotes = prevVotes;
    let newScore = prevScore;

    if (previousRating !== undefined) {
      // User is updating their existing rating: adjust the total without changing the vote count
      const previousTotal = prevScore * prevVotes;
      const newTotal = previousTotal - previousRating + stars;
      newScore = prevVotes > 0 ? Number((newTotal / prevVotes).toFixed(2)) : stars;
    } else {
      // First-time rating by this user: increment the vote count
      newVotes = prevVotes + 1;
      const previousTotal = prevScore * prevVotes;
      newScore = Number(((previousTotal + stars) / newVotes).toFixed(2));
    }

    // Save user's updated rating
    titleUserMap.set(userId, stars);

    titleRatings.userCommunity = {
      score: newScore,
      votes: newVotes,
    };

    // Calculate updated combined score
    const extScore = titleRatings.imdb?.score || titleRatings.tmdb?.score || newScore * 2;
    const extVotes = titleRatings.imdb?.votes || titleRatings.tmdb?.votes || 100;
    const totalVotes = extVotes + newVotes;
    const combinedRaw = (extScore * 0.7) + (newScore * 2 * 0.3);

    titleRatings.bayesianScore = this.computeBayesian(totalVotes, combinedRaw);

    // Refresh title in local map and refresh Top-K Leaderboard Min-Heap
    if (titleItem) {
      titleItem.ratings = { ...titleRatings };
      this.refreshLeaderboardHeap();
    }

    return titleRatings;
  }

  public getUserRating(titleId: string, userId: string): number | null {
    return this.userRatings.get(titleId)?.get(userId) ?? null;
  }

  public getTitleRatings(titleId: string): TitleItem['ratings'] | undefined {
    return this.ratingsMap.get(titleId);
  }

  private refreshLeaderboardHeap(): void {
    // Reconstruct heap from updated titles map
    const newHeap = new MinHeap<TitleItem>(250);
    for (const title of this.titlesMap.values()) {
      if (title.status === 'released') {
        newHeap.push(title.ratings.bayesianScore, title);
      }
    }
    this.minHeapTopK = newHeap;
  }

  public getStats() {
    return {
      topKHeapSize: this.minHeapTopK.size(),
      minScoreInHeap: this.minHeapTopK.peek()?.score ?? 0,
      thresholdVotes_m: DEFAULT_MIN_VOTES,
      globalMean_C: DEFAULT_GLOBAL_MEAN,
      uniqueUsersRated: Array.from(this.userRatings.values()).reduce((acc, m) => acc + m.size, 0),
    };
  }
}
