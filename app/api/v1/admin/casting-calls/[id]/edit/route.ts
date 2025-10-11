/**
 * Admin API: Edit a casting call before approval
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { withAdminAuth } from '@packages/core-security/src/admin-auth';

export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const updates = await req.json();

      // Remove fields that shouldn't be edited
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _updateId, createdAt, updatedAt, userId, isAggregated, ...editableFields } = updates;

      const updatedCall = await prisma.castingCall.update({
        where: { id },
        data: {
          ...editableFields,
          updatedAt: new Date(),
        },
      });

      console.log(`[Admin] Edited casting call: ${id}`);

      return NextResponse.json({ data: updatedCall });
    } catch (error) {
      console.error('[Admin] Error editing call:', error);
      return NextResponse.json(
        { error: 'Failed to edit casting call' },
        { status: 500 }
      );
    }
  }
);

