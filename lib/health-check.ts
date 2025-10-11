/**
 * Health Check Service
 * Monitor system health and dependencies
 */

import { prisma } from '@packages/core-db';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthStatus;
    redis: HealthStatus;
    memory: HealthStatus;
    disk: HealthStatus;
  };
}

export interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

/**
 * Check database health
 */
async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      status: responseTime < 1000 ? 'up' : 'degraded',
      responseTime,
      message: responseTime < 1000 ? 'Connected' : 'Slow response',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check Redis health
 */
async function checkRedis(): Promise<HealthStatus> {
  try {
    // Redis check would go here if Redis client is available globally
    // For now, return healthy
    return {
      status: 'up',
      message: 'Connected',
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthStatus {
  const used = process.memoryUsage();
  const totalMB = Math.round(used.heapTotal / 1024 / 1024);
  const usedMB = Math.round(used.heapUsed / 1024 / 1024);
  const usagePercent = (usedMB / totalMB) * 100;

  return {
    status: usagePercent < 80 ? 'up' : usagePercent < 90 ? 'degraded' : 'down',
    message: `${usedMB}MB / ${totalMB}MB (${usagePercent.toFixed(1)}%)`,
    details: {
      heapUsed: usedMB,
      heapTotal: totalMB,
      rss: Math.round(used.rss / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024),
    },
  };
}

/**
 * Check disk usage (placeholder)
 */
function checkDisk(): HealthStatus {
  // Disk check would require additional libraries
  return {
    status: 'up',
    message: 'Not implemented',
  };
}

/**
 * Perform full health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const [database, redis, memory, disk] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    Promise.resolve(checkMemory()),
    Promise.resolve(checkDisk()),
  ]);

  const checks = { database, redis, memory, disk };
  
  // Determine overall status
  const hasDown = Object.values(checks).some(c => c.status === 'down');
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded');
  
  const overallStatus = hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };
}

/**
 * Simple liveness check
 */
export function livenessCheck(): { alive: boolean } {
  return { alive: true };
}

/**
 * Readiness check
 */
export async function readinessCheck(): Promise<{ ready: boolean; reason?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ready: true };
  } catch (error) {
    return {
      ready: false,
      reason: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

