/**
 * Caster Team Members API
 * GET /api/v1/caster-profiles/[id]/team - List team members
 * POST /api/v1/caster-profiles/[id]/team - Add team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@packages/core-auth';
import { validateTeamMember } from '@/lib/validation/caster-profile-validation';

const prisma = new PrismaClient();

// GET /api/v1/caster-profiles/[id]/team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const isActive = searchParams.get('active');
    
    const where: {
      casterProfileId: string;
      isActive?: boolean;
    } = { casterProfileId: id };
    if (isActive === 'true') where.isActive = true;
    
    const teamMembers = await prisma.casterTeamMember.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('[API] Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/v1/caster-profiles/[id]/team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Verify ownership
    const profile = await prisma.casterProfile.findUnique({
      where: { id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }
    
    const isOwner = profile.userId === decoded.userId;
    
    // Check team member permission if not owner
    let hasPermission = false;
    if (!isOwner) {
      // Get user's email first
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { email: true }
      });

      if (user?.email) {
        const teamMember = await prisma.casterTeamMember.findFirst({
          where: {
            casterProfileId: id,
            email: user.email,
            isActive: true,
            permissions: {
              has: 'manage_team'
            }
          }
        });
        hasPermission = !!teamMember;
      }
    }
    
    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage team members' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate team member data
    const validation = validateTeamMember(body);
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
    
    const { name, role } = body;
    const permissions = body.permissions || [];
    
    // Create team member
    const teamMember = await prisma.casterTeamMember.create({
      data: {
        casterProfileId: id,
        name,
        role,
        email: body.email,
        bio: body.bio,
        imageUrl: body.imageUrl,
        permissions,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: teamMember
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

