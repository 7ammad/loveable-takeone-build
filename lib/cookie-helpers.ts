/**
 * Cookie Helpers for Secure Token Storage
 * Implements httpOnly cookies for JWT tokens
 */

import { NextResponse } from 'next/server';

// Cookie configuration
const COOKIE_CONFIG = {
  accessToken: {
    name: 'accessToken',
    maxAge: 15 * 60, // 15 minutes
  },
  refreshToken: {
    name: 'refreshToken',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
} as const;

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

/**
 * Get base cookie options (secure defaults)
 */
function getBaseCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    path: '/',
  };
}

/**
 * Set authentication tokens as httpOnly cookies
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  const baseOptions = getBaseCookieOptions();

  // Set access token cookie
  response.cookies.set(
    COOKIE_CONFIG.accessToken.name,
    accessToken,
    {
      ...baseOptions,
      maxAge: COOKIE_CONFIG.accessToken.maxAge,
    }
  );

  // Set refresh token cookie
  response.cookies.set(
    COOKIE_CONFIG.refreshToken.name,
    refreshToken,
    {
      ...baseOptions,
      maxAge: COOKIE_CONFIG.refreshToken.maxAge,
    }
  );

  return response;
}

/**
 * Clear authentication cookies (for logout)
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  const baseOptions = getBaseCookieOptions();

  // Clear access token cookie
  response.cookies.set(
    COOKIE_CONFIG.accessToken.name,
    '',
    {
      ...baseOptions,
      maxAge: 0, // Expire immediately
    }
  );

  // Clear refresh token cookie
  response.cookies.set(
    COOKIE_CONFIG.refreshToken.name,
    '',
    {
      ...baseOptions,
      maxAge: 0, // Expire immediately
    }
  );

  return response;
}

/**
 * Get access token from cookies or Authorization header
 */
export function getAccessToken(request: Request): string | null {
  // First, try to get from cookies (preferred)
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const accessTokenMatch = cookies.match(new RegExp(`${COOKIE_CONFIG.accessToken.name}=([^;]+)`));
    if (accessTokenMatch) {
      return accessTokenMatch[1];
    }
  }

  // Fallback to Authorization header for backwards compatibility
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Get refresh token from cookies or request body
 */
export function getRefreshToken(request: Request, bodyToken?: string): string | null {
  // First, try to get from cookies (preferred)
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const refreshTokenMatch = cookies.match(new RegExp(`${COOKIE_CONFIG.refreshToken.name}=([^;]+)`));
    if (refreshTokenMatch) {
      return refreshTokenMatch[1];
    }
  }

  // Fallback to body token for backwards compatibility
  return bodyToken || null;
}

/**
 * Rotate refresh token (update the cookie with new token)
 */
export function rotateRefreshToken(
  response: NextResponse,
  newRefreshToken: string
): NextResponse {
  const baseOptions = getBaseCookieOptions();

  response.cookies.set(
    COOKIE_CONFIG.refreshToken.name,
    newRefreshToken,
    {
      ...baseOptions,
      maxAge: COOKIE_CONFIG.refreshToken.maxAge,
    }
  );

  return response;
}

export const COOKIE_NAMES = {
  ACCESS_TOKEN: COOKIE_CONFIG.accessToken.name,
  REFRESH_TOKEN: COOKIE_CONFIG.refreshToken.name,
} as const;
