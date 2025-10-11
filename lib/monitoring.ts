/**
 * Monitoring and Metrics Collection
 * Track application performance and health
 */

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record a metric value
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(value);
    
    // Keep only last 1000 values
    const values = this.metrics.get(key)!;
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    const current = this.metrics.get(key)?.[0] || 0;
    this.metrics.set(key, [current + 1]);
  }

  /**
   * Get metric statistics
   */
  getStats(name: string, tags?: Record<string, string>) {
    const key = this.getKey(name, tags);
    const values = this.metrics.get(key) || [];
    
    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result: Record<string, any> = {};
    
    for (const [key, values] of this.metrics.entries()) {
      result[key] = {
        current: values[values.length - 1],
        count: values.length,
      };
    }
    
    return result;
  }

  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name;
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}{${tagStr}}`;
  }
}

export const metrics = new MetricsCollector();

// Common metrics
export const MetricNames = {
  REQUEST_DURATION: 'http.request.duration',
  REQUEST_COUNT: 'http.request.count',
  ERROR_COUNT: 'http.error.count',
  DB_QUERY_DURATION: 'db.query.duration',
  DB_CONNECTION_COUNT: 'db.connection.count',
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',
  AUTH_SUCCESS: 'auth.success',
  AUTH_FAILURE: 'auth.failure',
};

