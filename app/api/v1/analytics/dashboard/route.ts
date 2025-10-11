import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireCaster } from '@/lib/auth-helpers';

/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard analytics for casters
 */
export const GET = requireCaster()(async (req: NextRequest, _context, user) => {
  try {
    const casterId = user.userId;

    // 1. Get query params for date range
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 2. Fetch analytics data
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
        where: { createdBy: casterId },
      }),

      // Active casting calls (published with deadline in future)
      prisma.castingCall.count({
        where: {
          createdBy: casterId,
          status: 'published',
          deadline: { gte: new Date() },
        },
      }),

      // Total applications across all casting calls
      prisma.application.count({
        where: {
          castingCall: {
            createdBy: casterId,
          },
        },
      }),
      prisma.application.count({
        where: {
          castingCall: { createdBy: casterId },
          createdAt: { gte: startDate },
        },
      }),

      // Shortlisted applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: casterId },
          status: 'shortlisted',
        },
      }),

      // Accepted applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: casterId },
          status: 'accepted',
        },
      }),

      // Rejected applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: casterId },
          status: 'rejected',
        },
      }),

      // Pending applications
      prisma.application.count({
        where: {
          castingCall: { createdBy: casterId },
          status: 'pending',
        },
      }),

      // Recent applications (last 10)
      prisma.application.findMany({
        where: {
          castingCall: { createdBy: casterId },
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
          createdBy: casterId,
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
        WHERE cc."createdBy" = ${casterId}
          AND a."createdAt" >= ${startDate}
        GROUP BY DATE(a."createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Calculate conversion rates
    const conversionRate =
      totalApplications > 0
        ? ((acceptedCount / totalApplications) * 100).toFixed(1)
        : '0';

    const shortlistRate =
      totalApplications > 0
        ? ((shortlistedCount / totalApplications) * 100).toFixed(1)
        : '0';

    // Format trends data
    const trends = Array.isArray(applicationTrends)
      ? applicationTrends.map((trend: { date: string; count: string }) => ({
          date: trend.date,
          count: parseInt(trend.count, 10),
        }))
      : [];

    // Group project types manually
    const projectTypeMap = new Map<string, number>();
    popularProjectTypes.forEach((call) => {
      if (call.projectType) {
        projectTypeMap.set(
          call.projectType,
          (projectTypeMap.get(call.projectType) || 0) + 1,
        );
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
      { status: 500 },
    );
  }
});
