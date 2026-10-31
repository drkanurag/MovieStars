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

  public async handleRequest(service: string, action: string, params: Record<string, any> = {}): Promise<{ status: number; data?: any; error?: string; message?: string; [key: string]: any }> {
    // 1. Rate Limiting Check
    if (!this.clientRateLimiter.tryConsume(1)) {
      return {
        status: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded at API Gateway. Token bucket exhausted.',
      };
    }

    // Input Sanitization & Type Validation
    const cleanParams: Record<string, any> = {};
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === 'string') {
        cleanParams[k] = v.trim().slice(0, 1000); // Prevent unbounded string payloads
      } else {
        cleanParams[k] = v;
      }
    }

    // 2. Routing to Microservices
    switch (service) {
      case 'catalog': {
        const catalog = CatalogService.getInstance();
        if (action === 'get') {
          if (!cleanParams.id || typeof cleanParams.id !== 'string') {
            return { status: 400, error: 'A valid string ID parameter is required' };
          }
          return { status: 200, data: catalog.getTitleById(cleanParams.id) };
        }
        if (action === 'paginate') {
          const limit = Math.min(Math.max(1, parseInt(cleanParams.limit || '20', 10)), 100);
          return { status: 200, data: catalog.getTitlesPaginated(cleanParams.cursor, limit) };
        }
        if (action === 'similar') {
          if (!cleanParams.id || typeof cleanParams.id !== 'string') {
            return { status: 400, error: 'A valid string ID parameter is required' };
          }
          const limit = Math.min(Math.max(1, parseInt(cleanParams.limit || '4', 10)), 20);
          return { status: 200, data: catalog.getSimilarTitles(cleanParams.id, limit) };
        }
        return { status: 200, data: catalog.getAllTitles() };
      }

      case 'search': {
        const search = SearchService.getInstance();
        const q = String(cleanParams.q || '').slice(0, 100);
        const limit = Math.min(Math.max(1, parseInt(cleanParams.limit || '10', 10)), 50);
        if (action === 'autocomplete') {
          return { status: 200, data: search.searchAutocomplete(q, limit) };
        }
        return { status: 200, data: search.searchFullText(q, limit) };
      }

      case 'ratings': {
        const rating = RatingService.getInstance();
        if (action === 'top') {
          const limit = Math.min(Math.max(1, parseInt(cleanParams.limit || '10', 10)), 250);
          return { status: 200, data: rating.getTopKBest(limit) };
        }
        return { status: 200, data: rating.getStats() };
      }

      case 'availability': {
        const avail = AvailabilityService.getInstance();
        const matches = avail.queryByFilters(cleanParams);
        return { status: 200, data: { matchingTitleIds: Array.from(matches) } };
      }

      case 'user': {
        const userSvc = UserService.getInstance();
        if (action === 'register') {
          if (!cleanParams.email || !cleanParams.password) {
            return { status: 400, error: 'Email and password are required' };
          }
          const res = userSvc.register(cleanParams.email, cleanParams.password, cleanParams.displayName || '');
          return res.success ? { status: 201, data: res.session } : { status: 400, error: res.error };
        }
        if (action === 'login') {
          if (!cleanParams.email || !cleanParams.password) {
            return { status: 400, error: 'Email and password are required' };
          }
          const res = userSvc.login(cleanParams.email, cleanParams.password);
          return res.success ? { status: 200, data: res.session } : { status: 401, error: res.error };
        }
        if (action === 'google') {
          if (!cleanParams.idToken) {
            return { status: 400, error: 'Google ID Token is required for OAuth verification' };
          }
          const res = await userSvc.verifyAndLoginWithGoogle(cleanParams.idToken);
          return res.success ? { status: 200, data: res.session } : { status: 401, error: res.error };
        }
        if (action === 'me') {
          if (!cleanParams.token) {
            return { status: 401, error: 'Token is required' };
          }
          const session = userSvc.validateSession(cleanParams.token);
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
