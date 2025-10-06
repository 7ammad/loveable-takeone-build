import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const bulkUpdateSchema = z.object({
  applicationIds: z.array(z.string()).min(1, 'At least one application ID is required'),
  status: z.enum(['pending', 'under_review', 'shortlisted', 'accepted', 'rejected']),
  message: z.string().optional(),
});

/**
 * PATCH /api/v1/applications/bulk
 * Bulk update application statuses (casters only)
 */
export async function PATCH(req: NextRequest) {
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
        { success: false, error: 'Only casters can bulk update applications' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = bulkUpdateSchema.parse(body);

    // 4. Verify all applications belong to this caster's casting calls
    const applications = await prisma.application.findMany({
      where: {
        id: { in: validatedData.applicationIds },
        castingCall: { createdBy: payload.userId },
      },
      include: {
        castingCall: { select: { title: true } },
      },
    });

    if (applications.length !== validatedData.applicationIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some applications not found or not authorized' },
        { status: 403 }
      );
    }

    // 5. Perform bulk update using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update applications
      const updatedApplications = await tx.application.updateMany({
        where: {
          id: { in: validatedData.applicationIds },
        },
        data: {
          status: validatedData.status,
        },
      });

      // Create status events for each application
      const statusEvents = await Promise.all(
        validatedData.applicationIds.map(applicationId =>
          tx.applicationStatusEvent.create({
            data: {
              applicationId,
              fromStatus: 'pending', // We'll get the actual from status if needed
              toStatus: validatedData.status,
              actorUserId: payload.userId,
            },
          })
        )
      );

      return { updatedApplications, statusEvents };
    });

    // 6. Send notifications to talent (if status changed to something other than pending)
    if (validatedData.status !== 'pending') {
      try {
        // Import notification service
        const { sendApplicationStatusUpdateNotification } = await import('@packages/core-notify/src/notification-service');
        
        // Send notifications for each updated application
        await Promise.all(
          applications.map(async (application) => {
            try {
              await sendApplicationStatusUpdateNotification(
                application.talentUserId,
                application.castingCall.title,
                validatedData.status,
                application.id,
                validatedData.message
              );
            } catch (notificationError) {
              console.error(`Failed to send notification for application ${application.id}:`, notificationError);
            }
          })
        );
      } catch (notificationError) {
        console.error('Failed to send bulk notifications:', notificationError);
        // Don't fail the bulk update if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.updatedApplications.count,
        statusEvents: result.statusEvents.length,
        message: `Successfully updated ${result.updatedApplications.count} applications to ${validatedData.status}`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Bulk Applications API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
