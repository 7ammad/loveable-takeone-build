/**
 * Admin API: Reject a casting call
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireAdmin, logAdminAction, AuditEventType } from '@/lib/auth-helpers';
import { TokenPayload } from '@packages/core-auth';

export const POST = requireAdmin()(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }, user: TokenPayload) => {
    try {
      const { id } = await params;
      const body = await req.json().catch(() => ({}));

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const adminUser = await prisma.user.findUnique({
        where: { id: user.userId },
      });

      if (!adminUser) {
        return NextResponse.json({ error: 'Admin user not found in database' }, { status: 403 });
      }

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
        adminUser.id,
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

