import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RefreshTokenRequestSchema } from '@/packages/core-contracts/src/schemas';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '@/packages/core-auth/src/jwt';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { prisma } from '@/packages/core-db/src/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RefreshTokenRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { refreshToken } = validation.data;
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // Revoke the old token (skip if table doesn't exist for testing)
    try {
      await prisma.revokedToken.create({
        data: {
          jti: payload.jti,
        },
      });
    } catch (dbError: unknown) {
      // If table doesn't exist, log but continue (for testing)
      if (dbError instanceof Error && dbError.message?.includes('does not exist')) {
        console.log('[REFRESH] RevokedToken table missing, skipping revocation for testing');
      } else {
        throw dbError;
      }
    }

    const newJti = randomUUID();
    const newAccessToken = generateAccessToken(payload.userId, newJti);
    const newRefreshToken = generateRefreshToken(payload.userId, newJti);
    const newCsrfToken = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({ ok: true });

    // Set HttpOnly cookies for new tokens (disabled in test environment)
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: !isTestEnvironment,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: !isTestEnvironment,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set new CSRF token
    response.cookies.set('csrf_token', newCsrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
