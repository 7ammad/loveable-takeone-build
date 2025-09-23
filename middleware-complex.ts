import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/packages/core-security/src/rate-limit';
import { checkIdempotency } from '@/packages/core-security/src/idempotency';
import { enforceNafathGate } from '@/packages/core-security/src/nafath-gate';
import { enforceGuardianGate, canSendMessage } from '@/packages/core-security/src/guardian-gate';
import { hasActiveSubscription } from '@/packages/core-security/src/subscription-gate';
import { addSecurityHeaders } from '@/packages/core-security/src/security-headers';
import { withTracing, traceApiRoute } from '@/packages/core-observability/src/tracing';
import { withMetrics } from '@/packages/core-observability/src/metrics';
import { setUserContext, captureException } from '@/packages/core-observability/src/sentry';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

async function middlewareHandler(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('[MIDDLEWARE] Processing request:', { path, method: request.method });
  console.error('[MIDDLEWARE] Processing request:', { path, method: request.method });

  // Paths that must be exempt from CSRF (auth endpoints and external webhooks)
  const isCsrfExempt = path.startsWith('/api/v1/auth') || path.startsWith('/api/v1/billing/moyasar/webhooks');

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !isCsrfExempt) {
    // Check CSRF token for state-changing operations
    const csrfCookie = request.cookies.get('csrf_token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return addSecurityHeaders(new NextResponse(
        JSON.stringify({ success: false, message: 'CSRF token missing or invalid' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      ));
    }

    const storedResponse = await checkIdempotency(request);
    if (storedResponse) {
      // Return the stored response for duplicate requests
      return storedResponse;
    }
  }

  const { success } = await checkRateLimit(request);
  if (!success) {
    return addSecurityHeaders(new NextResponse(
      JSON.stringify({ success: false, message: 'Too many requests' }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    ));
  }

  if (path.startsWith('/api/v1/auth') || path === '/api/v1/health' || path.startsWith('/api/v1/billing/moyasar/webhooks') || path.startsWith('/api/v1/debug')) {
    return NextResponse.next();
  }

  // Get access token from HttpOnly cookie
  const token = request.cookies.get('access_token')?.value;
  console.log('[MIDDLEWARE] Token check:', { 
    hasToken: !!token, 
    hasSecret: !!ACCESS_TOKEN_SECRET,
    path: request.nextUrl.pathname 
  });

  if (!token || !ACCESS_TOKEN_SECRET) {
    console.log('[MIDDLEWARE] Missing token or secret, returning 401');
    return addSecurityHeaders(new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    ));
  }

  try {
    console.log('[MIDDLEWARE] Attempting JWT verification:', { 
      tokenLength: token.length,
      hasSecret: !!ACCESS_TOKEN_SECRET,
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    });
    
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    }) as any;

    const userId = decoded?.userId;
    console.log('[MIDDLEWARE] JWT decoded successfully:', { userId, path: request.nextUrl.pathname });
    if (userId) {
      // Enforce Nafath gate for protected operations
      if (request.method === 'POST' && request.nextUrl.pathname.includes('/applications')) {
        try {
          await enforceNafathGate(userId, 'create_application');
        } catch (error) {
          return addSecurityHeaders(new NextResponse(
            JSON.stringify({ success: false, message: (error as Error).message }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          ));
        }
      }

      // Enforce Guardian gate for minor operations
      if (request.method === 'POST' && request.nextUrl.pathname.includes('/messages')) {
        try {
          await enforceGuardianGate(userId, 'send_message');
        } catch (error) {
          return addSecurityHeaders(new NextResponse(
            JSON.stringify({ success: false, message: (error as Error).message }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          ));
        }
      }

      if (request.method === 'POST' && request.nextUrl.pathname.includes('/media/uploads')) {
        try {
          await enforceGuardianGate(userId, 'upload_media');
        } catch (error) {
          return addSecurityHeaders(new NextResponse(
            JSON.stringify({ success: false, message: (error as Error).message }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          ));
        }
      }

      // Enforce subscription gate for hirer operations
      if (request.method === 'POST' && request.nextUrl.pathname.includes('/messages')) {
        try {
          const hasSubscription = await hasActiveSubscription(userId);
          if (!hasSubscription) {
            return addSecurityHeaders(new NextResponse(
              JSON.stringify({ success: false, message: 'Active subscription required to contact talent' }),
              { status: 403, headers: { 'content-type': 'application/json' } }
            ));
          }
        } catch (error) {
          return addSecurityHeaders(new NextResponse(
            JSON.stringify({ success: false, message: (error as Error).message }),
            { status: 500, headers: { 'content-type': 'application/json' } }
          ));
        }
      }
    }

    const response = NextResponse.next();
    if (userId) {
      response.headers.set('x-user-id', userId);
    }
    return addSecurityHeaders(response);
  } catch (error) {
    console.log('[MIDDLEWARE] JWT verification failed:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname,
      method: request.method
    });
    
    // Capture authentication errors
    captureException(error as Error, {
      middleware: 'auth',
      path: request.nextUrl.pathname,
      method: request.method,
    });

    return addSecurityHeaders(new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid or expired token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    ));
  }
}

// Wrap middleware with tracing and metrics
export const middleware = withTracing(
  'middleware',
  withMetrics(
    middlewareHandler,
    'middleware'
  )
);

export const config = {
  matcher: '/api/v1/:path*',
};
