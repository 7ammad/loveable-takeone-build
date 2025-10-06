import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { generateAccessToken, generateRefreshToken } from '@/packages/core-auth/src/jwt';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkAuthRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again after ${new Date(rateLimitResult.reset).toLocaleTimeString()}` },
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
    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Role validation
    if (!['talent', 'caster'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "talent" or "caster"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        emailVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        nafathVerified: true,
        nafathVerifiedAt: true,
        nafathNationalId: true,
        nafathExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create role-specific profile
    if (role === 'talent') {
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          verified: false,
          isMinor: false,
          completionPercentage: 10, // Name and email only
        },
      });
    } else if (role === 'caster') {
      await prisma.casterProfile.create({
        data: {
          userId: user.id,
          verified: false,
        },
      });
    }

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

    // Return success response
    return NextResponse.json({
      data: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          nafathVerifiedAt: user.nafathVerifiedAt?.toISOString(),
          nafathExpiresAt: user.nafathExpiresAt?.toISOString(),
        },
        accessToken,
        refreshToken,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
