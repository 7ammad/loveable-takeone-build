/**
 * Admin API: Update or delete a specific source
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { withAdminAuth } from '@packages/core-security/src/admin-auth';

export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const updates = await req.json();

      const updatedSource = await prisma.ingestionSource.update({
        where: { id },
        data: updates,
      });

      console.log(`[Admin] Updated source: ${id}`);

      return NextResponse.json({ data: updatedSource });
    } catch (error) {
      console.error('[Admin] Error updating source:', error);
      return NextResponse.json(
        { error: 'Failed to update source' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      await prisma.ingestionSource.delete({
        where: { id },
      });

      console.log(`[Admin] Deleted source: ${id}`);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('[Admin] Error deleting source:', error);
      return NextResponse.json(
        { error: 'Failed to delete source' },
        { status: 500 }
      );
    }
  }
);

