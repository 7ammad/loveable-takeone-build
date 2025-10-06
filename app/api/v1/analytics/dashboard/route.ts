import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db';

/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard analytics for casters
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
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

    // 2. Verify user is caster
    if (payload.role !== 'caster') {
      return NextResponse.json(
        { success: false, error: 'Only casters can view analytics' },
        { status: 403 }
      );
    }

    // 3. Get query params for date range
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 4. Fetch analytics data
    const [
      totalCastingCalls,
      activeCastingCalls,
      totalApplications,
      applicationsThisMonth,
      shortlistedCount,
      acceptedCount,
      rejectedCount,
      pendingCount,
      recentApplications,
      popularProjectTypes,
      applicationTrends,
    ] = await Promise.all([
      // Total casting calls created by this caster
      prisma.castingCall.count({
        where: { createdBy: payload.userId },
      }),

      // Active casting calls (published with deadline in future)
      prisma.castingCall.count({
        where: {
          createdBy: payload.userId,
          status: 'published',
          deadline: { gte: new Date() },
        },
      }),

      // Total applications across all casting calls
      prisma.application.count({
        where: {
          castingCall: {
            createdBy: payload.userId,
          },
        },
      }),
      prisma.application.count({
        where: {
          castingCall: { createdBy: payload.userId },
          createdAt: { gte: startDate },
        },
      }),

      // Shortlisted applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: payload.userId },
          status: 'shortlisted',
        },
      }),

      // Accepted applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: payload.userId },
          status: 'accepted',
        },
      }),

      // Rejected applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: payload.userId },
          status: 'rejected',
        },
      }),

      // Pending applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: payload.userId },
          status: 'pending',
        },
      }),

      // Recent applications (last 10)
      prisma.application.findMany({
        where: {
          castingCall: { createdBy: payload.userId },
        },
        include: {
          castingCall: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Popular project types - fetch all and group manually
      prisma.castingCall.findMany({
        where: {
          createdBy: payload.userId,
          projectType: { not: null },
        },
        select: {
          projectType: true,
        },
      }),

      // Application trends (daily for last 30 days)
      prisma.$queryRaw<Array<{ date: string; count: string }>>`
        SELECT 
          DATE(a."createdAt") as date,
          COUNT(*) as count
        FROM "Application" a
        JOIN "CastingCall" cc ON a."castingCallId" = cc.id
        WHERE cc."createdBy" = ${payload.userId}
          AND a."createdAt" >= ${startDate}
        GROUP BY DATE(a."createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Calculate conversion rates
    const conversionRate = totalApplications > 0 
      ? ((acceptedCount / totalApplications) * 100).toFixed(1)
      : '0';

    const shortlistRate = totalApplications > 0
      ? ((shortlistedCount / totalApplications) * 100).toFixed(1)
      : '0';

    // Format trends data
    const trends = Array.isArray(applicationTrends) 
      ? applicationTrends.map((trend: { date: string; count: string }) => ({
          date: trend.date,
          count: parseInt(trend.count),
        }))
      : [];

    // Group project types manually
    const projectTypeMap = new Map<string, number>();
    popularProjectTypes.forEach(call => {
      if (call.projectType) {
        projectTypeMap.set(call.projectType, (projectTypeMap.get(call.projectType) || 0) + 1);
      }
    });
    
    const projectTypesArray = Array.from(projectTypeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCastingCalls,
          activeCastingCalls,
          totalApplications,
          applicationsThisMonth,
        },
        applicationStats: {
          pending: pendingCount,
          shortlisted: shortlistedCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
          conversionRate: `${conversionRate}%`,
          shortlistRate: `${shortlistRate}%`,
        },
        recentApplications,
        popularProjectTypes: projectTypesArray,
        trends,
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
