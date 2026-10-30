import { TitleItem } from '@/types/movie';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { MinHeap } from '../ds/MinHeap';
import { calculateBayesianScore, DEFAULT_MIN_VOTES, DEFAULT_GLOBAL_MEAN } from '@/lib/bayesian';
import { EventBus } from '../events/EventBus';

export class RatingService {
  private static instance: RatingService;
  private minHeapTopK: MinHeap<TitleItem>;
  private ratingsMap: Map<string, TitleItem['ratings']>;

  private constructor() {
    this.minHeapTopK = new MinHeap<TitleItem>(250); // Store Top 250 in O(N log K) priority queue
    this.ratingsMap = new Map();
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
      this.ratingsMap.set(movie.id, movie.ratings);
      if (movie.status === 'released') {
        this.minHeapTopK.push(movie.ratings.bayesianScore, movie);
      }
    }
  }

  private registerEventSubscriptions(): void {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe<{ titleId: string; newStar: number }>('rating:submitted', (event) => {
      this.updateUserRating(event.payload.titleId, event.payload.newStar);
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

  public updateUserRating(titleId: string, stars: number): void {
    const existing = this.ratingsMap.get(titleId);
    if (existing) {
      const prevVotes = existing.userCommunity.votes;
      const prevScore = existing.userCommunity.score;
      const newVotes = prevVotes + 1;
      const newScore = Number(((prevScore * prevVotes + stars) / newVotes).toFixed(2));

      existing.userCommunity.votes = newVotes;
      existing.userCommunity.score = newScore;

      // Recalculate Bayesian score with updated community votes
      const totalVotes = existing.imdb.votes + newVotes;
      const combinedRaw = (existing.imdb.score * 0.7) + (newScore * 2 * 0.3); // convert 5-star to 10-scale
      existing.bayesianScore = this.computeBayesian(totalVotes, combinedRaw);
    }
  }

  public getStats() {
    return {
      topKHeapSize: this.minHeapTopK.size(),
      minScoreInHeap: this.minHeapTopK.peek()?.score ?? 0,
      thresholdVotes_m: DEFAULT_MIN_VOTES,
      globalMean_C: DEFAULT_GLOBAL_MEAN,
    };
  }
}

