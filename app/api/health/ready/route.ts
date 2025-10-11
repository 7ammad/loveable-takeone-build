import { NextResponse } from 'next/server';
import { readinessCheck } from '@/lib/health-check';

/**
 * GET /api/health/ready
 * Readiness probe (is the app ready to serve traffic?)
 */
export async function GET() {
  const result = await readinessCheck();
  const status = result.ready ? 200 : 503;
  return NextResponse.json(result, { status });
}

