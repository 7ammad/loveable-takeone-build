import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

let authRatelimit: Ratelimit | null = null;
let loginRatelimit: Ratelimit | null = null;

/**
 * General auth rate limiter (for registration, refresh, etc.)
 * 10 requests per 15 minutes per IP
 */
function getAuthRatelimit(): Ratelimit | null {
  if (authRatelimit) return authRatelimit;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Rate Limit] Redis not configured, rate limiting disabled');
    return null;
  }
  
  const redis = new Redis({ url, token });
  authRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
  });
  
  return authRatelimit;
}

/**
 * Strict login rate limiter to prevent brute force attacks
 * 5 requests per 15 minutes per IP
 */
function getLoginRatelimit(): Ratelimit | null {
  if (loginRatelimit) return loginRatelimit;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Rate Limit] Redis not configured, rate limiting disabled');
    return null;
  }
  
  const redis = new Redis({ url, token });
  loginRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
    analytics: true,
    prefix: '@upstash/ratelimit/login',
  });
  
  return loginRatelimit;
}

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri;
  
  return '127.0.0.1';
}

/**
 * Check rate limit for general auth endpoints (register, refresh, etc.)
 */
export async function checkAuthRateLimit(request: NextRequest): Promise<{ 
  success: boolean; 
  limit: number; 
  remaining: number; 
  reset: number; 
}> {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 900000 };
  }

  const ratelimit = getAuthRatelimit();
  
  // If rate limiting is not configured, allow the request
  if (!ratelimit) {
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 900000 };
  }
  
  const ip = getClientIp(request);
  const result = await ratelimit.limit(ip);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check rate limit for login endpoint (stricter limits)
 */
export async function checkLoginRateLimit(request: NextRequest): Promise<{ 
  success: boolean; 
  limit: number; 
  remaining: number; 
  reset: number; 
}> {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return { success: true, limit: 5, remaining: 5, reset: Date.now() + 900000 };
  }

  const ratelimit = getLoginRatelimit();
  
  // If rate limiting is not configured, allow the request
  if (!ratelimit) {
    return { success: true, limit: 5, remaining: 5, reset: Date.now() + 900000 };
  }
  
  const ip = getClientIp(request);
  const result = await ratelimit.limit(ip);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

