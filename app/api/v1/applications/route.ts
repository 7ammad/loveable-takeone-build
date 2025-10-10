import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@packages/core-auth';
import { z } from 'zod';
import { sendNewApplicationNotification } from '@packages/core-notify/src/notification-service';

const prisma = new PrismaClient();

// Validation schema - all fields except castingCallId are optional for one-click apply
const CreateApplicationSchema = z.object({
  castingCallId: z.string().min(1, 'Casting call ID is required'),
  coverLetter: z.string().optional(),
  availability: z.string().optional(),
  contactPhone: z.string().optional(),
  headshotUrl: z.string().url('Invalid headshot URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Verify user is talent
    if (payload.role !== 'talent') {
      return NextResponse.json(
        { error: 'Only talent can submit applications' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    console.log('[Applications API] Request body:', body);
    const validatedData = CreateApplicationSchema.parse(body);
    console.log('[Applications API] Validated data:', validatedData);

    // 4. Check if casting call exists
    const castingCall = await prisma.castingCall.findUnique({
      where: { id: validatedData.castingCallId },
    });

    if (!castingCall) {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // 5. Check if user already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        castingCallId: validatedData.castingCallId,
        talentUserId: payload.userId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this casting call' },
        { status: 400 }
      );
    }

    // 6. Get user profile data for one-click apply fallback
    const userProfile = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        phone: true,
        avatar: true,
        bio: true,
      },
    });

    // Use profile data as fallback
    const coverLetter = validatedData.coverLetter || 
      'I am interested in this opportunity and believe my profile demonstrates my qualifications for this role.';
    const availability = validatedData.availability || 
      'Please contact me to discuss availability';
    const contactPhone = validatedData.contactPhone || 
      userProfile?.phone || 
      null;
    const headshotUrl = validatedData.headshotUrl || 
      userProfile?.avatar || 
      null;
    const portfolioUrl = validatedData.portfolioUrl || 
      null;

    // 7. Create application
    console.log('[Applications API] Creating application with data:', {
      castingCallId: validatedData.castingCallId,
      talentUserId: payload.userId,
      status: 'pending',
      coverLetter,
      availability,
      contactPhone,
      headshotUrl,
      portfolioUrl,
    });
    
    const application = await prisma.application.create({
      data: {
        castingCallId: validatedData.castingCallId,
        talentUserId: payload.userId,
        status: 'pending',
        coverLetter,
        availability,
        contactPhone,
        headshotUrl,
        portfolioUrl,
      },
    });
    
    console.log('[Applications API] Application created successfully:', application.id);

    // 8. Create status event
    await prisma.applicationStatusEvent.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: 'pending',
        actorUserId: payload.userId,
      },
    });

    // 9. Send notification to caster (if casting call has an owner)
    try {
      // Get talent user details for notification
      const talentUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true },
      });

      // Send notification if casting call has a creator and talent user exists
      if (talentUser && castingCall.createdBy) {
        await sendNewApplicationNotification(
          castingCall.createdBy,
          talentUser.name,
          castingCall.title,
          application.id,
          application.createdAt.toISOString()
        );
      }
    } catch (notificationError) {
      console.error('Failed to send new application notification:', notificationError);
      // Don't fail the application submission if notification fails
    }

    // 10. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          applicationId: application.id,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's applications
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Fetch applications based on role
    let applications: unknown[];

    if (payload.role === 'talent') {
      // Fetch applications submitted by this talent
      applications = await prisma.application.findMany({
        where: { talentUserId: payload.userId },
        include: {
          castingCall: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              compensation: true,
              deadline: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (payload.role === 'caster') {
      // Fetch applications for casting calls created by this caster
      // NOTE: This requires a userId field on CastingCall model
      // For now, returning empty array for casters
      applications = [];
    } else {
      applications = [];
    }

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

