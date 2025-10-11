import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireCaster } from '@/lib/auth-helpers';

type Params = { talentId: string };

/**
 * DELETE /api/v1/talent/shortlist/[talentId]
 * Remove talent from shortlist (casters only)
 */
export const DELETE = requireCaster()(async (
  _req: NextRequest,
  { params }: { params: Promise<Params> },
  user,
) => {
  try {
    const { talentId } = await params;

    const deletedShortlist = await prisma.talentShortlist.delete({
      where: {
        casterUserId_talentUserId: {
          casterUserId: user.userId,
          talentUserId: talentId,
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

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Talent not found in shortlist' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/v1/talent/shortlist/[talentId]
 * Update shortlist entry (notes, tags)
 */
export const PATCH = requireCaster()(async (
  req: NextRequest,
  { params }: { params: Promise<Params> },
  user,
) => {
  try {
    const { talentId } = await params;
    const body = await req.json();

    const updatedShortlist = await prisma.talentShortlist.update({
      where: {
        casterUserId_talentUserId: {
          casterUserId: user.userId,
          talentUserId: talentId,
        },
      },
      data: {
        notes: body.notes ?? undefined,
        tags: body.tags ?? undefined,
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

    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Talent not found in shortlist' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});
