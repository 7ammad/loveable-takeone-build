/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const store = new Map<string, RateLimitStore>();

// Default rate limit configurations
export const RATE_LIMITS = {
  // ✅ Critical auth endpoints - very strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // ✅ Email/SMS verification - prevent spam
  verification: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  
  // ✅ Password reset - prevent brute force
  passwordReset: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3,
  },
  
  // ✅ API endpoints - reasonable limits
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  
  // ✅ File uploads - prevent abuse
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },
} as const;

/**
 * Get client identifier (IP address or user ID)
 */
function getClientId(request: NextRequest, prefix: string): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `${prefix}:${ip}`;
}

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(request, 'rl');
    const now = Date.now();
    
    // Get or create rate limit record
    let record = store.get(clientId);
    
    // Reset if window has passed
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      store.set(clientId, record);
    }
    
    // Increment request count
    record.count += 1;
    
    // Calculate remaining requests and reset time
    const remaining = Math.max(0, config.maxRequests - record.count);
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    
    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': record.resetTime.toString(),
    };
    
    // Check if rate limit exceeded
    if (record.count > config.maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
          retryAfter: resetInSeconds,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': resetInSeconds.toString(),
          },
        }
      );
    }
    
    // Rate limit OK - return null to continue
    return null;
  };
}

/**
 * Apply rate limiting to a route handler
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: Record<string, unknown>): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await rateLimit(config)(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Continue to handler
    return handler(request, context);
  };
}

/**
 * Cleanup old entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

