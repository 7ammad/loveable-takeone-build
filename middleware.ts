import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('[MIDDLEWARE] Processing request:', { path, method: request.method });

  // Skip auth routes
  if (path.startsWith('/api/v1/auth') || path === '/api/v1/health' || path.startsWith('/api/v1/billing/moyasar/webhooks') || path.startsWith('/api/v1/debug')) {
    return NextResponse.next();
  }

  // Get access token from HttpOnly cookie
  const token = request.cookies.get('access_token')?.value;
  console.log('[MIDDLEWARE] Token check:', { 
    hasToken: !!token, 
    hasSecret: !!ACCESS_TOKEN_SECRET,
    secretLength: ACCESS_TOKEN_SECRET?.length,
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    path: request.nextUrl.pathname 
  });

  if (!token || !ACCESS_TOKEN_SECRET) {
    console.log('[MIDDLEWARE] Missing token or secret, returning 401');
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
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
    }) as jwt.JwtPayload & { userId: string; jti: string };

    const userId = decoded?.userId;
    console.log('[MIDDLEWARE] JWT decoded successfully:', { userId, path: request.nextUrl.pathname });
    
    const response = NextResponse.next();
    if (userId) {
      response.headers.set('x-user-id', userId);
      console.log('[MIDDLEWARE] Set x-user-id header:', userId);
    }
    return response;
  } catch (error) {
    console.log('[MIDDLEWARE] JWT verification failed:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname,
      method: request.method
    });
    
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid or expired token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: '/api/v1/:path*',
  runtime: 'nodejs',
};
