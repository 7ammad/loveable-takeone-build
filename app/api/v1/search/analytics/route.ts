import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { talentIndexer } from '@/packages/core-search/src/talent-indexer';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().optional(),
  cohort: z.enum(['minor', 'adult', 'all']).optional().default('all'),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH ANALYTICS] Request received:', {
      userId,
      path: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries())
    });

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validation = analyticsQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: validation.error.format()
      }, { status: 422 });
    }

    const { startDate, endDate, cohort } = validation.data;

    // Get search analytics data
    const analytics = await getSearchAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      cohort,
      requestingUserId: userId
    });

    return NextResponse.json({
      ok: true,
      analytics,
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString()
      },
      cohort
    });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}

async function getSearchAnalytics(params: {
  startDate?: Date;
  endDate?: Date;
  cohort: string;
  requestingUserId: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cohort } = params;
  
  // In a real implementation, you would query your analytics database
  // For now, we'll return mock analytics data
  const analytics = {
    totalSearches: 1250,
    uniqueUsers: 340,
    averageSearchTime: 245, // ms
    topQueries: [
      { query: 'actor', count: 45 },
      { query: 'actress', count: 38 },
      { query: 'director', count: 32 },
      { query: 'producer', count: 28 },
      { query: 'writer', count: 25 }
    ],
    searchByCohort: {
      minor: {
        searches: 180,
        uniqueUsers: 45,
        averageSearchTime: 280
      },
      adult: {
        searches: 1070,
        uniqueUsers: 295,
        averageSearchTime: 230
      }
    },
    searchByLocation: [
      { location: 'Riyadh', count: 450 },
      { location: 'Jeddah', count: 320 },
      { location: 'Dammam', count: 180 },
      { location: 'Mecca', count: 120 },
      { location: 'Medina', count: 80 }
    ],
    searchBySkills: [
      { skill: 'Acting', count: 380 },
      { skill: 'Directing', count: 250 },
      { skill: 'Writing', count: 200 },
      { skill: 'Producing', count: 180 },
      { skill: 'Cinematography', count: 150 }
    ],
    searchPerformance: {
      p50: 180,
      p95: 450,
      p99: 800,
      errorRate: 0.02
    },
    fairnessMetrics: {
      minorExposureRate: 0.15,
      adultExposureRate: 0.85,
      genderDistribution: {
        male: 0.52,
        female: 0.48
      },
      locationDistribution: {
        majorCities: 0.75,
        otherCities: 0.25
      }
    },
    indexStats: await talentIndexer.getIndexStatistics()
  };

  return analytics;
}
