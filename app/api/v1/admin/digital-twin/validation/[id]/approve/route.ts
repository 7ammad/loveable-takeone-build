import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { requireRole } from '@/lib/auth-helpers';

interface PrismaError extends Error {
  code?: string;
}
import { validationQueue } from '@/packages/core-queue/src/queues';

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
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
};
