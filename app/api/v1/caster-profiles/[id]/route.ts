/**
 * Individual Caster Profile API Endpoints
 * GET /api/v1/caster-profiles/[id] - Get single caster profile
 * PATCH /api/v1/caster-profiles/[id] - Update caster profile
 * DELETE /api/v1/caster-profiles/[id] - Delete caster profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireOwnership, isErrorResponse } from '@/lib/auth-helpers';
import { getAllCasterTypes, getAllCategories } from '@/lib/constants/caster-taxonomy';

const prisma = new PrismaClient();

// GET /api/v1/caster-profiles/[id] - Get single profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const profile = await prisma.casterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        },
        projects: {
          where: { featured: true },
          orderBy: { displayOrder: 'asc' },
          take: 6
        },
        teamMembers: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          where: { flagged: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            reviewText: true,
            projectName: true,
            professionalism: true,
            communication: true,
            paymentOnTime: true,
            workEnvironment: true,
            isAnonymous: true,
            isVerified: true,
            verifiedHire: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            projects: true,
            teamMembers: { where: { isActive: true } },
            reviews: { where: { flagged: false } }
          }
        }
      }
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('[API] Error fetching caster profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch caster profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/caster-profiles/[id] - Update profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get the existing profile to find the owner's user ID
    const existingProfile = await prisma.casterProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }

    // 2. Verify ownership using the helper
    const userOrError = await requireOwnership(request, existingProfile.userId);
    if (isErrorResponse(userOrError)) {
      return userOrError;
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate taxonomy if provided
    if (body.companyCategory) {
      const validCategories = getAllCategories();
      if (!validCategories.includes(body.companyCategory)) {
        return NextResponse.json(
          { success: false, error: 'Invalid company category' },
          { status: 400 }
        );
      }
    }
    
    if (body.companyType) {
      const validTypes = getAllCasterTypes();
      if (!validTypes.includes(body.companyType)) {
        return NextResponse.json(
          { success: false, error: 'Invalid company type' },
          { status: 400 }
        );
      }
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'companyNameEn', 'companyNameAr', 'companyType', 'companyCategory',
      'companyDescription', 'businessPhone', 'businessEmail', 'website',
      'city', 'address', 'companySize', 'establishedYear', 'teamSize',
      'specializations', 'typeSpecificFields', 'logoUrl', 'bannerUrl',
      'showreelUrl', 'linkedinUrl', 'instagramUrl', 'twitterUrl', 'facebookUrl',
      'commercialRegistration', 'licenseNumbers', 'licenseAuthorities'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Parse integers
    if (updateData.establishedYear && typeof updateData.establishedYear === 'string') {
      updateData.establishedYear = parseInt(updateData.establishedYear);
    }
    if (updateData.teamSize && typeof updateData.teamSize === 'string') {
      updateData.teamSize = parseInt(updateData.teamSize);
    }
    
    // Update profile
    const profile = await prisma.casterProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('[API] Error updating caster profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update caster profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/caster-profiles/[id] - Delete profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
) {
  try {
    const { id } = await params;

    // 1. Get the existing profile to find the owner's user ID
    const existingProfile = await prisma.casterProfile.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }

    // 2. Verify ownership using the helper
    const userOrError = await requireOwnership(request, existingProfile.userId);
    if (isErrorResponse(userOrError)) {
      return userOrError;
    }
    
    // Delete profile (cascade will handle related records)
    await prisma.casterProfile.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Caster profile deleted successfully'
    });
  } catch (error) {
    console.error('[API] Error deleting caster profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete caster profile' },
      { status: 500 }
    );
  }
}

