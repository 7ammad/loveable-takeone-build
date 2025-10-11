/**
 * Account Lockout and Brute Force Protection
 * Implements progressive delays and account locking
 */

import { prisma } from '@packages/core-db';

export interface LockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutUntil?: Date;
  shouldDelay: boolean;
  delaySeconds: number;
}

/**
 * Lockout configuration
 */
export const LOCKOUT_CONFIG = {
  maxAttempts: 5, // Lock after 5 failed attempts
  lockoutDurationMinutes: 30, // Lock for 30 minutes
  resetAfterMinutes: 15, // Reset counter after 15 minutes of no attempts
  progressiveDelays: [0, 1, 2, 5, 10], // Delays in seconds after each attempt
} as const;

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(
  email: string,
  ipAddress: string
): Promise<LockoutStatus> {
  const now = new Date();
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      failedLoginAttempts: true,
      lastFailedLoginAt: true,
      accountLockedUntil: true,
    },
  });

  if (!user) {
    // Don't reveal if user exists (security)
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts - 1,
      shouldDelay: true,
      delaySeconds: 2,
    };
  }

  // Check if account is currently locked
  if (user.accountLockedUntil && user.accountLockedUntil > now) {
    const remainingSeconds = Math.ceil(
      (user.accountLockedUntil.getTime() - now.getTime()) / 1000
    );
    
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutUntil: user.accountLockedUntil,
      shouldDelay: false,
      delaySeconds: 0,
    };
  }

  // Reset counter if last attempt was > resetAfterMinutes ago
  const resetThreshold = new Date(
    now.getTime() - LOCKOUT_CONFIG.resetAfterMinutes * 60 * 1000
  );
  
  let attempts = user.failedLoginAttempts || 0;
  
  if (user.lastFailedLoginAt && user.lastFailedLoginAt < resetThreshold) {
    attempts = 0; // Reset counter
  }

  // Increment attempts
  attempts += 1;
  
  // Determine if should lock
  const shouldLock = attempts >= LOCKOUT_CONFIG.maxAttempts;
  const lockoutUntil = shouldLock
    ? new Date(now.getTime() + LOCKOUT_CONFIG.lockoutDurationMinutes * 60 * 1000)
    : null;

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: attempts,
      lastFailedLoginAt: now,
      accountLockedUntil: lockoutUntil,
    },
  });

  // Calculate delay (progressive)
  const delayIndex = Math.min(attempts - 1, LOCKOUT_CONFIG.progressiveDelays.length - 1);
  const delaySeconds = LOCKOUT_CONFIG.progressiveDelays[delayIndex];

  // Log security event
  await prisma.auditEvent.create({
    data: {
      eventType: 'failed_login',
      actorUserId: user.id,
      ipAddress,
      metadata: {
        attempts,
        locked: shouldLock,
      },
      success: false,
      timestamp: now,
    },
  });

  return {
    isLocked: shouldLock,
    remainingAttempts: Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempts),
    lockoutUntil: lockoutUntil || undefined,
    shouldDelay: true,
    delaySeconds,
  };
}

/**
 * Check if account is locked
 */
export async function checkAccountLocked(email: string): Promise<LockoutStatus> {
  const now = new Date();
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
    },
  });

  if (!user) {
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts,
      shouldDelay: false,
      delaySeconds: 0,
    };
  }

  // Check if locked
  if (user.accountLockedUntil && user.accountLockedUntil > now) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutUntil: user.accountLockedUntil,
      shouldDelay: false,
      delaySeconds: 0,
    };
  }

  const attempts = user.failedLoginAttempts || 0;
  
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempts),
    shouldDelay: false,
    delaySeconds: 0,
  };
}

/**
 * Reset failed login attempts (on successful login)
 */
export async function resetFailedLogins(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      accountLockedUntil: null,
    },
  });
}

/**
 * Manually unlock account (admin action)
 */
export async function unlockAccount(
  userId: string,
  adminUserId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      accountLockedUntil: null,
    },
  });

  // Log admin action
  await prisma.auditEvent.create({
    data: {
      eventType: 'account_unlocked',
      actorUserId: adminUserId,
      resourceType: 'user',
      resourceId: userId,
      timestamp: new Date(),
    },
  });
}

/**
 * Apply progressive delay (use in login endpoint)
 */
export async function applyProgressiveDelay(seconds: number): Promise<void> {
  if (seconds > 0) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
}

/**
 * Format lockout message for user
 */
export function getLockoutMessage(status: LockoutStatus): string {
  if (status.isLocked && status.lockoutUntil) {
    const minutes = Math.ceil(
      (status.lockoutUntil.getTime() - Date.now()) / 1000 / 60
    );
    return `Account locked due to multiple failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (status.remainingAttempts <= 2 && status.remainingAttempts > 0) {
    return `Invalid credentials. ${status.remainingAttempts} attempt${status.remainingAttempts !== 1 ? 's' : ''} remaining before lockout`;
  }

  return 'Invalid credentials';
}

