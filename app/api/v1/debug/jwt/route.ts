import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split(';')
    .find(c => c.trim().startsWith('access_token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: 'No access token found' });
  }

  try {
    const decoded = jwt.decode(token) as any;
    return NextResponse.json({
      decoded,
      hasUserId: !!decoded?.userId,
      hasAudience: !!decoded?.aud,
      hasIssuer: !!decoded?.iss,
      audience: decoded?.aud,
      issuer: decoded?.iss,
      userId: decoded?.userId,
      exp: decoded?.exp,
      iat: decoded?.iat,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to decode token', details: error });
  }
}
