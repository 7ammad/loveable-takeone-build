import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { createTalentProfile, updateTalentProfile } from '@packages/core-db/src/talent';
import { prisma } from '@packages/core-db/src/client';
import { z } from 'zod';

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

/**
 * POST /api/v1/profiles/talent
 * Create a talent profile for the authenticated user
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
    console.log('[Talent Profile API] User role from token:', payload.role);
    let userRole = payload.role;
    
    // If role is undefined in token, fetch it from database
    if (!userRole) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { role: true }
        });
        userRole = user?.role;
        console.log('[Talent Profile API] Fetched role from database:', userRole);
      } catch (dbError) {
        console.error('[Talent Profile API] Failed to fetch user role:', dbError);
        return NextResponse.json(
          { success: false, error: 'Unable to determine user role' },
          { status: 400 }
        );
      }
    }
    
    if (userRole !== 'talent') {
      return NextResponse.json(
        { success: false, error: `Only talent users can create talent profiles. Current role: ${userRole || 'undefined'}` },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = talentProfileSchema.parse(body);

    // 4. Check if profile already exists
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: payload.userId }
    });

    let profile;
    if (existingProfile) {
      // Update existing profile (use profile id)
      profile = await updateTalentProfile(existingProfile.id, {
        stageName: validatedData.stageName,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        gender: validatedData.gender,
        city: validatedData.city,
        height: validatedData.height,
        weight: validatedData.weight,
        eyeColor: validatedData.eyeColor,
        hairColor: validatedData.hairColor,
        experience: validatedData.experience,
        willingToTravel: validatedData.willingToTravel,
        skills: validatedData.skills,
        languages: validatedData.languages,
        portfolioUrl: validatedData.portfolioUrl,
        demoReelUrl: validatedData.demoReelUrl,
        instagramUrl: validatedData.instagramUrl,
      });
    } else {
      // Create new profile
      try {
        profile = await createTalentProfile({
          userId: payload.userId,
          stageName: validatedData.stageName,
          dateOfBirth: new Date(validatedData.dateOfBirth),
          gender: validatedData.gender,
          city: validatedData.city,
          height: validatedData.height,
          weight: validatedData.weight,
          eyeColor: validatedData.eyeColor,
          hairColor: validatedData.hairColor,
          experience: validatedData.experience,
          willingToTravel: validatedData.willingToTravel,
          skills: validatedData.skills,
          languages: validatedData.languages,
          portfolioUrl: validatedData.portfolioUrl,
          demoReelUrl: validatedData.demoReelUrl,
          instagramUrl: validatedData.instagramUrl,
        });
      } catch (e: any) {
        // If a race condition causes a unique constraint, update instead
        if (e?.code === 'P2002') {
          const existing = await prisma.talentProfile.findUnique({ where: { userId: payload.userId } });
          if (existing) {
            profile = await updateTalentProfile(existing.id, {
              stageName: validatedData.stageName,
              dateOfBirth: new Date(validatedData.dateOfBirth),
              gender: validatedData.gender,
              city: validatedData.city,
              height: validatedData.height,
              weight: validatedData.weight,
              eyeColor: validatedData.eyeColor,
              hairColor: validatedData.hairColor,
              experience: validatedData.experience,
              willingToTravel: validatedData.willingToTravel,
              skills: validatedData.skills,
              languages: validatedData.languages,
              portfolioUrl: validatedData.portfolioUrl,
              demoReelUrl: validatedData.demoReelUrl,
              instagramUrl: validatedData.instagramUrl,
            });
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: profile,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Talent Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/profiles/talent
 * Update a talent profile for the authenticated user
 */
export async function PUT(req: NextRequest) {
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
    console.log('[Talent Profile API] User role from token:', payload.role);
    let userRole = payload.role;
    
    // If role is undefined in token, fetch it from database
    if (!userRole) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { role: true }
        });
        userRole = user?.role;
        console.log('[Talent Profile API] Fetched role from database:', userRole);
      } catch (dbError) {
        console.error('[Talent Profile API] Failed to fetch user role:', dbError);
        return NextResponse.json(
          { success: false, error: 'Unable to determine user role' },
          { status: 400 }
        );
      }
    }
    
    if (userRole !== 'talent') {
      return NextResponse.json(
        { success: false, error: `Only talent users can update talent profiles. Current role: ${userRole || 'undefined'}` },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = talentProfileSchema.parse(body);

    // 3.5 Ensure profile exists and get id by userId
    const existing = await prisma.talentProfile.findUnique({ where: { userId: payload.userId } });
    if (!existing) {
      // If no profile exists yet, create one (idempotent behavior for update route)
      const created = await createTalentProfile({
        userId: payload.userId,
        stageName: validatedData.stageName,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        gender: validatedData.gender,
        city: validatedData.city,
        height: validatedData.height,
        weight: validatedData.weight,
        eyeColor: validatedData.eyeColor,
        hairColor: validatedData.hairColor,
        experience: validatedData.experience,
        willingToTravel: validatedData.willingToTravel,
        skills: validatedData.skills,
        languages: validatedData.languages,
        portfolioUrl: validatedData.portfolioUrl,
        demoReelUrl: validatedData.demoReelUrl,
        instagramUrl: validatedData.instagramUrl,
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    // 4. Update talent profile by id
    const profile = await updateTalentProfile(existing.id, {
      stageName: validatedData.stageName,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,
      city: validatedData.city,
      height: validatedData.height,
      weight: validatedData.weight,
      eyeColor: validatedData.eyeColor,
      hairColor: validatedData.hairColor,
      experience: validatedData.experience,
      willingToTravel: validatedData.willingToTravel,
      skills: validatedData.skills,
      languages: validatedData.languages,
      portfolioUrl: validatedData.portfolioUrl,
      demoReelUrl: validatedData.demoReelUrl,
      instagramUrl: validatedData.instagramUrl,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Talent Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

