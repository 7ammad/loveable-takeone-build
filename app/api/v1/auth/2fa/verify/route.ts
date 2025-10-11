import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { verifyTotpCode } from '@/lib/totp';
import { prisma } from '@packages/core-db';
import { createAuditLog, AuditEventType } from '@/lib/enhanced-audit';

/**
 * POST /api/v1/auth/2fa/verify
 * Verify and enable 2FA
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not setup. Call /setup first' },
        { status: 400 }
      );
    }

    // Verify code
    const isValid = verifyTotpCode(dbUser.twoFactorSecret, code);

    if (!isValid) {
      await createAuditLog({
        eventType: AuditEventType.TWO_FACTOR_FAILED,
        actorUserId: user.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
      });

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.userId },
      data: { twoFactorEnabled: true },
    });

    await createAuditLog({
      eventType: AuditEventType.TWO_FACTOR_VERIFIED,
      actorUserId: user.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('[2FA Verify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}

