import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.warn('REDIS_URL is not defined. Caching and queueing will not work.');
}

export const redis = REDIS_URL ? new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Important for BullMQ
}) : null;

// Add error event handler to prevent unhandled errors
if (redis) {
  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    // Don't throw - allow application to continue without Redis
  });
  
  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
}

/**
 * Stores a response for a given idempotency key.
 * @param key - The idempotency key.
 * @param response - The response data to store (status and body).
 * @param ttlSeconds - The time-to-live for the key in seconds.
 */
export async function storeIdempotentResponse(key: string, response: { status: number; body: any }, ttlSeconds: number = 24 * 60 * 60): Promise<void> {
  if (!redis) return;
  await redis.set(`idempotency:${key}`, JSON.stringify(response), 'EX', ttlSeconds);
}

/**
 * Retrieves a cached response for a given idempotency key.
 * @param key - The idempotency key.
 * @returns The cached response, or null if not found.
 */
export async function getCachedIdempotentResponse(key: string): Promise<{ status: number; body: any } | null> {
  if (!redis) return null;
  const data = await redis.get(`idempotency:${key}`);
  return data ? JSON.parse(data) : null;
}
