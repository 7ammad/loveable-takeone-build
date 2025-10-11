/**
 * Admin API: Get Digital Twin status
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { getDigitalTwinService } from '@/lib/digital-twin/background-service';
import { scrapedRolesQueue, validationQueue, dlq } from '@packages/core-queue';
import { requireRole } from '@/lib/auth-helpers';

export const GET = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;
  // User authorization verified, proceed with operation

  try {
    const service = getDigitalTwinService();

    // Get source statistics
    const sourceStats = {
      total: await prisma.ingestionSource.count(),
      active: await prisma.ingestionSource.count({ where: { isActive: true } }),
      instagram: await prisma.ingestionSource.count({
        where: { sourceType: 'INSTAGRAM', isActive: true },
      }),
      web: await prisma.ingestionSource.count({
        where: { sourceType: 'WEB', isActive: true },
      }),
    };

    // Get casting call statistics
    const callStats = {
      pending: await prisma.castingCall.count({
        where: { isAggregated: true, status: 'pending_review' },
      }),
      approved: await prisma.castingCall.count({
        where: { isAggregated: true, status: 'open' },
      }),
      rejected: await prisma.castingCall.count({
        where: { isAggregated: true, status: 'cancelled' },
      }),
      total: await prisma.castingCall.count({
        where: { isAggregated: true },
      }),
    };

    // Get recent activity
    const recentActivity = await prisma.ingestionSource.findMany({
      where: { isActive: true },
      orderBy: { lastProcessedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        sourceName: true,
        sourceType: true,
        lastProcessedAt: true,
      },
    });

    // Queue metrics
    let queues: Record<string, unknown>;
    try {
      const [scrapeCounts, validationCounts, dlqCounts] = await Promise.all([
        scrapedRolesQueue.getJobCounts(),
        validationQueue.getJobCounts(),
        dlq.getJobCounts(),
      ]);
      queues = {
        scrapedRoles: scrapeCounts,
        validation: validationCounts,
        dlq: dlqCounts,
      };
    } catch {
      queues = { error: 'Queue metrics unavailable' };
    }

    return NextResponse.json({
      data: {
        isRunning: service !== null,
        sources: sourceStats,
        calls: callStats,
        recentActivity,
        lastRunTime: service?.getStatus().lastRunTime || null,
        nextRunTime: service?.getStatus().nextRunTime || null,
        queues,
      },
    });
  } catch (error) {
    console.error('[Admin] Error fetching Digital Twin status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 },
    );
  }
};
