import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { cancelBookingReminders, scheduleBookingReminders } from '@packages/core-queue';
import { z } from 'zod';

const updateBookingSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).max(480).optional(),
  meetingType: z.enum(['in-person', 'video', 'phone']).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  meetingPassword: z.string().optional(),
  casterNotes: z.string().optional(),
  talentNotes: z.string().optional(),
  cancellationReason: z.string().optional(),
});

/**
 * GET /api/v1/bookings/[id]
 * Get a specific booking
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

    // 2. Get booking
    const resolvedParams = await params;
    const booking = await prisma.auditionBooking.findUnique({
      where: { id: resolvedParams.id },
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        caster: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        castingCall: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
            coverLetter: true,
            headshotUrl: true,
            portfolioUrl: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 3. Verify user has access to this booking
    if (booking.talentUserId !== payload.userId && booking.casterUserId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/bookings/[id]
 * Update a booking (reschedule, cancel, etc.)
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

    // 2. Get existing booking
    const resolvedParams = await params;
    const existingBooking = await prisma.auditionBooking.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 3. Verify user has access
    if (existingBooking.talentUserId !== payload.userId && existingBooking.casterUserId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // 4. Parse and validate request
    const body = await req.json();
    const validatedData = updateBookingSchema.parse(body);

    // 5. Build update data
    const updateData: {
      status?: string;
      scheduledAt?: Date;
      duration?: number;
      meetingType?: string;
      location?: string;
      meetingUrl?: string;
      meetingPassword?: string;
      casterNotes?: string;
      talentNotes?: string;
      cancelledBy?: string;
      cancelledAt?: Date;
      cancellationReason?: string;
    } = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
      
      // If cancelling, record who cancelled and when
      if (validatedData.status === 'cancelled') {
        updateData.cancelledBy = payload.userId;
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = validatedData.cancellationReason;
        
        // Cancel scheduled reminders
        try {
          await cancelBookingReminders(resolvedParams.id);
        } catch (error) {
          console.error('[Bookings API] Failed to cancel reminders:', error);
        }
      }
    }

    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt);
      
      // Reschedule reminders if time changed
      try {
        await cancelBookingReminders(resolvedParams.id);
        await scheduleBookingReminders(resolvedParams.id, updateData.scheduledAt);
      } catch (error) {
        console.error('[Bookings API] Failed to reschedule reminders:', error);
      }
    }

    if (validatedData.duration !== undefined) {
      updateData.duration = validatedData.duration;
    }

    if (validatedData.meetingType) {
      updateData.meetingType = validatedData.meetingType;
    }

    if (validatedData.location !== undefined) {
      updateData.location = validatedData.location;
    }

    if (validatedData.meetingUrl !== undefined) {
      updateData.meetingUrl = validatedData.meetingUrl;
    }

    if (validatedData.meetingPassword !== undefined) {
      updateData.meetingPassword = validatedData.meetingPassword;
    }

    if (validatedData.casterNotes !== undefined) {
      updateData.casterNotes = validatedData.casterNotes;
    }

    if (validatedData.talentNotes !== undefined) {
      updateData.talentNotes = validatedData.talentNotes;
    }

    // 6. Update booking
    const updatedBooking = await prisma.auditionBooking.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        caster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        castingCall: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // TODO: Send notification to other party about the update
    // TODO: Update calendar event

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/bookings/[id]
 * Delete a booking (hard delete)
 */
export async function DELETE(
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

    // 2. Get booking
    const resolvedParams = await params;
    const booking = await prisma.auditionBooking.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 3. Verify user has access (only caster can hard delete)
    if (booking.casterUserId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the caster can delete bookings' },
        { status: 403 }
      );
    }

    // 4. Delete booking
    await prisma.auditionBooking.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
