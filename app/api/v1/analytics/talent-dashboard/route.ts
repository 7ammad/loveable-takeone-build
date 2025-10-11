import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireTalent } from '@/lib/auth-helpers';

/**
 * GET /api/v1/analytics/talent-dashboard
 * Get dashboard analytics for talent users
 */
export const GET = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    const talentId = user.userId;

    // 1. Get query params for date range
    const url = new URL(req.url);
    const daysParam = parseInt(url.searchParams.get('days') || '30', 10);
    const days = Number.isNaN(daysParam) ? 30 : daysParam;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 2. Fetch analytics data
    const [
      totalApplications,
      activeApplications,
      pendingApplications,
      underReviewApplications,
      shortlistedApplications,
      acceptedApplications,
      rejectedApplications,
      recentApplications,
      applicationTrends,
      talentProfile,
    ] = await Promise.all([
      // Total applications ever submitted
      prisma.application.count({
        where: { talentUserId: talentId },
      }),

      // Active applications (pending, under_review, shortlisted)
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: {
            in: ['pending', 'under_review', 'shortlisted'],
          },
        },
      }),

      // Pending applications
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: 'pending',
        },
      }),

      // Under review applications
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: 'under_review',
        },
      }),

      // Shortlisted applications
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: 'shortlisted',
        },
      }),

      // Accepted applications
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: 'accepted',
        },
      }),

      // Rejected applications
      prisma.application.count({
        where: {
          talentUserId: talentId,
          status: 'rejected',
        },
      }),

      // Recent applications (last 10)
      prisma.application.findMany({
        where: {
          talentUserId: talentId,
        },
        include: {
          castingCall: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Application trends (daily for specified period)
      prisma.$queryRaw<Array<{ date: string; count: string }>>`
        SELECT 
          DATE(a."createdAt") as date,
          COUNT(*) as count
        FROM "Application" a
        WHERE a."talentUserId" = ${talentId}
          AND a."createdAt" >= ${startDate}
        GROUP BY DATE(a."createdAt")
        ORDER BY date ASC
      `,

      // Talent profile for completion percentage
      prisma.talentProfile.findUnique({
        where: { userId: talentId },
        select: {
          completionPercentage: true,
          verified: true,
        },
      }),
    ]);

    // Calculate success rate (accepted / total applications that have been reviewed)
    const reviewedApplications = acceptedApplications + rejectedApplications;
    const successRate =
      reviewedApplications > 0
        ? ((acceptedApplications / reviewedApplications) * 100).toFixed(1)
        : '0';

    // Calculate response rate (applications with any status change / total)
    const respondedApplications = totalApplications - pendingApplications;
    const responseRate =
      totalApplications > 0
        ? ((respondedApplications / totalApplications) * 100).toFixed(1)
        : '0';

    // Format trends data
    const trends = Array.isArray(applicationTrends)
      ? applicationTrends.map((trend: { date: string; count: string }) => ({
          date: trend.date,
          count: parseInt(trend.count, 10),
        }))
      : [];

    // Calculate profile views (mock for now - will implement view tracking later)
    const profileViews = 0; // TODO: Implement profile view tracking

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalApplications,
          activeApplications,
          profileViews,
          profileCompletion: talentProfile?.completionPercentage || 0,
        },
        applicationStats: {
          pending: pendingApplications,
          underReview: underReviewApplications,
          shortlisted: shortlistedApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
          successRate: `${successRate}%`,
          responseRate: `${responseRate}%`,
        },
        recentApplications: recentApplications.map((app) => ({
          id: app.id,
          casting_call_id: app.castingCallId,
          title: app.castingCall.title,
          company: app.castingCall.company,
          location: app.castingCall.location,
          status: app.status,
          appliedDate: app.createdAt,
        })),
        trends,
        profile: {
          verified: talentProfile?.verified || false,
          completionPercentage: talentProfile?.completionPercentage || 0,
        },
      },
    });
  } catch (error) {
    console.error('[Talent Analytics API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
});
