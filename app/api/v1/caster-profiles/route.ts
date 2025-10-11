/**
 * Caster Profile API Endpoints
 * GET /api/v1/caster-profiles - List all caster profiles (with filters)
 * POST /api/v1/caster-profiles - Create a new caster profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@packages/core-auth';
import { validateCasterProfile } from '@/lib/validation/caster-profile-validation';

const prisma = new PrismaClient();

// GET /api/v1/caster-profiles - List caster profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Filters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const verified = searchParams.get('verified');
    const companySize = searchParams.get('companySize');
    const search = searchParams.get('search');
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: {
      companyCategory?: string;
      companyType?: string;
      city?: string;
      verified?: boolean;
      companySize?: string;
      OR?: Array<{
        companyNameEn?: { contains: string; mode: 'insensitive' };
        companyNameAr?: { contains: string; mode: 'insensitive' };
        companyDescription?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    
    if (category) where.companyCategory = category;
    if (type) where.companyType = type;
    if (city) where.city = city;
    if (verified === 'true') where.verified = true;
    if (companySize) where.companySize = companySize;
    
    if (search) {
      where.OR = [
        { companyNameEn: { contains: search, mode: 'insensitive' } },
        { companyNameAr: { contains: search, mode: 'insensitive' } },
        { companyDescription: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fetch profiles
    const [profiles, total] = await Promise.all([
      prisma.casterProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              projects: true,
              teamMembers: true,
              reviews: true
            }
          }
        }
      }),
      prisma.casterProfile.count({ where })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching caster profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch caster profiles' },
      { status: 500 }
    );
  }
}

// POST /api/v1/caster-profiles - Create caster profile
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Verify user is a caster
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { casterProfile: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can create caster profiles' },
        { status: 403 }
      );
    }
    
    if (user.casterProfile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile already exists' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const {
      companyNameEn,
      companyType,
      companyCategory,
      businessPhone,
      businessEmail,
      city
    } = body;
    
    if (!companyNameEn || !companyType || !companyCategory || !businessPhone || !businessEmail || !city) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['companyNameEn', 'companyType', 'companyCategory', 'businessPhone', 'businessEmail', 'city']
        },
        { status: 400 }
      );
    }
    
    // Validate profile data
    const validation = validateCasterProfile(body);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    // Create caster profile
    const profile = await prisma.casterProfile.create({
      data: {
        userId: user.id,
        companyNameEn,
        companyNameAr: body.companyNameAr,
        companyType,
        companyCategory,
        companyDescription: body.companyDescription,
        businessPhone,
        businessEmail,
        website: body.website,
        city,
        address: body.address,
        companySize: body.companySize,
        establishedYear: body.establishedYear ? parseInt(body.establishedYear) : undefined,
        teamSize: body.teamSize ? parseInt(body.teamSize) : undefined,
        specializations: body.specializations || [],
        typeSpecificFields: body.typeSpecificFields || null,
        logoUrl: body.logoUrl,
        bannerUrl: body.bannerUrl,
        showreelUrl: body.showreelUrl,
        linkedinUrl: body.linkedinUrl,
        instagramUrl: body.instagramUrl,
        twitterUrl: body.twitterUrl,
        facebookUrl: body.facebookUrl,
        commercialRegistration: body.commercialRegistration,
        licenseNumbers: body.licenseNumbers || [],
        licenseAuthorities: body.licenseAuthorities || []
      },
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
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating caster profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create caster profile' },
      { status: 500 }
    );
  }
}

