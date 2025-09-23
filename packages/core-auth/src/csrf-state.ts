import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Generates a CSRF state parameter for OAuth flows
 * @param userId Optional user ID to associate with the state
 * @param redirectUri Optional redirect URI to validate against
 * @returns The state token
 */
export function generateCsrfState(userId?: string, redirectUri?: string): string {
  const state = crypto.randomBytes(32).toString('hex');
  const payload = {
    state,
    userId,
    redirectUri,
    createdAt: Date.now(),
  };

  // Store state in Redis with 10 minute expiry
  const key = `csrf_state:${state}`;
  redis.set(key, JSON.stringify(payload), { ex: 600 });

  return state;
}

/**
 * Validates a CSRF state parameter
 * @param state The state token to validate
 * @param redirectUri Optional redirect URI to validate against
 * @returns The associated userId if valid, null otherwise
 */
export async function validateCsrfState(state: string, redirectUri?: string): Promise<string | null> {
  const key = `csrf_state:${state}`;
  const stored = await redis.get(key);

  if (!stored) {
    return null;
  }

  const payload = JSON.parse(stored as string);

  // Check if state is expired (10 minutes)
  if (Date.now() - payload.createdAt > 10 * 60 * 1000) {
    await redis.del(key);
    return null;
  }

  // Validate redirect URI if provided
  if (redirectUri && payload.redirectUri && payload.redirectUri !== redirectUri) {
    await redis.del(key);
    return null;
  }

  // Clean up used state
  await redis.del(key);

  return payload.userId || null;
}

/**
 * Clears a CSRF state (useful for cleanup)
 * @param state The state token to clear
 */
export async function clearCsrfState(state: string): Promise<void> {
  const key = `csrf_state:${state}`;
  await redis.del(key);
}
