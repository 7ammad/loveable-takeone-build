import { NextResponse } from 'next/server';
import { performHealthCheck, livenessCheck, readinessCheck } from '@/lib/health-check';

/**
 * GET /api/health
 * Full health check
 */
export async function GET() {
  try {
    const health = await performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

