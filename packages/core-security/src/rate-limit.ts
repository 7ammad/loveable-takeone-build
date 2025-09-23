import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

let ipRatelimit: Ratelimit | null = null;
let userRatelimit: Ratelimit | null = null;

function getIpRatelimit(): Ratelimit | null {
  if (ipRatelimit) return ipRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  const redis = new Redis({ url, token });
  ipRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour per IP
    analytics: true,
    prefix: '@upstash/ratelimit/saudi-casting-ip',
  });
  return ipRatelimit;
}

function getUserRatelimit(): Ratelimit | null {
  if (userRatelimit) return userRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  const redis = new Redis({ url, token });
  userRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'), // 1000 requests per hour per user
    analytics: true,
    prefix: '@upstash/ratelimit/saudi-casting-user',
  });
  return userRatelimit;
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri;
  return '127.0.0.1';
}

export async function checkRateLimit(request: NextRequest): Promise<{ success: boolean }> {
  // Always check IP-based rate limit
  const ipRl = getIpRatelimit();
  if (ipRl) {
    const ip = getClientIp(request);
    const ipResult = await ipRl.limit(ip);
    if (!ipResult.success) {
      return { success: false };
    }
  }

  // Check user-based rate limit if user is authenticated
  const userId = request.headers.get('x-user-id');
  if (userId) {
    const userRl = getUserRatelimit();
    if (userRl) {
      const userResult = await userRl.limit(`user:${userId}`);
      if (!userResult.success) {
        return { success: false };
      }
    }
  }

  return { success: true };
}
