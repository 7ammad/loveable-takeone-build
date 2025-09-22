import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/saudi-casting',
  });
  return ratelimit;
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri;
  return '127.0.0.1';
}

export async function checkRateLimit(request: NextRequest): Promise<{ success: boolean } | any> {
  const rl = getRatelimit();
  if (!rl) {
    // Bypass rate limiting if not configured (e.g., local dev)
    return { success: true } as any;
  }
  const ip = getClientIp(request);
  return await rl.limit(ip);
}
