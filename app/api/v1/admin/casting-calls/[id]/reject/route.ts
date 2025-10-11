/**
 * Admin API: Reject a casting call
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireAdmin, logAdminAction, AuditEventType } from '@/lib/auth-helpers';

export const POST = requireAdmin()(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }, user, dbUser) => {
    try {
      const { id } = await params;
      const body = await req.json().catch(() => ({}));

      const updatedCall = await prisma.castingCall.update({
        where: { id },
        data: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      });

      // Log admin action
      await logAdminAction(
        AuditEventType.ADMIN_SETTINGS_CHANGED,
        dbUser.id,
        null,
        'reject_casting_call',
        {
          castingCallId: id,
          previousStatus: 'pending_review',
          newStatus: 'cancelled',
          reason: body.reason || 'No reason provided'
        }
      );

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

