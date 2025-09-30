import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';

// TODO: Add admin authentication middleware
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get pending validation items
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
