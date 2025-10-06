import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const updateCastingCallSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  requirements: z.string().optional(),
  location: z.string().min(2).max(200).optional(),
  compensation: z.string().optional(),
  deadline: z.string().optional(), // ISO date string
  status: z.enum(['published', 'closed', 'draft']).optional(),
});

/**
 * GET /api/v1/casting-calls/[id]
 * Get a single casting call by ID
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
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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

    return NextResponse.json({
      success: true,
      data: castingCall,
    });
  } catch (error) {
    console.error('[Casting Call API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/casting-calls/[id]
 * Update a casting call (caster owner only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 2. Verify user role
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can update casting calls' },
        { status: 403 }
      );
    }

    // 3. Check if casting call exists
    const existingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!existingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // 4. Parse and validate request body
    const body = await req.json();
    const validatedData = updateCastingCallSchema.parse(body);

    // 5. Update casting call
    const updatedCall = await prisma.castingCall.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.requirements !== undefined && { requirements: validatedData.requirements }),
        ...(validatedData.location && { location: validatedData.location }),
        ...(validatedData.compensation !== undefined && { compensation: validatedData.compensation }),
        ...(validatedData.deadline && { deadline: new Date(validatedData.deadline) }),
        ...(validatedData.status && { status: validatedData.status }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCall,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Casting Call Update API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/casting-calls/[id]
 * Delete a casting call (caster owner only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 2. Verify user role
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can delete casting calls' },
        { status: 403 }
      );
    }

    // 3. Check if casting call exists
    const existingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!existingCall) {
      return NextResponse.json(
        { success: false, error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // 4. Delete casting call (cascade will handle applications)
    await prisma.castingCall.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Casting call deleted successfully',
    });
  } catch (error) {
    console.error('[Casting Call Delete API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

