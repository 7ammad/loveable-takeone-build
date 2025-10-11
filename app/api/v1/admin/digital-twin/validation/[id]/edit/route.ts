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

    const updateData = await request.json();

    // Update the casting call with corrected data
    const castingCall = await prisma.castingCall.update({
      where: { id },
      data: {
        ...updateData,
        status: 'active', // Approve after editing
      },
    });

    // TODO: Trigger indexing in Algolia via core-search package
    // This should be done via the indexerQueue

    // Log the edit and approval
    await prisma.auditEvent.create({
      data: {
        eventType: 'CastingCallEditedAndApproved',
        resourceType: 'CastingCall',
        resourceId: id,
        metadata: {
          changes: updateData,
          wasAggregated: castingCall.isAggregated,
          sourceUrl: castingCall.sourceUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: castingCall,
      message: 'Casting call updated and approved successfully',
    });

  } catch (error) {
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    console.error('Failed to edit and approve casting call:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to edit and approve casting call',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
