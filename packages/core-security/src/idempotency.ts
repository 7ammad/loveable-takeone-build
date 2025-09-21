import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const IDEMPOTENCY_KEY_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Checks if an idempotency key has been seen before.
 * If it's a new key, it stores it and returns true.
 * If it's a duplicate key, it returns false.
 * @param request The NextRequest object.
 * @returns {Promise<boolean>} - True if the request can proceed, false if it's a duplicate.
 */
export async function checkIdempotency(request: NextRequest): Promise<boolean> {
  const idempotencyKey = request.headers.get('Idempotency-Key');

  // If no key is provided, we allow the request to proceed.
  // Specific routes will need to enforce the presence of this key.
  if (!idempotencyKey) {
    return true;
  }

  const key = `idempotency:${idempotencyKey}`;
  const result = await redis.set(key, 'processed', {
    nx: true, // Only set the key if it does not already exist.
    ex: IDEMPOTENCY_KEY_EXPIRY_SECONDS,
  });

  return result === 'OK';
}
