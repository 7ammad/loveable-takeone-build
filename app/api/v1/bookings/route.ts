import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { scheduleBookingReminders } from '@packages/core-queue';
import { z } from 'zod';

const createBookingSchema = z.object({
  applicationId: z.string(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  timezone: z.string().default('Asia/Riyadh'),
  meetingType: z.enum(['in-person', 'video', 'phone']),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  meetingPassword: z.string().optional(),
  casterNotes: z.string().optional(),
  calcomEventId: z.string().optional(),
  calcomBookingUid: z.string().optional(),
});

/**
 * POST /api/v1/bookings
 * Create a new audition booking
 */
export async function POST(req: NextRequest) {
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

    // 2. Parse and validate request
    const body = await req.json();
    const validatedData = createBookingSchema.parse(body);

    // 3. Get the application and verify permissions
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
      include: {
        castingCall: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
        talentUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only the caster who created the casting call can book auditions
    if (application.castingCall.createdBy !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the casting call creator can book auditions' },
        { status: 403 }
      );
    }

    // Check if booking already exists
    const existingBooking = await prisma.auditionBooking.findUnique({
      where: { applicationId: validatedData.applicationId },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking already exists for this application' },
        { status: 400 }
      );
    }

    // 4. Create the booking
    const booking = await prisma.auditionBooking.create({
      data: {
        applicationId: validatedData.applicationId,
        talentUserId: application.talentUserId,
        casterUserId: payload.userId,
        castingCallId: application.castingCallId,
        scheduledAt: new Date(validatedData.scheduledAt),
        duration: validatedData.duration,
        timezone: validatedData.timezone,
        meetingType: validatedData.meetingType,
        location: validatedData.location,
        meetingUrl: validatedData.meetingUrl,
        meetingPassword: validatedData.meetingPassword,
        casterNotes: validatedData.casterNotes,
        calcomEventId: validatedData.calcomEventId,
        calcomBookingUid: validatedData.calcomBookingUid,
        status: 'scheduled',
      },
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

    // Schedule automated reminders (24h and 1h before)
    try {
      await scheduleBookingReminders(booking.id, booking.scheduledAt);
    } catch (error) {
      console.error('[Bookings API] Failed to schedule reminders:', error);
      // Don't fail the request if reminder scheduling fails
    }

    // TODO: Send immediate confirmation email/SMS to both parties
    // TODO: Add to calendar (Google Calendar API)

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 201 }
    );
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
 * GET /api/v1/bookings
 * Get all bookings for the authenticated user
 */
export async function GET(req: NextRequest) {
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

    // 2. Get query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const upcoming = url.searchParams.get('upcoming') === 'true';

    // 3. Build where clause
    const where: {
      OR?: Array<{ talentUserId: string } | { casterUserId: string }>;
      status?: { in: string[] } | string;
      scheduledAt?: { gte: Date };
    } = {
      OR: [
        { talentUserId: payload.userId },
        { casterUserId: payload.userId },
      ],
    };

    // Handle multiple statuses (comma-separated)
    if (statusParam) {
      const statuses = statusParam.split(',').map(s => s.trim());
      if (statuses.length > 1) {
        where.status = { in: statuses };
      } else {
        where.status = statuses[0];
      }
    }

    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
    }

    // 4. Get bookings
    const bookings = await prisma.auditionBooking.findMany({
      where,
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
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
