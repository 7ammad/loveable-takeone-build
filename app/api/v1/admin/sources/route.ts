/**
 * Admin API: Manage ingestion sources
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { withAdminAuth } from '@packages/core-security/src/admin-auth';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const sources = await prisma.ingestionSource.findMany({
      orderBy: [{ isActive: 'desc' }, { lastProcessedAt: 'desc' }],
    });

    return NextResponse.json({ data: sources });
  } catch (error) {
    console.error('[Admin] Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { sourceType, sourceIdentifier, sourceName, isActive } =
      await req.json();

    const newSource = await prisma.ingestionSource.create({
      data: {
        sourceType,
        sourceIdentifier,
        sourceName,
        isActive: isActive ?? true,
      },
    });

    console.log(`[Admin] Created new source: ${sourceName}`);

    return NextResponse.json({ data: newSource }, { status: 201 });
  } catch (error) {
    console.error('[Admin] Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
});

