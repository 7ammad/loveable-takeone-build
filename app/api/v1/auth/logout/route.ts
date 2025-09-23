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
      return NextResponse.json({ ok: true });
    }

    await prisma.revokedToken.create({
      data: { jti: payload.jti },
    });

    const response = NextResponse.json({ ok: true });

    // Clear cookies
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('csrf_token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ ok: true });
    }

    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
