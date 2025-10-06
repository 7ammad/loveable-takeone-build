import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const shortlistSchema = z.object({
  talentUserId: z.string().min(1, 'Talent user ID is required'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/v1/talent/shortlist
 * Add talent to shortlist (casters only)
 */
export async function POST(req: NextRequest) {
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
        { success: false, error: 'Only casters can shortlist talent' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = shortlistSchema.parse(body);

    // 4. Check if talent user exists
    const talentUser = await prisma.user.findUnique({
      where: { id: validatedData.talentUserId },
      select: { id: true, role: true },
    });

    if (!talentUser || talentUser.role !== 'talent') {
      return NextResponse.json(
        { success: false, error: 'Talent not found' },
        { status: 404 }
      );
    }

    // 5. Check if already shortlisted
    const existingShortlist = await prisma.talentShortlist.findUnique({
      where: {
        casterUserId_talentUserId: {
          casterUserId: payload.userId,
          talentUserId: validatedData.talentUserId,
        },
      },
    });

    if (existingShortlist) {
      return NextResponse.json(
        { success: false, error: 'Talent already in shortlist' },
        { status: 400 }
      );
    }

    // 6. Add to shortlist
    const shortlist = await prisma.talentShortlist.create({
      data: {
        casterUserId: payload.userId,
        talentUserId: validatedData.talentUserId,
        notes: validatedData.notes || null,
        tags: validatedData.tags || [],
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
      data: shortlist,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Talent Shortlist API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/talent/shortlist
 * Get caster's shortlisted talent
 */
export async function GET(req: NextRequest) {
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
        { success: false, error: 'Only casters can view shortlist' },
        { status: 403 }
      );
    }

    // 3. Get query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const tag = url.searchParams.get('tag');
    const skip = (page - 1) * limit;

    // 4. Build where clause
    const where: {
      casterUserId: string;
      tags?: { has: string };
    } = {
      casterUserId: payload.userId,
    };

    if (tag) {
      where.tags = { has: tag };
    }

    // 5. Fetch shortlisted talent
    const [shortlists, total] = await Promise.all([
      prisma.talentShortlist.findMany({
        where,
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.talentShortlist.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        shortlists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Talent Shortlist API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
