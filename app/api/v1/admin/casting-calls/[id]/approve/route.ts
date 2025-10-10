/**
 * Admin API: Approve a casting call
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { withAdminAuth } from '@packages/core-security/src/admin-auth';

export const POST = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const updatedCall = await prisma.castingCall.update({
        where: { id },
        data: {
          status: 'open',
          updatedAt: new Date(),
        },
      });

      console.log(`[Admin] Approved casting call: ${id}`);

      return NextResponse.json({ data: updatedCall });
    } catch (error) {
      console.error('[Admin] Error approving call:', error);
      return NextResponse.json(
        { error: 'Failed to approve casting call' },
        { status: 500 }
      );
    }
  }
);

