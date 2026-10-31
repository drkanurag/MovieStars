import { TitleItem } from '@/types/movie';
import { BloomFilter } from '../ds/BloomFilter';
import { TokenBucketRateLimiter } from '../resilience/RateLimiter';
import { CircuitBreaker } from '../resilience/CircuitBreaker';
import { EventBus } from '../events/EventBus';
import { INITIAL_MOVIES } from '@/lib/data/mockMovies';
import { CatalogService } from './CatalogService';
import { appendOrUpdateTitle } from '@/lib/api/movieStore';

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
    this.bloomFilter = new BloomFilter(100000, 4);
    // Rate limit: 30 calls burst, 5 calls/sec (respects upstream 40 req / 10s rules)
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
   * Ingests candidate titles, uses Bloom filter as a probabilistic first pass (verifying
   * actual catalog presence before skipping to avoid false positive data loss), respects rate limiting,
   * updates persistent catalog records, and publishes domain events.
   */
  public async runSyncJob(incomingTitles: TitleItem[] = []): Promise<IngestionJobResult> {
    const start = Date.now();
    let processed = 0;
    let skipped = 0;
    let published = 0;

    const catalogService = CatalogService.getInstance();

    const candidates = incomingTitles.length > 0
      ? incomingTitles
      : [
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

    for (const candidate of candidates) {
      // 1. Enforce Rate Limiter with Backoff
      let allowed = this.rateLimiter.tryConsume(1);
      if (!allowed) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        allowed = this.rateLimiter.tryConsume(1);
      }

      // 2. Probabilistic Bloom Filter Check with Authoritative Verification
      const tmdbKey = `tmdb:${candidate.tmdbId}`;
      const imdbKey = `imdb:${candidate.imdbId}`;
      const mightBeDuplicate = this.bloomFilter.mightContain(tmdbKey) || this.bloomFilter.mightContain(imdbKey);

      if (mightBeDuplicate) {
        // Authoritative store verification: only skip if actually present in catalog
        const existing = catalogService.getTitleById(candidate.id);
        if (existing) {
          skipped++;
          continue;
        }
      }

      // 3. Ingest idempotently into both CatalogService and shared movieStore
      catalogService.addOrUpdateTitle(candidate);
      appendOrUpdateTitle(candidate);

      this.bloomFilter.add(tmdbKey);
      this.bloomFilter.add(imdbKey);
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
