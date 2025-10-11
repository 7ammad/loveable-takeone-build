import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const [pendingItems, totalCount] = await Promise.all([
      prisma.castingCall.findMany({
        where: {
          status: 'pending_review',
          isAggregated: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.castingCall.count({
        where: {
          status: 'pending_review',
          isAggregated: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: pendingItems,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch validation queue:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch validation queue',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 },
    );
  }
};
