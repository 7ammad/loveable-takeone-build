import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { z } from 'zod';
import { requireCaster } from '@/lib/auth-helpers';

const searchSchema = z.object({
  query: z.string().optional(),
  ageMin: z.number().min(16).max(100).optional(),
  ageMax: z.number().min(16).max(100).optional(),
  experience: z.enum(['0-1', '2-5', '6-10', '10+']).optional(),
  languages: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  willingToTravel: z.boolean().optional(),
  verified: z.boolean().optional(),
  sortBy: z.enum(['name', 'experience', 'rating', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * GET /api/v1/talent/search
 * Advanced talent search with filters
 */
export const GET = requireCaster()(async (req: NextRequest) => {
  try {
    // 1. Parse and validate query parameters
    const url = new URL(req.url);
    const params = {
      query: url.searchParams.get('query') || undefined,
      ageMin: url.searchParams.get('ageMin') ? parseInt(url.searchParams.get('ageMin')!) : undefined,
      ageMax: url.searchParams.get('ageMax') ? parseInt(url.searchParams.get('ageMax')!) : undefined,
      experience: url.searchParams.get('experience') as '0-1' | '2-5' | '6-10' | '10+' | undefined,
      languages: url.searchParams.get('languages')?.split(',').filter(Boolean),
      skills: url.searchParams.get('skills')?.split(',').filter(Boolean),
      location: url.searchParams.get('location') || undefined,
      gender: url.searchParams.get('gender') as 'male' | 'female' | 'other' | undefined,
      willingToTravel: url.searchParams.get('willingToTravel') === 'true' ? true : undefined,
      verified: url.searchParams.get('verified') === 'true' ? true : undefined,
      sortBy: url.searchParams.get('sortBy') as 'name' | 'experience' | 'rating' | 'createdAt' || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20,
    };

    const validatedParams = searchSchema.parse(params);

    // 2. Build where clause
    const where: {
      role: string;
      isActive: boolean;
      OR?: Array<Record<string, unknown>>;
      TalentProfile?: Record<string, unknown>;
    } = {
      role: 'talent',
      isActive: true,
    };

    // Text search across name, bio, and stage name
    if (validatedParams.query) {
      where.OR = [
        { name: { contains: validatedParams.query, mode: 'insensitive' } },
        { bio: { contains: validatedParams.query, mode: 'insensitive' } },
        { TalentProfile: { stageName: { contains: validatedParams.query, mode: 'insensitive' } } },
      ];
    }

    // Age filters (calculate from dateOfBirth)
    if (validatedParams.ageMin || validatedParams.ageMax) {
      const now = new Date();
      const ageFilters: { gte?: Date; lte?: Date } = {};
      
      if (validatedParams.ageMin) {
        const maxBirthDate = new Date(now.getFullYear() - validatedParams.ageMin, now.getMonth(), now.getDate());
        ageFilters.gte = maxBirthDate;
      }
      
      if (validatedParams.ageMax) {
        const minBirthDate = new Date(now.getFullYear() - validatedParams.ageMax - 1, now.getMonth(), now.getDate());
        ageFilters.lte = minBirthDate;
      }
      
      where.TalentProfile = {
        ...where.TalentProfile,
        dateOfBirth: ageFilters,
      };
    }

    // Experience filter
    if (validatedParams.experience) {
      const experienceRanges: Record<string, { gte?: number; lte?: number }> = {
        '0-1': { lte: 1 },
        '2-5': { gte: 2, lte: 5 },
        '6-10': { gte: 6, lte: 10 },
        '10+': { gte: 10 },
      };

      const range = experienceRanges[validatedParams.experience];
      where.TalentProfile = {
        ...where.TalentProfile,
        experience: range,
      };
    }

    // Language filter
    if (validatedParams.languages && validatedParams.languages.length > 0) {
      where.TalentProfile = {
        ...where.TalentProfile,
        languages: {
          hasSome: validatedParams.languages,
        },
      };
    }

    // Skills filter
    if (validatedParams.skills && validatedParams.skills.length > 0) {
      where.TalentProfile = {
        ...where.TalentProfile,
        skills: {
          hasSome: validatedParams.skills,
        },
      };
    }

    // Location filter
    if (validatedParams.location) {
      where.TalentProfile = {
        ...where.TalentProfile,
        city: { contains: validatedParams.location, mode: 'insensitive' },
      };
    }

    // Gender filter
    if (validatedParams.gender) {
      where.TalentProfile = {
        ...where.TalentProfile,
        gender: validatedParams.gender,
      };
    }

    // Willing to travel filter
    if (validatedParams.willingToTravel !== undefined) {
      where.TalentProfile = {
        ...where.TalentProfile,
        willingToTravel: validatedParams.willingToTravel,
      };
    }

    // Verified filter
    if (validatedParams.verified !== undefined) {
      where.TalentProfile = {
        ...where.TalentProfile,
        verified: validatedParams.verified,
      };
    }

    // 3. Build orderBy clause
    let orderBy: Record<string, unknown> = {};
    switch (validatedParams.sortBy) {
      case 'name':
        orderBy = { name: validatedParams.sortOrder };
        break;
      case 'experience':
        orderBy = { TalentProfile: { experience: validatedParams.sortOrder } };
        break;
      case 'rating':
        orderBy = { TalentProfile: { rating: validatedParams.sortOrder } };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: validatedParams.sortOrder };
        break;
    }

    // 4. Execute search
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    const [talent, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
        orderBy,
        take: validatedParams.limit,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    // Return talent data (age calculation removed since TalentProfile relation not included)
    return NextResponse.json({
      success: true,
      data: {
        talent,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages: Math.ceil(total / validatedParams.limit),
        },
        filters: {
          applied: Object.keys(validatedParams).filter(key => 
            validatedParams[key as keyof typeof validatedParams] !== undefined &&
            !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
          ),
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid search parameters', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Talent Search API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
