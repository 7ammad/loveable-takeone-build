/**
 * Admin API: Reject a casting call
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
          status: 'cancelled',
          updatedAt: new Date(),
        },
      });

      console.log(`[Admin] Rejected casting call: ${id}`);

      return NextResponse.json({ data: updatedCall });
    } catch (error) {
      console.error('[Admin] Error rejecting call:', error);
      return NextResponse.json(
        { error: 'Failed to reject casting call' },
        { status: 500 }
      );
    }
  }
);

