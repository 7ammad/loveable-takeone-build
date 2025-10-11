import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { generateAccessToken, generateRefreshToken } from '@/packages/core-auth/src/jwt';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { checkLoginRateLimit } from '@/lib/auth-rate-limit';
import { setAuthCookies } from '@/lib/cookie-helpers';
import { createAuditLog, AuditEventType } from '@/lib/auth-helpers';
import { 
  checkAccountLocked, 
  recordFailedLogin, 
  resetFailedLogins, 
  applyProgressiveDelay, 
  getLockoutMessage 
} from '@/lib/account-lockout';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (stricter for login to prevent brute force)
    const rateLimitResult = await checkLoginRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again after ${new Date(rateLimitResult.reset).toLocaleTimeString()}` },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }
    
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ✅ Issue #17: Check account lockout status
    const lockoutStatus = await checkAccountLocked(email.toLowerCase());
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        { error: getLockoutMessage(lockoutStatus) },
        { status: 403 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        emailVerified: true,
        nafathVerified: true,
        nafathVerifiedAt: true,
        nafathNationalId: true,
        nafathExpiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // ✅ Issue #17: Record failed login attempt
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                       request.headers.get('x-real-ip') || 'unknown';
      
      const failureStatus = await recordFailedLogin(email.toLowerCase(), ipAddress);
      
      // Apply progressive delay (slows down brute force)
      if (failureStatus.shouldDelay) {
        await applyProgressiveDelay(failureStatus.delaySeconds);
      }
      
      // Log failed login attempt
      await createAuditLog({
        eventType: AuditEventType.LOGIN_FAILED,
        actorUserId: user.id,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        errorMessage: 'Invalid password',
      });

      return NextResponse.json(
        { error: getLockoutMessage(failureStatus) },
        { status: 401 }
      );
    }

    // ✅ Issue #17: Reset failed login attempts on successful login
    await resetFailedLogins(user.id);
    
    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT tokens
    const jti = randomBytes(16).toString('hex');
    const accessToken = generateAccessToken(user.id, jti, user.role, {
      nafathVerified: user.nafathVerified,
      nafathVerifiedAt: user.nafathVerifiedAt || undefined,
      nafathExpiresAt: user.nafathExpiresAt || undefined,
    });
    const refreshToken = generateRefreshToken(user.id, jti, user.role, {
      nafathVerified: user.nafathVerified,
      nafathVerifiedAt: user.nafathVerifiedAt || undefined,
      nafathExpiresAt: user.nafathExpiresAt || undefined,
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login
    await createAuditLog({
      eventType: AuditEventType.LOGIN_SUCCESS,
      actorUserId: user.id,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    });

    // ✅ Create response WITHOUT tokens in body (XSS protection)
    const response = NextResponse.json({
      data: {
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          nafathVerifiedAt: user.nafathVerifiedAt?.toISOString(),
          nafathExpiresAt: user.nafathExpiresAt?.toISOString(),
        },
        // ❌ NO accessToken or refreshToken in response body
        // Tokens are set as httpOnly cookies for XSS protection
      },
    });

    // ✅ Set httpOnly cookies (only way to access tokens)
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
