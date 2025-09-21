import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/packages/core-security/src/rate-limit';
import { checkIdempotency } from '@/packages/core-security/src/idempotency';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export async function middleware(request: NextRequest) {
  // Check for duplicate requests first for relevant methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const isIdempotent = await checkIdempotency(request);
    if (!isIdempotent) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Duplicate request' }),
        { status: 409, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // Apply rate limiting first
  const { success } = await checkRateLimit(request);
  if (!success) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Too many requests' }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    );
  }

  // Exclude auth and health check routes from protection
  if (request.nextUrl.pathname.startsWith('/api/v1/auth') || request.nextUrl.pathname === '/api/v1/health') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token || !ACCESS_TOKEN_SECRET) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET);
    // The token is valid, so we can proceed.
    // We can also attach the decoded user info to the request headers
    // if we want to access it in the API route handlers.
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid or expired token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}

// Configure the middleware to run on all API routes under /api/v1/
export const config = {
  matcher: '/api/v1/:path*',
};
