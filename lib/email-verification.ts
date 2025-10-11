/**
 * Email Verification Service
 * Handle email verification tokens and flow
 */

import { randomBytes } from 'crypto';
import { prisma } from '@packages/core-db';

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Create verification token for user
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
    },
  });

  return token;
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid verification token' };
  }

  if (user.emailVerified) {
    return { success: false, error: 'Email already verified' };
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    return { success: false, error: 'Verification token has expired' };
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  return { success: true, userId: user.id };
}

/**
 * Check if user needs email verification
 */
export async function needsEmailVerification(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return !user?.emailVerified;
}

/**
 * Send verification email (placeholder)
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log('[EMAIL] Verification email would be sent to:', email);
  console.log('[EMAIL] Verification URL:', verificationUrl);
  
  // In production, use actual email service:
  // await emailService.send({
  //   to: email,
  //   subject: 'Verify your email address',
  //   html: `Click here to verify: <a href="${verificationUrl}">${verificationUrl}</a>`,
  // });
}

