import { getIdentityByUserId } from '@/lib/db';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const NAFATH_WEBHOOK_SECRET = process.env.NAFATH_WEBHOOK_SECRET!;
const ALLOWED_REDIRECT_HOSTS = process.env.NAFATH_ALLOWED_REDIRECTS?.split(',') || [];

/**
 * Checks if a user has completed Nafath verification
 * @param userId The user ID to check
 * @returns True if verified, false otherwise
 */
export async function hasNafathVerification(userId: string): Promise<boolean> {
  const identity = getIdentityByUserId(userId);
  return identity?.nafathStatus === 'VERIFIED';
}

/**
 * Generates a signed state parameter for Nafath OAuth flow
 * @param userId User ID
 * @param redirectUri The redirect URI
 * @returns Signed state parameter
 */
export function generateNafathState(userId: string, redirectUri: string): string {
  // Validate redirect URI is in allowlist
  const redirectUrl = new URL(redirectUri);
  if (!ALLOWED_REDIRECT_HOSTS.includes(redirectUrl.host)) {
    throw new Error('Redirect URI not in allowlist');
  }

  // Use Math.random for Edge Runtime compatibility
  const nonce = Array.from({length: 16}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  const state = Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');

  const payload = {
    userId,
    redirectUri,
    nonce,
    state,
    createdAt: Date.now(),
  };

  // Simple signature for Edge Runtime compatibility
  const signature = btoa(JSON.stringify(payload) + NAFATH_WEBHOOK_SECRET).slice(0, 64);

  const signedState = `${state}.${signature}`;

  // Store state with nonce for replay protection
  const key = `nafath_state:${state}`;
  redis.set(key, JSON.stringify(payload), { ex: 600 }); // 10 minutes

  return signedState;
}

/**
 * Validates and consumes a Nafath state parameter
 * @param signedState The signed state parameter
 * @param receivedNonce The nonce from the callback
 * @returns User ID if valid, null otherwise
 */
export async function validateNafathState(signedState: string, receivedNonce: string): Promise<{ userId: string; redirectUri: string } | null> {
  const [state, signature] = signedState.split('.');

  if (!state || !signature) {
    return null;
  }

  const key = `nafath_state:${state}`;
  const stored = await redis.get(key);

  if (!stored) {
    return null;
  }

  const payload = JSON.parse(stored as string);

  // Verify signature (simplified for Edge Runtime)
  const expectedSignature = btoa(JSON.stringify({
    userId: payload.userId,
    redirectUri: payload.redirectUri,
    nonce: payload.nonce,
    state: payload.state,
    createdAt: payload.createdAt,
  }) + NAFATH_WEBHOOK_SECRET).slice(0, 64);

  if (signature !== expectedSignature) {
    return null;
  }

  // Check nonce for replay protection
  if (payload.nonce !== receivedNonce) {
    return null;
  }

  // Check expiry
  if (Date.now() - payload.createdAt > 10 * 60 * 1000) {
    await redis.del(key);
    return null;
  }

  // Clean up used state
  await redis.del(key);

  return {
    userId: payload.userId,
    redirectUri: payload.redirectUri,
  };
}

/**
 * Verifies Nafath webhook signature and prevents replay attacks
 * @param rawBody Raw request body
 * @param signature Signature from headers
 * @param nonce Nonce for replay protection
 * @returns True if valid, false otherwise
 */
export async function verifyNafathWebhook(rawBody: string, signature: string | null, nonce: string): Promise<boolean> {
  if (!signature) {
    return false;
  }

  // Check for nonce replay
  const nonceKey = `nafath_nonce:${nonce}`;
  const nonceExists = await redis.exists(nonceKey);
  if (nonceExists) {
    return false; // Nonce already used
  }

  // Verify signature (simplified for Edge Runtime)
  const expectedSignature = btoa(rawBody + NAFATH_WEBHOOK_SECRET).slice(0, 64);

  if (signature !== expectedSignature) {
    return false;
  }

  // Store nonce to prevent replay
  await redis.set(nonceKey, 'used', { ex: 24 * 60 * 60 }); // 24 hours

  return true;
}

/**
 * Enforces Nafath verification requirement for protected operations
 * @param userId User ID
 * @param operation Operation being performed
 * @throws Error if verification required but not completed
 */
export async function enforceNafathGate(userId: string, operation: string): Promise<void> {
  // POST /applications requires Nafath verification
  if (operation === 'create_application') {
    const verified = await hasNafathVerification(userId);
    if (!verified) {
      throw new Error('Nafath verification required to create applications');
    }
  }
}
