import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';

/**
 * GET /api/v1/casting-calls/[id]
 * Get a single casting call by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!castingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // Return the casting call with application count
    return NextResponse.json({
      success: true,
      data: {
        ...castingCall,
        applicationCount: castingCall._count.applications,
      },
    });
  } catch (error) {
    console.error('[Casting Call API] Error fetching casting call:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
