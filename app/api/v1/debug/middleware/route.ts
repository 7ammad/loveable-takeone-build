import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;
  
  // Check if this path should be exempted
  const isAuthRoute = path.startsWith('/api/v1/auth');
  const isHealthRoute = path === '/api/v1/health';
  const isMoyasarWebhook = path.startsWith('/api/v1/billing/moyasar/webhooks');
  const isDebugRoute = path.startsWith('/api/v1/debug');
  
  const shouldExempt = isAuthRoute || isHealthRoute || isMoyasarWebhook || isDebugRoute;
  
  // Get access token from HttpOnly cookie
  const token = request.cookies.get('access_token')?.value;
  
  let jwtResult = null;
  if (token && ACCESS_TOKEN_SECRET) {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER
      }) as any;
      jwtResult = { success: true, userId: decoded?.userId };
    } catch (error) {
      jwtResult = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return NextResponse.json({
    path,
    method,
    shouldExempt,
    hasToken: !!token,
    jwtResult,
    environment: {
      hasSecret: !!ACCESS_TOKEN_SECRET,
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    }
  });
}
