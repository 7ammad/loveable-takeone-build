import { NextRequest, NextResponse } from 'next/server';
import { createTalentProfile, updateTalentProfile } from '@packages/core-db/src/talent';
import { prisma } from '@packages/core-db/src/client';
import { z } from 'zod';
import { requireTalent } from '@/lib/auth-helpers';

const talentProfileSchema = z.object({
  stageName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  city: z.string().min(1),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  eyeColor: z.string().optional().nullable(),
  hairColor: z.string().optional().nullable(),
  experience: z.number().optional().nullable(),
  willingToTravel: z.boolean().optional().default(false),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  portfolioUrl: z.string().optional().nullable(),
  demoReelUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
});

function buildProfilePayload(data: z.infer<typeof talentProfileSchema>) {
  return {
    stageName: data.stageName,
    dateOfBirth: new Date(data.dateOfBirth),
    gender: data.gender,
    city: data.city,
    height: data.height,
    weight: data.weight,
    eyeColor: data.eyeColor,
    hairColor: data.hairColor,
    experience: data.experience,
    willingToTravel: data.willingToTravel,
    skills: data.skills,
    languages: data.languages,
    portfolioUrl: data.portfolioUrl,
    demoReelUrl: data.demoReelUrl,
    instagramUrl: data.instagramUrl,
  };
}

/**
 * POST /api/v1/profiles/talent
 * Create a talent profile for the authenticated user
 */
export const POST = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    const body = await req.json();
    const validatedData = talentProfileSchema.parse(body);

    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: user.userId },
    });

    const profile = existingProfile
      ? await updateTalentProfile(existingProfile.id, buildProfilePayload(validatedData))
      : await createTalentProfile({
          user: { connect: { id: user.userId } },
          ...buildProfilePayload(validatedData),
        });

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: existingProfile ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }

    if ((error as { code?: string })?.code === 'P2002') {
      const existing = await prisma.talentProfile.findUnique({
        where: { userId: user.userId },
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          data: existing,
          message: 'Profile already exists, returning existing profile',
        });
      }
    }

    console.error('[Talent Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});

/**
 * PUT /api/v1/profiles/talent
 * Update a talent profile for the authenticated user
 */
export const PUT = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    const body = await req.json();
    const validatedData = talentProfileSchema.parse(body);

    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!existingProfile) {
      const created = await createTalentProfile({
        user: { connect: { id: user.userId } },
        ...buildProfilePayload(validatedData),
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    const profile = await updateTalentProfile(existingProfile.id, buildProfilePayload(validatedData));

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }

    console.error('[Talent Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});
