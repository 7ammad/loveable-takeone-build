import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { z } from 'zod';
import { requireCaster } from '@/lib/auth-helpers';

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
export const POST = requireCaster()(async (req: NextRequest, _context, user) => {
  try {
    const body = await req.json();
    const validatedData = casterProfileSchema.parse(body);

    const existingProfile = await prisma.casterProfile.findUnique({
      where: { userId: user.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile already exists' },
        { status: 409 },
      );
    }

    const profile = await prisma.casterProfile.create({
      data: {
        userId: user.userId,
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
        verified: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }

    console.error('[Caster Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/v1/profiles/caster
 * Update the authenticated user's caster profile
 */
export const PATCH = requireCaster()(async (req: NextRequest, _context, user) => {
  try {
    const body = await req.json();
    const validatedData = casterProfileSchema.parse(body);

    const existingProfile = await prisma.casterProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 },
      );
    }

    const updatedProfile = await prisma.casterProfile.update({
      where: { userId: user.userId },
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
        { status: 400 },
      );
    }

    console.error('[Caster Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});
