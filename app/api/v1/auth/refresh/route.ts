import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/packages/core-auth/src/jwt';
import { randomBytes } from 'crypto';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { getRefreshToken, setAuthCookies } from '@/lib/cookie-helpers';
import { createAuditLog, AuditEventType } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkAuthRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many token refresh attempts. Please try again after ${new Date(rateLimitResult.reset).toLocaleTimeString()}` },
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

    const body = await request.json().catch(() => ({}));

    // Get refresh token from cookie or request body
    const refreshToken = getRefreshToken(request, body.refreshToken);

    // Validation
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Fetch user to get current verification status
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        nafathVerified: true,
        nafathVerifiedAt: true,
        nafathExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Revoke old refresh token
    await prisma.revokedToken.create({
      data: {
        jti: payload.jti,
      },
    }).catch((error) => {
      // Ignore unique constraint violation (token already revoked)
      if (!error.message.includes('Unique constraint')) {
        throw error;
      }
    });

    // Generate new tokens with fresh JTI
    const newJti = randomBytes(16).toString('hex');
    const newAccessToken = generateAccessToken(user.id, newJti, user.role, {
      nafathVerified: user.nafathVerified,
      nafathVerifiedAt: user.nafathVerifiedAt || undefined,
      nafathExpiresAt: user.nafathExpiresAt || undefined,
    });
    const newRefreshToken = generateRefreshToken(user.id, newJti, user.role, {
      nafathVerified: user.nafathVerified,
      nafathVerifiedAt: user.nafathVerifiedAt || undefined,
      nafathExpiresAt: user.nafathExpiresAt || undefined,
    });

    // Log token refresh
    await createAuditLog({
      eventType: AuditEventType.TOKEN_REFRESH,
      actorUserId: user.id,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    });

    // ✅ Create response WITHOUT tokens in body (XSS protection)
    const response = NextResponse.json({
      data: {
        // ❌ NO accessToken or refreshToken in response body
        // Tokens are set as httpOnly cookies for XSS protection
        message: 'Tokens refreshed successfully'
      },
    });

    // ✅ Set new tokens as httpOnly cookies (only way to access tokens)
    return setAuthCookies(response, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
