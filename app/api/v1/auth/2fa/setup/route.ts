import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateTotpSecret, generateQrCodeUrl, generateBackupCodes, hashBackupCode } from '@/lib/totp';
import { prisma } from '@packages/core-db';
import { createAuditLog, AuditEventType } from '@/lib/enhanced-audit';

/**
 * POST /api/v1/auth/2fa/setup
 * Setup 2FA for user
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate secret and backup codes
    const secret = generateTotpSecret();
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Store secret and backup codes (not enabled yet)
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes,
      },
    });

    // Generate QR code URL
    const qrCodeUrl = generateQrCodeUrl(secret, dbUser.email);

    await createAuditLog({
      eventType: AuditEventType.TWO_FACTOR_ENABLED,
      actorUserId: user.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { step: 'setup' },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes, // Show once during setup
      },
    });
  } catch (error) {
    console.error('[2FA Setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

