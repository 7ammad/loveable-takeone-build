import { NextRequest, NextResponse } from 'next/server';
import { requireCasterDirect, isErrorResponse } from '@/lib/auth-helpers';
import { prisma } from '@packages/core-db';

/**
 * GET /api/v1/casting-calls/[id]/applications
 * Get all applications for a specific casting call (caster only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify user is a caster or admin
    const userOrError = await requireCasterDirect(req);
    if (isErrorResponse(userOrError)) {
      return userOrError;
    }
    const user = userOrError;

    const { id } = await params;

    // 2. Verify casting call exists and user owns it (or is admin)
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
    
    // Ownership check
    if (user.role !== 'admin' && castingCall.createdBy !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // 3. Get applications for this casting call
    const applications = await prisma.application.findMany({
      where: { castingCallId: id },
      include: {
        // Include talent profile information
        talentUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Transform data for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      castingCallId: app.castingCallId,
      talentUserId: app.talentUserId,
      talentName: app.talentUser?.name || 'Unknown',
      status: app.status,
      coverLetter: app.coverLetter,
      availability: app.availability,
      contactPhone: app.contactPhone,
      headshotUrl: app.headshotUrl,
      portfolioUrl: app.portfolioUrl,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedApplications,
    });
  } catch (error) {
    console.error('[Casting Call Applications API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
