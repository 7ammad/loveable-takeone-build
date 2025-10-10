import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const createCastingCallSchema = z.object({
  title: z.string().min(1).max(200), // Required field in DB
  description: z.string().optional(), // Optional in DB
  requirements: z.string().optional(),
  location: z.string().optional(), // Optional in DB
  compensation: z.string().optional(),
  deadline: z.string().optional(), // Optional in DB
  contactInfo: z.string().optional(),
  company: z.string().optional(), // Field exists in DB
  projectType: z.string().optional(), // Now exists in DB!
  shootingDuration: z.string().optional(), // Now exists in DB!
  attachments: z.array(z.string().url()).optional(), // Array of file URLs
  status: z.enum(['published', 'draft', 'pending_review']).default('published'),
}).refine((data) => {
  // If status is 'published', require title, description, and location
  if (data.status === 'published') {
    return data.title.length >= 5 && data.description && data.description.length >= 20 && data.location && data.location.length >= 2;
  }
  // For drafts, only title is required (minimum content)
  return data.title.length >= 1;
}, {
  message: "For published casting calls, title (min 5 chars), description (min 20 chars), and location (min 2 chars) are required. For drafts, only a title is required.",
});

/**
 * POST /api/v1/casting-calls
 * Create a new casting call (casters only)
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

    // 2. Verify user role
    console.log('[Casting Call Create] User ID:', payload.userId, 'Role:', payload.role);
    if (payload.role !== 'caster') {
      console.log('[Casting Call Create] Access denied - Expected: caster, Got:', payload.role);
      return NextResponse.json(
        { success: false, error: `Only casters can create casting calls. Your role: ${payload.role || 'undefined'}` },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = createCastingCallSchema.parse(body);

    // 4. Create casting call
    const castingCall = await prisma.castingCall.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        requirements: validatedData.requirements || null,
        location: validatedData.location || null,
        compensation: validatedData.compensation || null,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        contactInfo: validatedData.contactInfo || null,
        company: validatedData.company || null,
        projectType: validatedData.projectType || null, // Restored!
        shootingDuration: validatedData.shootingDuration || null, // Restored!
        attachments: validatedData.attachments || [], // File URLs
        status: validatedData.status, // Use the status from the request
        isAggregated: false, // Not from aggregation (caster-created)
        createdBy: payload.userId, // Set the creator
      },
    });

    return NextResponse.json({
      success: true,
      data: castingCall,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Casting Calls API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/casting-calls
 * Get all casting calls (with pagination and filters)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Check if user is authenticated and is a caster
    const authHeader = req.headers.get('authorization');
    let isCaster = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = await verifyAccessToken(token);
        isCaster = payload?.role === 'caster';
      } catch (error) {
        // Token invalid, continue as non-caster
      }
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const location = url.searchParams.get('location');
    const myCallsOnly = url.searchParams.get('myCallsOnly') === 'true'; // New parameter
    const skip = (page - 1) * limit;

    // For casters, include drafts; for others, only published
    const statusFilter = isCaster 
      ? { in: ['published', 'draft'] } 
      : 'open';

    const where: {
      status: string | { in: string[] };
      location?: { contains: string; mode: 'insensitive' };
      createdBy?: string;
    } = {
      status: statusFilter,
    };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // If myCallsOnly is true and user is authenticated, filter by createdBy
    if (myCallsOnly && authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = await verifyAccessToken(token);
        if (payload?.userId) {
          where.createdBy = payload.userId;
        }
      } catch (error) {
        // Token invalid, ignore filter
      }
    }

    const [castingCalls, total] = await Promise.all([
      prisma.castingCall.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.castingCall.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        castingCalls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Casting Calls API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

