import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RefreshTokenRequestSchema } from '@/packages/core-contracts/src/schemas';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '@/packages/core-auth/src/jwt';
import { randomUUID } from 'crypto';
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

    // Invalidate the old refresh token by adding its jti to the revocation list
    await prisma.revokedToken.create({
      data: {
        jti: payload.jti,
      },
    });

    // Issue a new set of tokens with a new jti
    const newJti = randomUUID();
    const newAccessToken = generateAccessToken(payload.userId, newJti);
    const newRefreshToken = generateRefreshToken(payload.userId, newJti);

    return NextResponse.json({
      ok: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
