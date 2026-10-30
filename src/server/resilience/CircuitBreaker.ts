/**
 * Circuit Breaker Pattern
 * 
 * Protects system from cascading failures when third-party APIs (TMDB/OMDb)
 * or remote microservices become degraded or unresponsive.
 * 
 * States:
 * - CLOSED: Normal operations, calls flow through.
 * - OPEN: Downstream is failing, immediately fail fast / return fallback.
 * - HALF_OPEN: Trial period to test if downstream has recovered.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number; // e.g. 3 consecutive failures
  resetTimeoutMs: number; // e.g. 10000ms before attempting half-open
}

export class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private lastFailureTime: number;
  private options: CircuitBreakerOptions;
  private serviceName: string;

  constructor(serviceName: string, options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeoutMs: 8000 }) {
    this.serviceName = serviceName;
    this.options = options;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  public async execute<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if open circuit has timed out to half-open
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.options.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        // Fast-fail: Circuit is OPEN
        return fallback();
      }
    }

    try {
      const result = await action();
      // On success in HALF_OPEN, reset circuit back to CLOSED
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = now;

      if (this.failureCount >= this.options.failureThreshold) {
        this.state = 'OPEN';
      }

      return fallback();
    }
  }

  public getState(): CircuitState {
    return this.state;
  }

  public getStatus() {
    return {
      service: this.serviceName,
      state: this.state,
      failures: this.failureCount,
      lastFailure: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }
}

