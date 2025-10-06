import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'under_review', 'shortlisted', 'accepted', 'rejected']),
  notes: z.string().optional(),
});

/**
 * PATCH /api/v1/applications/[id]/status
 * Update application status (caster only)
 */
export async function PATCH(
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

    // 2. Parse and validate request body
    const body = await req.json();
    const validatedData = updateStatusSchema.parse(body);

    // 3. Get application and verify caster owns the casting call
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        castingCall: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // 4. Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
    });

    // 5. Create status event for tracking
    await prisma.applicationStatusEvent.create({
      data: {
        applicationId: id,
        fromStatus: application.status,
        toStatus: validatedData.status,
        at: new Date(),
        actorUserId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Application Status API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
