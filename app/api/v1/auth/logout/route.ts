import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LogoutRequestSchema } from '@/packages/core-contracts/src/schemas';
import { verifyRefreshToken } from '@/packages/core-auth/src/jwt';
import { prisma } from '@/packages/core-db/src/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = LogoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { refreshToken } = validation.data;
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      // Even if the token is invalid, we can treat it as a successful logout.
      // The goal is to ensure the token can no longer be used.
      return NextResponse.json({ ok: true });
    }

    // Add the token's jti to the revocation list
    await prisma.revokedToken.create({
      data: {
        jti: payload.jti,
      },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    // If the token is already revoked, prisma will throw a unique constraint error.
    // We can safely ignore this and return a success response, as the token is already invalid.
    if (error.code === 'P2002') {
      return NextResponse.json({ ok: true });
    }
    
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
