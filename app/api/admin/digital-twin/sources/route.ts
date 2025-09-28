import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sources = await prisma.ingestionSource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Failed to fetch ingestion sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check for duplicate sourceIdentifier
    const existing = await prisma.ingestionSource.findFirst({
      where: { sourceIdentifier },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Source identifier already exists' },
        { status: 409 }
      );
    }

    const source = await prisma.ingestionSource.create({
      data: {
        sourceType,
        sourceIdentifier,
        sourceName,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error('Failed to create ingestion source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
