/**
 * Next.js Middleware
 * Global request processing and security enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfMiddleware } from './lib/csrf';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API Versioning Check
  if (pathname.startsWith('/api/')) {
    // Allow certain paths to bypass versioning
    const isExempt = [
      '/api/health',
      '/api/auth',
      '/api/webhooks',
      '/api/csrf-token',
      '/api/digital-twin'
    ].some(p => pathname.startsWith(p));

    if (!isExempt) {
      const versionMatch = pathname.match(/^\/api\/(v\d+)\//);
      if (!versionMatch) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'API version not specified. Please use a path like /api/v1/...' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Check CSRF protection
  const csrfError = await csrfMiddleware(request);
  if (csrfError) {
    return csrfError;
  }
  
  const response = NextResponse.next();
  
  // ✅ Issue #10: HTTPS Enforcement
  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  
  // ✅ Add security headers (defense in depth with next.config.mjs)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // ✅ Issue #16: Request Size Validation
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 10 * 1024 * 1024; // 10MB default
    
    // Larger limit for upload endpoints
    const isUploadEndpoint = request.nextUrl.pathname.includes('/upload') || 
                            request.nextUrl.pathname.includes('/media');
    const limit = isUploadEndpoint ? 100 * 1024 * 1024 : maxSize; // 100MB for uploads
    
    if (size > limit) {
      return NextResponse.json(
        { error: 'Request entity too large', maxSize: limit },
        { status: 413 }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

