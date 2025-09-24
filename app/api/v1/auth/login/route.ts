import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { LoginRequestSchema } from '@/packages/core-contracts/src/schemas';
import { generateAccessToken, generateRefreshToken } from '@/packages/core-auth/src/jwt';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = LoginRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const jti = randomUUID();
    const accessToken = generateAccessToken(user.id, jti);
    const refreshToken = generateRefreshToken(user.id, jti);
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({ ok: true });

    // Set HttpOnly cookies for tokens (disabled in test environment)
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    response.cookies.set('access_token', accessToken, {
      httpOnly: !isTestEnvironment,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: !isTestEnvironment,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set CSRF token in non-HttpOnly cookie for client access
    response.cookies.set('csrf_token', csrfToken, {
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
