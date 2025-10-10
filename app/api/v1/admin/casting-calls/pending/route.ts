/**
 * Admin API: Get pending casting calls for validation
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { withAdminAuth } from '@packages/core-security/src/admin-auth';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    // Fetch pending casting calls (aggregated ones awaiting review)
    const pendingCalls = await prisma.castingCall.findMany({
      where: {
        isAggregated: true,
        status: 'pending_review',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: pendingCalls });
  } catch (error) {
    console.error('[Admin] Error fetching pending calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending calls' },
      { status: 500 }
    );
  }
});
