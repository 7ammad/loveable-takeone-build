import { NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jti = searchParams.get('jti');

    if (!jti) {
      // Return all revoked tokens
      const revokedTokens = await prisma.revokedToken.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return NextResponse.json({
        success: true,
        revokedTokens,
        count: revokedTokens.length
      });
    }

    // Check specific JTI
    const isRevoked = await prisma.revokedToken.findUnique({
      where: { jti }
    });

    return NextResponse.json({
      success: true,
      jti,
      isRevoked: !!isRevoked,
      revokedToken: isRevoked
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
