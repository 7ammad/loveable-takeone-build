/**
 * Admin API: Get pending casting calls for validation
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (req: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

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
};
