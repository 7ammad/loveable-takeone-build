import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
    const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';
    
    console.log('[JWT TEST] Environment check:', {
      hasToken: !!token,
      hasSecret: !!ACCESS_TOKEN_SECRET,
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    });
    
    if (!token || !ACCESS_TOKEN_SECRET) {
      return NextResponse.json({
        ok: false,
        error: 'Missing token or secret',
        hasToken: !!token,
        hasSecret: !!ACCESS_TOKEN_SECRET
      });
    }
    
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
          audience: JWT_AUDIENCE,
          issuer: JWT_ISSUER
        }) as { userId: string; jti: string; aud: string; iss: string; iat: number; exp: number };
      
      return NextResponse.json({
        ok: true,
        message: 'JWT verification successful',
        userId: decoded?.userId,
        decoded: {
          userId: decoded?.userId,
          jti: decoded?.jti,
          aud: decoded?.aud,
          iss: decoded?.iss,
          iat: decoded?.iat,
          exp: decoded?.exp
        }
      });
    } catch (jwtError) {
      return NextResponse.json({
        ok: false,
        error: 'JWT verification failed',
        jwtError: jwtError instanceof Error ? jwtError.message : 'Unknown error',
        token: token.substring(0, 50) + '...'
      });
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
