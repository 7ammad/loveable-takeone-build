import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
    }) as any;

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
