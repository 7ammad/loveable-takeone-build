import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  // User authorization verified, proceed with operation

  try {
    const sources = await prisma.ingestionSource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: sources,
    });

  } catch (error) {
    console.error('Failed to fetch ingestion sources:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ingestion sources',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  // User authorization verified, proceed with operation

  try {
    const { sourceType, sourceIdentifier, sourceName, isActive = true } = await request.json();

    // Validation
    if (!sourceType || !sourceIdentifier || !sourceName) {
      return NextResponse.json(
        { error: 'sourceType, sourceIdentifier, and sourceName are required' },
        { status: 400 }
      );
    }

    if (!['WEB', 'WHATSAPP'].includes(sourceType)) {
      return NextResponse.json(
        { error: 'sourceType must be either WEB or WHATSAPP' },
        { status: 400 }
      );
    }

    // Additional validation based on source type
    if (sourceType === 'WEB') {
      try {
        new URL(sourceIdentifier);
      } catch {
        return NextResponse.json(
          { error: 'sourceIdentifier must be a valid URL for WEB sources' },
          { status: 400 }
        );
      }
    }

    // Create the ingestion source
    const source = await prisma.ingestionSource.create({
      data: {
        sourceType,
        sourceIdentifier,
        sourceName,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: source,
      message: 'Ingestion source created successfully',
    });

  } catch (error) {
    console.error('Failed to create ingestion source:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create ingestion source',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
};
