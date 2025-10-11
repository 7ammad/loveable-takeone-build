/**
 * Admin API: Update or delete a specific source
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireRole } from '@/lib/auth-helpers';

type Params = { id: string };

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<Params> }
) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;
    const updates = await req.json();

    const updatedSource = await prisma.ingestionSource.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ data: updatedSource });
  } catch (error) {
    console.error('[Admin] Error updating source:', error);
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<Params> }
) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const { id } = await params;

    await prisma.ingestionSource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error deleting source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 },
    );
  }
};
