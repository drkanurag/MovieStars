import { TitleItem } from '@/types/movie';
import { BloomFilter } from '../ds/BloomFilter';
import { TokenBucketRateLimiter } from '../resilience/RateLimiter';
import { CircuitBreaker } from '../resilience/CircuitBreaker';
import { EventBus } from '../events/EventBus';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';

export interface IngestionJobResult {
  jobId: string;
  processedCount: number;
  skippedDuplicates: number;
  publishedEvents: number;
  durationMs: number;
  bloomFilterStats: any;
}

export class IngestionService {
  private static instance: IngestionService;
  private bloomFilter: BloomFilter;
  private rateLimiter: TokenBucketRateLimiter;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.bloomFilter = new BloomFilter(50000, 4);
    // Rate limit: 30 calls burst, 5 calls/sec (respects TMDB 40 req / 10s rules)
    this.rateLimiter = new TokenBucketRateLimiter(30, 5);
    this.circuitBreaker = new CircuitBreaker('TMDB-Sync-Service', { failureThreshold: 3, resetTimeoutMs: 5000 });
    this.primeBloomFilter();
  }

  public static getInstance(): IngestionService {
    if (!IngestionService.instance) {
      IngestionService.instance = new IngestionService();
    }
    return IngestionService.instance;
  }

  private primeBloomFilter(): void {
    for (const movie of INITIAL_MOVIES) {
      this.bloomFilter.add(`tmdb:${movie.tmdbId}`);
      this.bloomFilter.add(`imdb:${movie.imdbId}`);
    }
  }

  /**
   * Idempotent Ingestion Sync Run
   */
  public async runSyncJob(): Promise<IngestionJobResult> {
    const start = Date.now();
    let processed = 0;
    let skipped = 0;
    let published = 0;

    // Simulate batch fetching incoming delta records
    const incomingCandidates = [
      ...INITIAL_MOVIES,
      {
        id: 'gladiator-2-2024',
        tmdbId: 558449,
        imdbId: 'tt9603212',
        type: 'movie' as const,
        title: 'Gladiator II',
        overview: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered.',
        releaseDate: '2024-11-22',
        runtimeMinutes: 148,
        status: 'released' as const,
        originalLanguage: 'en',
        posterPath: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/w1280/euYIwmwkmz95mnXvufEmbL69nvC.jpg',
        genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }],
        cast: [{ id: 1972974, name: 'Paul Mescal', role: 'actor' as const, character: 'Lucius Verus' }],
        directors: [{ id: 578, name: 'Ridley Scott', role: 'director' as const }],
        trailerYoutubeKey: '4rgYUipGJNo',
        popularity: 91.5,
        ratings: {
          imdb: { score: 7.0, votes: 98000 },
          tmdb: { score: 6.9, votes: 1200 },
          userCommunity: { score: 4.2, votes: 310 },
          bayesianScore: 6.95,
        },
        availability: {
          IN: {
            countryCode: 'IN',
            countryName: 'India',
            stream: [{ provider: { id: 119, name: 'Amazon Prime Video', logoPath: '', displayPriority: 1 }, offerType: 'stream' as const }],
            rent: [],
            buy: [],
          },
        },
      },
    ];

    for (const candidate of incomingCandidates) {
      // 1. Check Rate Limiter
      const allowed = this.rateLimiter.tryConsume(1);
      if (!allowed) {
        // In production, task waits in a delay queue
      }

      // 2. Check Bloom Filter for Idempotency
      const key = `tmdb:${candidate.tmdbId}`;
      if (this.bloomFilter.mightContain(key)) {
        skipped++;
        continue;
      }

      // 3. Ingest and Add to Bloom Filter
      this.bloomFilter.add(key);
      this.bloomFilter.add(`imdb:${candidate.imdbId}`);
      processed++;

      // 4. Publish Event asynchronously to EventBus
      await EventBus.getInstance().publish('title:ingested', candidate, 'IngestionService');
      published++;
    }

    return {
      jobId: `job_${Date.now()}`,
      processedCount: processed,
      skippedDuplicates: skipped,
      publishedEvents: published,
      durationMs: Date.now() - start,
      bloomFilterStats: this.bloomFilter.getStats(),
    };
  }

  public getStats() {
    return {
      bloomFilter: this.bloomFilter.getStats(),
      rateLimiterAvailableTokens: this.rateLimiter.getAvailableTokens(),
      circuitBreakerStatus: this.circuitBreaker.getStatus(),
    };
  }
}

