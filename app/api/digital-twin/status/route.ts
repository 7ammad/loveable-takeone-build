/**
 * Digital Twin Status API
 * GET /api/digital-twin/status - Check if Digital Twin is running
 * POST /api/digital-twin/trigger - Manually trigger a crawl
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDigitalTwinService } from '@/lib/digital-twin/background-service';
import { verifyAccessToken } from '@packages/core-auth';

// GET - Status
export async function GET() {
  const service = getDigitalTwinService();

  if (!service) {
    return NextResponse.json({
      success: true,
      data: {
        isRunning: false,
        message: 'Digital Twin service not initialized',
      },
    });
  }

  const status = service.getStatus();

  return NextResponse.json({
    success: true,
    data: {
      isRunning: status.isRunning,
      interval: `${status.intervalHours} hours`,
      nextRun: 'Automatic',
    },
  });
}

// POST - Manual trigger (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // TODO: Add role check for admin
    // For now, any authenticated user can trigger

    const service = getDigitalTwinService();

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Digital Twin service not initialized' },
        { status: 503 }
      );
    }

    // Trigger manual run (async, don't wait)
    service.triggerManualRun().catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Digital Twin orchestration triggered',
        status: 'Running in background',
      },
    });

  } catch (error) {
    console.error('Failed to trigger Digital Twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger' },
      { status: 500 }
    );
  }
}

