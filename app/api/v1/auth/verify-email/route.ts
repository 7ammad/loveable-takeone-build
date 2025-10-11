import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/email-verification';
import { createAuditLog, AuditEventType } from '@/lib/enhanced-audit';

/**
 * POST /api/v1/auth/verify-email
 * Verify user's email address
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    await createAuditLog({
      eventType: AuditEventType.EMAIL_VERIFIED,
      actorUserId: result.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('[Email Verification] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

