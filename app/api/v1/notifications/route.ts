import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { getUserNotifications, markAllNotificationsAsRead, getUnreadNotificationCount } from '@packages/core-db/src/notifications';

/**
 * GET /api/v1/notifications
 * Get notifications for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Get query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // 3. Fetch notifications
    try {
      const notifications = await getUserNotifications(payload.userId, limit, unreadOnly);
      const unreadCount = await getUnreadNotificationCount(payload.userId);

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
}

/**
 * PATCH /api/v1/notifications
 * Mark all notifications as read
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Mark all as read
    await markAllNotificationsAsRead(payload.userId);

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
}

