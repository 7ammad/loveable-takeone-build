/**
 * Caster Portfolio Projects API
 * GET /api/v1/caster-profiles/[id]/projects - List projects
 * POST /api/v1/caster-profiles/[id]/projects - Create project
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@packages/core-auth';
import { validateProject } from '@/lib/validation/caster-profile-validation';

const prisma = new PrismaClient();

// GET /api/v1/caster-profiles/[id]/projects
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const featured = searchParams.get('featured');
    const projectType = searchParams.get('type');
    
    const where: {
      casterProfileId: string;
      featured?: boolean;
      projectType?: string;
    } = { casterProfileId: id };
    if (featured === 'true') where.featured = true;
    if (projectType) where.projectType = projectType;
    
    const projects = await prisma.casterProject.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' },
        { projectYear: 'desc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('[API] Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/v1/caster-profiles/[id]/projects
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
      select: { userId: true }
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Caster profile not found' },
        { status: 404 }
      );
    }
    
    if (profile.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only add projects to your own profile' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate project data
    const validation = validateProject(body);
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
    
    const { projectName, projectType, projectYear } = body;
    
    // Create project
    const project = await prisma.casterProject.create({
      data: {
        casterProfileId: id,
        projectName,
        projectType,
        clientName: body.clientName,
        projectYear: parseInt(projectYear),
        projectDescription: body.projectDescription,
        projectUrl: body.projectUrl,
        imageUrls: body.imageUrls || [],
        videoUrl: body.videoUrl,
        featured: body.featured || false,
        displayOrder: body.displayOrder || 0
      }
    });
    
    return NextResponse.json({
      success: true,
      data: project
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

