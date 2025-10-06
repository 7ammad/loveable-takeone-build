import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';

/**
 * DELETE /api/v1/talent/shortlist/[talentId]
 * Remove talent from shortlist (casters only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ talentId: string }> }
) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Verify user is caster
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can manage shortlist' },
        { status: 403 }
      );
    }

    // 3. Remove from shortlist
    const resolvedParams = await params;
    const deletedShortlist = await prisma.talentShortlist.delete({
      where: {
        casterUserId_talentUserId: {
          casterUserId: payload.userId,
          talentUserId: resolvedParams.talentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Talent removed from shortlist',
      data: { talentUserId: deletedShortlist.talentUserId },
    });
  } catch (error) {
    console.error('[Talent Shortlist API] Error:', error);
    
    // Handle case where shortlist entry doesn't exist
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Talent not found in shortlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/talent/shortlist/[talentId]
 * Update shortlist entry (notes, tags)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ talentId: string }> }
) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Verify user is caster
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can manage shortlist' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { notes, tags } = body;

    // 4. Update shortlist entry
    const resolvedParams = await params;
    const updatedShortlist = await prisma.talentShortlist.update({
      where: {
        casterUserId_talentUserId: {
          casterUserId: payload.userId,
          talentUserId: resolvedParams.talentId,
        },
      },
      data: {
        notes: notes !== undefined ? notes : undefined,
        tags: tags !== undefined ? tags : undefined,
      },
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedShortlist,
    });
  } catch (error) {
    console.error('[Talent Shortlist API] Error:', error);
    
    // Handle case where shortlist entry doesn't exist
    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Talent not found in shortlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
