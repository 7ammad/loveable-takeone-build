import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const casterProfileSchema = z.object({
  companyNameEn: z.string().min(1).optional(),
  companyNameAr: z.string().optional(),
  companyType: z.string().optional(),
  companyCategory: z.string().optional(),
  companyDescription: z.string().optional(),
  city: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional(),
  website: z.string().optional().nullable(),
  companySize: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  commercialRegistration: z.string().optional().nullable(),
});

/**
 * POST /api/v1/profiles/caster
 * Create a caster profile for the authenticated user
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
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only caster users can create caster profiles' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = casterProfileSchema.parse(body);

    // 4. Check if profile already exists
    const existingProfile = await prisma.casterProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile already exists' },
        { status: 409 }
      );
    }

    // 5. Create caster profile
    const profile = await prisma.casterProfile.create({
      data: {
        userId: payload.userId,
        companyNameEn: validatedData.companyNameEn,
        companyNameAr: validatedData.companyNameAr,
        companyType: validatedData.companyType,
        companyCategory: validatedData.companyCategory,
        companyDescription: validatedData.companyDescription,
        city: validatedData.city,
        businessPhone: validatedData.businessPhone,
        businessEmail: validatedData.businessEmail,
        website: validatedData.website,
        companySize: validatedData.companySize,
        specializations: validatedData.specializations,
        commercialRegistration: validatedData.commercialRegistration,
        verified: false, // Default to unverified
      },
    });

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

    console.error('[Caster Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/profiles/caster
 * Update the authenticated user's caster profile
 */
export async function PATCH(req: NextRequest) {
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
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only caster users can update caster profiles' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validatedData = casterProfileSchema.parse(body);

    // 4. Check if profile exists
    const existingProfile = await prisma.casterProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }

    // 5. Update caster profile
    const updatedProfile = await prisma.casterProfile.update({
      where: { userId: payload.userId },
      data: {
        companyNameEn: validatedData.companyNameEn,
        companyNameAr: validatedData.companyNameAr,
        companyType: validatedData.companyType,
        companyCategory: validatedData.companyCategory,
        companyDescription: validatedData.companyDescription,
        city: validatedData.city,
        businessPhone: validatedData.businessPhone,
        businessEmail: validatedData.businessEmail,
        website: validatedData.website,
        companySize: validatedData.companySize,
        specializations: validatedData.specializations,
        commercialRegistration: validatedData.commercialRegistration,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Caster Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}