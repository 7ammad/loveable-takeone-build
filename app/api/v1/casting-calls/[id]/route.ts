import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { getCurrentUser, requireOwnership, isErrorResponse } from '@/lib/auth-helpers';

/**
 * GET /api/v1/casting-calls/[id]
 * Get a single casting call by ID
 * Public for published calls, owner/admin only for drafts
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

    // ✅ Published calls are public, draft/pending need ownership check
    if (castingCall.status === 'draft' || castingCall.status === 'pending_review') {
      const user = await getCurrentUser(req);
      
      // If not authenticated, hide draft calls
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Casting call not found' },
          { status: 404 }
        );
      }

      // Check if user is owner or admin
      if (user.role !== 'admin' && castingCall.createdBy !== user.userId) {
        return NextResponse.json(
          { success: false, error: 'Casting call not found' },
          { status: 404 }
        );
      }
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

/**
 * PATCH /api/v1/casting-calls/[id]
 * Update a casting call (owner only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get casting call to check ownership
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
      select: { createdBy: true, status: true },
    });

    if (!castingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // ✅ Check ownership
    const userOrError = await requireOwnership(req, castingCall.createdBy!);
    if (isErrorResponse(userOrError)) return userOrError;

    // Get update data
    const updates = await req.json();

    // Update casting call
    const updated = await prisma.castingCall.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[Casting Call API] Error updating casting call:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/casting-calls/[id]
 * Delete a casting call (owner only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get casting call to check ownership
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
      select: { createdBy: true },
    });

    if (!castingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // ✅ Check ownership
    const userOrError = await requireOwnership(req, castingCall.createdBy!);
    if (isErrorResponse(userOrError)) return userOrError;

    // Soft delete (set status to cancelled/deleted)
    await prisma.castingCall.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      success: true,
      message: 'Casting call deleted successfully',
    });
  } catch (error) {
    console.error('[Casting Call API] Error deleting casting call:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
