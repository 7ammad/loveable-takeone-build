import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createEmailVerificationToken, sendVerificationEmail } from '@/lib/email-verification';
import { prisma } from '@packages/core-db';

/**
 * POST /api/v1/auth/resend-verification
 * Resend email verification
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, emailVerified: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate new token
    const token = await createEmailVerificationToken(user.userId);

    // Send email
    await sendVerificationEmail(dbUser.email, token);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('[Resend Verification] Error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}

