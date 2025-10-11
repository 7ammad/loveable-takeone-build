import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@packages/core-db/src/notifications';
import { prisma } from '@packages/core-db';
import { requireTalent } from '@/lib/auth-helpers';

/**
 * PATCH /api/v1/notifications/[id]/read
 * Mark a specific notification as read
 */
export const PATCH = requireTalent()(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  user,
) => {
  try {
    const { id: notificationId } = await params;

    // 1. Find the notification *only if* it belongs to the current user
    const notification = await prisma.notification.findUnique({
      where: { 
        id: notificationId,
        userId: user.userId, // Combine ownership check into the query
      },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    // 2. Mark as read
    await markNotificationAsRead(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('[Notification Read API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

