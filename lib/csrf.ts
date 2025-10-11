/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Prevents unauthorized state-changing operations
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate CSRF token using Web Crypto API (Edge-compatible)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in cookie
 */
export function setCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript to send in header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return response;
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Get CSRF token from header
 */
export function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_HEADER_NAME) || null;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfTokenFromCookie(request);
  const headerToken = getCsrfTokenFromHeader(request);
  
  // Both must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Check if request needs CSRF protection
 */
export function needsCsrfProtection(request: NextRequest): boolean {
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return false;
  }
  
  // Exempt API endpoints that use Bearer token authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return false; // API clients don't need CSRF protection
  }
  
  // Exempt specific paths
  const exemptPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/webhooks/', // Webhooks don't use cookies
  ];
  
  for (const exemptPath of exemptPaths) {
    if (path.startsWith(exemptPath)) {
      return false;
    }
  }
  
  return true;
}

/**
 * CSRF middleware
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Check if this request needs CSRF protection
  if (!needsCsrfProtection(request)) {
    return null; // Continue without CSRF check
  }
  
  // Validate CSRF token
  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      {
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
      { status: 403 }
    );
  }
  
  return null; // CSRF validation passed
}

/**
 * Generate CSRF token endpoint
 * GET /api/csrf-token
 */
export function handleCsrfTokenRequest(request: NextRequest): NextResponse {
  const existingToken = getCsrfTokenFromCookie(request);
  const token = existingToken || generateCsrfToken();
  
  const response = NextResponse.json({
    success: true,
    csrfToken: token,
  });
  
  // Set cookie if new token
  if (!existingToken) {
    setCsrfCookie(response, token);
  }
  
  return response;
}

/**
 * Refresh CSRF token (after login)
 */
export function refreshCsrfToken(response: NextResponse): NextResponse {
  const newToken = generateCsrfToken();
  return setCsrfCookie(response, newToken);
}

