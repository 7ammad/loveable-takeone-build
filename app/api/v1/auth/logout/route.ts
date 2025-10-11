import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import jwt from 'jsonwebtoken';
import { getAccessToken, clearAuthCookies } from '@/lib/cookie-helpers';
import { createAuditLog, AuditEventType } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or authorization header
    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Decode token to get JTI and userId (without verifying, as we're logging out anyway)
    const decoded = jwt.decode(token) as { jti?: string; userId?: string } | null;

    if (!decoded || !decoded.jti) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Add JTI to revoked tokens table (use upsert to handle duplicates)
    await prisma.revokedToken.upsert({
      where: { jti: decoded.jti },
      update: {}, // No update needed if already exists
      create: {
        jti: decoded.jti,
      },
    });

    // Log logout event
    if (decoded.userId) {
      await createAuditLog({
        eventType: AuditEventType.LOGOUT,
        actorUserId: decoded.userId,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
      });
    }

    // Create response and clear cookies
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    return clearAuthCookies(response);
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
