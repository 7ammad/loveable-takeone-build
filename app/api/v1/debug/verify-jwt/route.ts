import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyRefreshToken } from '@/packages/core-auth/src/jwt';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split(';')
    .find(c => c.trim().startsWith('access_token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: 'No access token found' });
  }

  const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
  const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saudi-casting-marketplace';
  const JWT_ISSUER = process.env.JWT_ISSUER || 'saudi-casting-marketplace';

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET!, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    }) as { userId: string; jti: string; aud: string; iss: string; iat: number; exp: number };

    return NextResponse.json({
      success: true,
      decoded,
      verification: {
        secret: ACCESS_TOKEN_SECRET ? 'SET' : 'NOT_SET',
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      verification: {
        secret: ACCESS_TOKEN_SECRET ? 'SET' : 'NOT_SET',
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
      }
    });
  }
}

// Add POST method to test refresh token verification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' });
    }

    const result = await verifyRefreshToken(token);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Refresh token verification successful',
        decoded: result,
        verification: {
          audience: process.env.JWT_AUDIENCE || 'saudi-casting-marketplace',
          issuer: process.env.JWT_ISSUER || 'saudi-casting-marketplace',
          refreshSecret: process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT_SET'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Refresh token verification failed',
        verification: {
          audience: process.env.JWT_AUDIENCE || 'saudi-casting-marketplace',
          issuer: process.env.JWT_ISSUER || 'saudi-casting-marketplace',
          refreshSecret: process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT_SET'
        }
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
