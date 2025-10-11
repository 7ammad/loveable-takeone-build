// Simple metrics collection (in production, use Prometheus/client_gauge)
interface MetricValue {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private metrics: MetricValue[] = [];

  /**
   * Increment a counter metric
   */
  increment(name: string, labels: Record<string, string> = {}, value: number = 1) {
    this.recordMetric(name, value, labels, 'counter');
  }

  /**
   * Set a gauge metric
   */
  gauge(name: string, value: number, labels: Record<string, string> = {}) {
    this.recordMetric(name, value, labels, 'gauge');
  }

  /**
   * Record a histogram timing
   */
  timing(name: string, duration: number, labels: Record<string, string> = {}) {
    this.recordMetric(name, duration, labels, 'histogram');
  }

  private recordMetric(name: string, value: number, labels: Record<string, string>, type: string) {
    const metric: MetricValue = {
      name: `${type}_${name}`,
      value,
      labels,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics (simple retention)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log important metrics
    if (type === 'counter' && (name.includes('error') || name.includes('fail'))) {
      console.warn(`Metric: ${name}`, { value, labels });
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): MetricValue[] {
    return [...this.metrics];
  }

  /**
   * Get aggregated metrics by name
   */
  getAggregatedMetrics(): Record<string, { count: number; sum: number; avg: number }> {
    const aggregated: Record<string, { count: number; sum: number; avg: number }> = {};

    this.metrics.forEach((metric) => {
      if (!aggregated[metric.name]) {
        aggregated[metric.name] = { count: 0, sum: 0, avg: 0 };
      }

      aggregated[metric.name].count++;
      aggregated[metric.name].sum += metric.value;
      aggregated[metric.name].avg = aggregated[metric.name].sum / aggregated[metric.name].count;
    });

    return aggregated;
  }
}

// Global metrics collector
export const metrics = new MetricsCollector();

/**
 * Alert rules for critical metrics
 */
export class AlertManager {
  private alerts: Array<{
    name: string;
    condition: (metrics: Record<string, { count: number; sum: number; avg: number }>) => boolean;
    message: string;
    lastTriggered?: number;
  }> = [];

  constructor() {
    this.setupDefaultAlerts();
  }

  private setupDefaultAlerts() {
    // Auth failure rate alert
    this.addAlert({
      name: 'high_auth_failure_rate',
      condition: (metrics) => {
        const failures = metrics.counter_auth_failures?.avg || 0;
        const successes = metrics.counter_auth_successes?.avg || 1;
        return (failures / (failures + successes)) > 0.1; // >10% failure rate
      },
      message: 'High authentication failure rate detected (>10%)',
    });

    // API error rate alert
    this.addAlert({
      name: 'high_api_error_rate',
      condition: (metrics) => {
        const errors = metrics.counter_api_errors?.avg || 0;
        const requests = metrics.counter_api_requests?.avg || 1;
        return (errors / requests) > 0.05; // >5% error rate
      },
      message: 'High API error rate detected (>5%)',
    });

    // Queue backlog alert
    this.addAlert({
      name: 'queue_backlog_high',
      condition: (metrics) => {
        return (metrics.gauge_queue_backlog?.avg || 0) > 100; // >100 pending jobs
      },
      message: 'High queue backlog detected (>100 pending jobs)',
    });

    // Database connection issues
    this.addAlert({
      name: 'database_connection_errors',
      condition: (metrics) => {
        return (metrics.counter_db_connection_errors?.avg || 0) > 5; // >5 connection errors
      },
      message: 'Database connection errors detected',
    });
  }

  addAlert(alert: {
    name: string;
    condition: (metrics: Record<string, { count: number; sum: number; avg: number }>) => boolean;
    message: string;
  }) {
    this.alerts.push(alert);
  }

  /**
   * Check all alerts and return triggered ones
   */
  checkAlerts(): Array<{ name: string; message: string; triggeredAt: number }> {
    const currentMetrics = metrics.getAggregatedMetrics();
    const triggeredAlerts: Array<{ name: string; message: string; triggeredAt: number }> = [];

    this.alerts.forEach((alert) => {
      if (alert.condition(currentMetrics)) {
        const now = Date.now();

        // Only trigger if not triggered in last 5 minutes
        if (!alert.lastTriggered || (now - alert.lastTriggered) > 5 * 60 * 1000) {
          alert.lastTriggered = now;
          triggeredAlerts.push({
            name: alert.name,
            message: alert.message,
            triggeredAt: now,
          });
        }
      }
    });

    return triggeredAlerts;
  }
}

// Global alert manager
export const alertManager = new AlertManager();

/**
 * Middleware to collect API metrics
 */
export function withMetrics<T extends unknown[]>(
  handler: (...args: T) => Promise<unknown>,
  routeName: string
) {
  return async (...args: T): Promise<unknown> => {
    const startTime = Date.now();

    try {
      metrics.increment('api_requests', { route: routeName });
      const result = await handler(...args);
      metrics.timing('api_request_duration', Date.now() - startTime, { route: routeName });
      return result;
    } catch (error) {
      metrics.increment('api_errors', { route: routeName, error: (error as Error).message });
      throw error;
    }
  };
}
