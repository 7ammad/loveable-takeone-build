import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { z } from 'zod';
import { requireCaster } from '@/lib/auth-helpers';
import { createErrorResponse } from '@/lib/error-handler';

const shortlistSchema = z.object({
  talentUserId: z.string().min(1, 'Talent user ID is required'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/v1/talent/shortlist
 * Add talent to shortlist (casters only)
 */
export const POST = requireCaster()(async (req: NextRequest, _context, user) => {
  try {
    const body = await req.json();
    const validatedData = shortlistSchema.parse(body);

    const talentUser = await prisma.user.findUnique({
      where: { id: validatedData.talentUserId },
      select: { id: true, role: true },
    });

    if (!talentUser || talentUser.role !== 'talent') {
      return NextResponse.json(
        { success: false, error: 'Talent not found' },
        { status: 404 },
      );
    }

    const existingShortlist = await prisma.talentShortlist.findUnique({
      where: {
        casterUserId_talentUserId: {
          casterUserId: user.userId,
          talentUserId: validatedData.talentUserId,
        },
      },
    });

    if (existingShortlist) {
      return NextResponse.json(
        { success: false, error: 'Talent already in shortlist' },
        { status: 400 },
      );
    }

    const shortlist = await prisma.talentShortlist.create({
      data: {
        casterUserId: user.userId,
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

    return NextResponse.json(
      {
        success: true,
        data: shortlist,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error, {
      functionName: '[Talent Shortlist API] Error adding talent',
    });
  }
});

/**
 * GET /api/v1/talent/shortlist
 * Get caster's shortlisted talent
 */
export const GET = requireCaster()(async (req: NextRequest, _context, user) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const tag = url.searchParams.get('tag');
    const skip = (page - 1) * limit;

    const where: {
      casterUserId: string;
      tags?: { has: string };
    } = {
      casterUserId: user.userId,
    };

    if (tag) {
      where.tags = { has: tag };
    }

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
    return createErrorResponse(error, {
      functionName: '[Talent Shortlist API] Error fetching shortlist',
    });
  }
});
