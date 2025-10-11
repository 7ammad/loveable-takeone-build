import { NextResponse } from 'next/server';
import { livenessCheck } from '@/lib/health-check';

/**
 * GET /api/health/live
 * Liveness probe (is the app running?)
 */
export async function GET() {
  const result = livenessCheck();
  return NextResponse.json(result);
}

