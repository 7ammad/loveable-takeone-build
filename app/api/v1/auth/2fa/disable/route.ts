import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { verifyTotpCode, verifyBackupCode } from '@/lib/totp';
import { prisma } from '@packages/core-db';
import { createAuditLog, AuditEventType } from '@/lib/enhanced-audit';

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA for user
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, backupCode } = await request.json();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!dbUser?.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify either TOTP code or backup code
    let isValid = false;

    if (code && dbUser.twoFactorSecret) {
      isValid = verifyTotpCode(dbUser.twoFactorSecret, code);
    } else if (backupCode && dbUser.backupCodes.length > 0) {
      isValid = verifyBackupCode(backupCode, dbUser.backupCodes);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 401 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    await createAuditLog({
      eventType: AuditEventType.TWO_FACTOR_DISABLED,
      actorUserId: user.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      severity: 'warning',
    });

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('[2FA Disable] Error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}

