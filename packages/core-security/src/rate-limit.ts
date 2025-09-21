import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

// Create a new Redis client instance.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a new Ratelimit instance
// that allows 10 requests from an IP address in a 10-second window.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  /**
   * Optional prefix for the keys used in Redis. This is useful if you want to share a Redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: '@upstash/ratelimit/saudi-casting',
});

export async function checkRateLimit(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  return await ratelimit.limit(ip);
}
