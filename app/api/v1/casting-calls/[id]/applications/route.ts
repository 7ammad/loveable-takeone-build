import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
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
    // 1. Verify authentication
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

    const { id } = await params;

    // 2. Verify casting call exists and user owns it (for casters)
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!castingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
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
