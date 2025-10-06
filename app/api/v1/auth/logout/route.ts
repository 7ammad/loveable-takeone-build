import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Decode token to get JTI (without verifying, as we're logging out anyway)
    const decoded = jwt.decode(token) as { jti?: string } | null;

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

    // Return success response
    return NextResponse.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
