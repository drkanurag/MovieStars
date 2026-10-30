import { CatalogService } from '../services/CatalogService';
import { SearchService } from '../services/SearchService';
import { RatingService } from '../services/RatingService';
import { AvailabilityService } from '../services/AvailabilityService';
import { IngestionService } from '../services/IngestionService';
import { UserService } from '../services/UserService';
import { TokenBucketRateLimiter } from '../resilience/RateLimiter';
import { CircuitBreaker } from '../resilience/CircuitBreaker';
import { EventBus } from '../events/EventBus';

export class ApiGateway {
  private static instance: ApiGateway;
  private clientRateLimiter: TokenBucketRateLimiter;
  private catalogBreaker: CircuitBreaker;
  private searchBreaker: CircuitBreaker;
  private ratingBreaker: CircuitBreaker;

  private constructor() {
    // Edge Gateway rate limit: 100 requests capacity, 20 requests/sec
    this.clientRateLimiter = new TokenBucketRateLimiter(100, 20);
    this.catalogBreaker = new CircuitBreaker('Catalog-Service');
    this.searchBreaker = new CircuitBreaker('Search-Service');
    this.ratingBreaker = new CircuitBreaker('Rating-Service');
  }

  public static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }

  public handleRequest(service: string, action: string, params: any = {}) {
    // 1. Rate Limiting Check
    if (!this.clientRateLimiter.tryConsume(1)) {
      return {
        status: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded at API Gateway. Token bucket exhausted.',
      };
    }

    // 2. Routing to Microservices
    switch (service) {
      case 'catalog': {
        const catalog = CatalogService.getInstance();
        if (action === 'get') {
          return { status: 200, data: catalog.getTitleById(params.id) };
        }
        if (action === 'paginate') {
          return { status: 200, data: catalog.getTitlesPaginated(params.cursor, params.limit) };
        }
        if (action === 'similar') {
          return { status: 200, data: catalog.getSimilarTitles(params.id, params.limit) };
        }
        return { status: 200, data: catalog.getAllTitles() };
      }

      case 'search': {
        const search = SearchService.getInstance();
        if (action === 'autocomplete') {
          return { status: 200, data: search.searchAutocomplete(params.q, params.limit) };
        }
        return { status: 200, data: search.searchFullText(params.q, params.limit) };
      }

      case 'ratings': {
        const rating = RatingService.getInstance();
        if (action === 'top') {
          return { status: 200, data: rating.getTopKBest(params.limit) };
        }
        return { status: 200, data: rating.getStats() };
      }

      case 'availability': {
        const avail = AvailabilityService.getInstance();
        const matches = avail.queryByFilters(params);
        return { status: 200, data: { matchingTitleIds: Array.from(matches) } };
      }

      case 'user': {
        const userSvc = UserService.getInstance();
        if (action === 'register') {
          const res = userSvc.register(params.email, params.password, params.displayName);
          return res.success ? { status: 201, data: res.session } : { status: 400, error: res.error };
        }
        if (action === 'login') {
          const res = userSvc.login(params.email, params.password);
          return res.success ? { status: 200, data: res.session } : { status: 401, error: res.error };
        }
        if (action === 'google') {
          const session = userSvc.loginWithGoogle(params.email, params.displayName, params.avatarUrl);
          return { status: 200, data: session };
        }
        if (action === 'me') {
          const session = userSvc.validateSession(params.token);
          return session ? { status: 200, data: session } : { status: 401, error: 'Unauthorized' };
        }
        return { status: 400, error: 'Invalid user action' };
      }

      case 'ingestion': {
        const ingestion = IngestionService.getInstance();
        return { status: 200, data: ingestion.getStats() };
      }

      case 'health':
      default: {
        return {
          status: 200,
          timestamp: new Date().toISOString(),
          gateway: {
            rateLimiterTokens: this.clientRateLimiter.getAvailableTokens(),
            circuitBreakers: [
              this.catalogBreaker.getStatus(),
              this.searchBreaker.getStatus(),
              this.ratingBreaker.getStatus(),
            ],
          },
          services: {
            catalog: CatalogService.getInstance().getCacheStats(),
            search: SearchService.getInstance().getStats(),
            ratings: RatingService.getInstance().getStats(),
            availability: AvailabilityService.getInstance().getStats(),
            ingestion: IngestionService.getInstance().getStats(),
          },
          recentBrokerEvents: EventBus.getInstance().getRecentEvents(5),
        };
      }
    }
  }
}
