import crypto from 'crypto';

/**
 * Generates a code verifier for PKCE (Proof Key for Code Exchange)
 * @returns A cryptographically secure random string
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generates a code challenge from a code verifier using S256 method
 * @param codeVerifier The code verifier string
 * @returns The code challenge hash
 */
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return hash.toString('base64url');
}

/**
 * Validates a code verifier against a code challenge
 * @param codeVerifier The code verifier
 * @param codeChallenge The code challenge to validate against
 * @returns True if valid, false otherwise
 */
export function validateCodeChallenge(codeVerifier: string, codeChallenge: string): boolean {
  const expectedChallenge = generateCodeChallenge(codeVerifier);
  return crypto.timingSafeEqual(
    Buffer.from(expectedChallenge),
    Buffer.from(codeChallenge)
  );
}
