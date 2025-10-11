import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications, markAllNotificationsAsRead, getUnreadNotificationCount } from '@packages/core-db/src/notifications';
import { requireTalent } from '@/lib/auth-helpers';

/**
 * GET /api/v1/notifications
 * Get notifications for the authenticated user
 */
export const GET = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    // 1. Get query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // 2. Fetch notifications
    try {
      const notifications = await getUserNotifications(user.userId, limit, unreadOnly);
      const unreadCount = await getUnreadNotificationCount(user.userId);

      return NextResponse.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (dbError: any) {
      // Handle case where Notification table doesn't exist yet
      if (dbError?.code === 'P2021') {
        return NextResponse.json({
          success: true,
          data: {
            notifications: [],
            unreadCount: 0,
          },
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/v1/notifications
 * Mark all notifications as read
 */
export const PATCH = requireTalent()(async (_req: NextRequest, _context, user) => {
  try {
    // 1. Mark all as read
    await markAllNotificationsAsRead(user.userId);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

