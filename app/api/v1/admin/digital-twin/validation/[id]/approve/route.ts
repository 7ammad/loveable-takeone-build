import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';

interface PrismaError extends Error {
  code?: string;
}
import { validationQueue } from '@/packages/core-queue/src/queues';

// TODO: Add admin authentication middleware
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params;

    // Approve the casting call
    const castingCall = await prisma.castingCall.update({
      where: { id },
      data: {
        status: 'active',
      },
    });

    // Queue for Algolia indexing
    await validationQueue.add('process-validation', {
      castingCallId: id,
      action: 'approve',
      timestamp: new Date().toISOString(),
    });

    // Log the approval
    await prisma.auditEvent.create({
      data: {
        eventType: 'CastingCallApproved',
        targetId: id,
        metadata: {
          wasAggregated: castingCall.isAggregated,
          sourceUrl: castingCall.sourceUrl,
          queuedForIndexing: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: castingCall,
      message: 'Casting call approved and published successfully',
    });

  } catch (error) {
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    console.error('Failed to approve casting call:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve casting call',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
