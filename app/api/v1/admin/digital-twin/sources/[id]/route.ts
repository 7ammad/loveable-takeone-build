import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { requireRole } from '@/lib/auth-helpers';

interface PrismaError extends Error {
  code?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;

    const source = await prisma.ingestionSource.findUnique({
      where: { id },
    });

    if (!source) {
      return NextResponse.json(
        { error: 'Ingestion source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: source,
    });

  } catch (error) {
    console.error('Failed to fetch ingestion source:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ingestion source',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;

    const { sourceType, sourceIdentifier, sourceName, isActive } = await request.json();

    // Validation
    if (sourceType && !['WEB', 'WHATSAPP'].includes(sourceType)) {
      return NextResponse.json(
        { error: 'sourceType must be either WEB or WHATSAPP' },
        { status: 400 }
      );
    }

    // Additional validation for WEB sources
    if (sourceType === 'WEB' && sourceIdentifier) {
      try {
        new URL(sourceIdentifier);
      } catch {
        return NextResponse.json(
          { error: 'sourceIdentifier must be a valid URL for WEB sources' },
          { status: 400 }
        );
      }
    }

    // Update the ingestion source
    const source = await prisma.ingestionSource.update({
      where: { id },
      data: {
        ...(sourceType && { sourceType }),
        ...(sourceIdentifier && { sourceIdentifier }),
        ...(sourceName && { sourceName }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: source,
      message: 'Ingestion source updated successfully',
    });

  } catch (error) {
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: 'Ingestion source not found' },
        { status: 404 }
      );
    }

    console.error('Failed to update ingestion source:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update ingestion source',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;

    await prisma.ingestionSource.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ingestion source deleted successfully',
    });

  } catch (error) {
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: 'Ingestion source not found' },
        { status: 404 }
      );
    }

    console.error('Failed to delete ingestion source:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete ingestion source',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
