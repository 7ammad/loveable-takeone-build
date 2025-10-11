/**
 * Admin API: Approve a casting call
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireAdmin, logAdminAction, AuditEventType } from '@/lib/auth-helpers';

export const POST = requireAdmin()(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }, user, dbUser) => {
    try {
      const { id } = await params;

      const updatedCall = await prisma.castingCall.update({
        where: { id },
        data: {
          status: 'open',
          updatedAt: new Date(),
        },
      });

      // Log admin action
      await logAdminAction(
        AuditEventType.ADMIN_SETTINGS_CHANGED,
        dbUser.id,
        null,
        'approve_casting_call',
        { 
          castingCallId: id,
          previousStatus: 'pending_review', 
          newStatus: 'open' 
        }
      );

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

