import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { requireRole } from '@/lib/auth-helpers';

interface PrismaError extends Error {
  code?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;

    const { reason } = await request.json();

    // Reject the casting call
    const castingCall = await prisma.castingCall.update({
      where: { id },
      data: {
        status: 'rejected',
      },
    });

    // Log the rejection
    await prisma.auditEvent.create({
      data: {
        eventType: 'CastingCallRejected',
        resourceType: 'CastingCall',
        resourceId: id,
        metadata: {
          reason: reason || 'No reason provided',
          wasAggregated: castingCall.isAggregated,
          sourceUrl: castingCall.sourceUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: castingCall,
      message: 'Casting call rejected successfully',
    });

  } catch (error) {
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    console.error('Failed to reject casting call:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reject casting call',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
