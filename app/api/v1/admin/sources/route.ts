/**
 * Admin API: Manage ingestion sources
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (req: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const sources = await prisma.ingestionSource.findMany({
      orderBy: [{ isActive: 'desc' }, { lastProcessedAt: 'desc' }],
    });

    return NextResponse.json({ data: sources });
  } catch (error) {
    console.error('[Admin] Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

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

    return NextResponse.json({ data: newSource }, { status: 201 });
  } catch (error) {
    console.error('[Admin] Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 },
    );
  }
};
