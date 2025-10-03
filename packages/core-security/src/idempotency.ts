import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Redis configuration is missing.');
  }

  redis = new Redis({ url, token });
  return redis;
}

const IDEMPOTENCY_KEY_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

interface StoredResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

/**
 * Checks if an idempotency key has been seen before.
 * If it's a new key, it stores it and returns null (request can proceed).
 * If it's a duplicate key, it returns the stored response.
 * @param request The NextRequest object.
 * @returns {Promise<NextResponse | null>} - null if request can proceed, stored response if duplicate.
 */
export async function checkIdempotency(request: NextRequest): Promise<NextResponse | null> {
  const idempotencyKey = request.headers.get('Idempotency-Key');

  // If no key is provided, we allow the request to proceed.
  // Specific routes will need to enforce the presence of this key.
  if (!idempotencyKey) {
    return null;
  }

  const key = `idempotency:${idempotencyKey}`;
  const existing = await getRedisClient().get(key);

  if (existing) {
    // This is a duplicate request, return the stored response
    const storedResponse: StoredResponse = JSON.parse(existing as string);

    const response = new NextResponse(storedResponse.body, {
      status: storedResponse.status,
      headers: storedResponse.headers,
    });

    return response;
  }

  // First time seeing this key, allow the request to proceed
  return null;
}

/**
 * Stores a response for idempotency replay
 * @param idempotencyKey The idempotency key from the request
 * @param response The response to store
 */
export async function storeIdempotencyResponse(
  idempotencyKey: string,
  response: NextResponse
): Promise<void> {
  try {
    const status = response.status;
    const headers: Record<string, string> = {};

    // Extract relevant headers for replay
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Get response body as string (assuming JSON responses)
    const body = await response.clone().text();

    const storedResponse: StoredResponse = {
      status,
      headers,
      body,
      contentType: headers['content-type'] || 'application/json',
    };

    const key = `idempotency:${idempotencyKey}`;
    await getRedisClient().set(key, JSON.stringify(storedResponse), {
      ex: IDEMPOTENCY_KEY_EXPIRY_SECONDS,
    });
  } catch (error) {
    // If storing fails, don't block the response - just log
    console.error('Failed to store idempotency response:', error);
  }
}

/**
 * Helper function to wrap responses with idempotency storage
 * @param request The request object (to get idempotency key)
 * @param response The response to potentially store and return
 * @returns The response (unchanged)
 */
export async function withIdempotency(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (idempotencyKey) {
    // Store the response asynchronously (don't await to avoid blocking)
    storeIdempotencyResponse(idempotencyKey, response as NextResponse);
  }
  return response;
}
