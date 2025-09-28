import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const source = await prisma.ingestionSource.findUnique({
      where: { id: params.id },
    });

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Failed to fetch ingestion source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch source' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { sourceType, sourceIdentifier, sourceName, isActive } = body;

    // Validation
    if (!sourceType || !sourceIdentifier || !sourceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['WEB', 'WHATSAPP'].includes(sourceType)) {
      return NextResponse.json(
        { error: 'Invalid source type' },
        { status: 400 }
      );
    }

    // Check for duplicate sourceIdentifier (excluding current source)
    const existing = await prisma.ingestionSource.findFirst({
      where: {
        sourceIdentifier,
        id: { not: params.id }
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Source identifier already exists' },
        { status: 409 }
      );
    }

    const source = await prisma.ingestionSource.update({
      where: { id: params.id },
      data: {
        sourceType,
        sourceIdentifier,
        sourceName,
        isActive,
      },
    });

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Failed to update ingestion source:', error);
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ingestionSource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ingestion source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
