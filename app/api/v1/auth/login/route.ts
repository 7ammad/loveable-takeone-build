import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { generateAccessToken, generateRefreshToken } from '@/packages/core-auth/src/jwt';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { checkLoginRateLimit } from '@/lib/auth-rate-limit';

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
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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

    // Return success response
    return NextResponse.json({
      data: {
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          nafathVerifiedAt: user.nafathVerifiedAt?.toISOString(),
          nafathExpiresAt: user.nafathExpiresAt?.toISOString(),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
