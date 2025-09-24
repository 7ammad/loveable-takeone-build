import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/packages/core-db/src/client';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

const historyQuerySchema = z.object({
  limit: z.preprocess((val) => val === undefined ? 20 : Number(val), z.number().int().positive().max(100).default(20)),
  offset: z.preprocess((val) => val === undefined ? 0 : Number(val), z.number().int().min(0).default(0)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH HISTORY] GET Request received:', {
      userId,
      path: request.nextUrl.pathname
    });

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validation = historyQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: validation.error.format()
      }, { status: 422 });
    }

    const { limit, offset, startDate, endDate } = validation.data;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const searchHistory = await prisma.searchHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const totalCount = await prisma.searchHistory.count({ where });

    return NextResponse.json({
      ok: true,
      searchHistory: searchHistory.map(history => ({
        id: history.id,
        searchTerm: history.searchTerm,
        filters: history.filters,
        resultsCount: history.resultsCount,
        executionTime: history.executionTime,
        createdAt: history.createdAt
      })),
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH HISTORY] DELETE Request received:', {
      userId,
      path: request.nextUrl.pathname
    });

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('olderThan');
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Delete all search history
      await prisma.searchHistory.deleteMany({
        where: { userId }
      });
    } else if (olderThan) {
      // Delete history older than specified date
      await prisma.searchHistory.deleteMany({
        where: {
          userId,
          createdAt: {
            lt: new Date(olderThan)
          }
        }
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: 'Must specify either "all=true" or "olderThan" parameter'
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Search history deleted successfully'
    });

  } catch (error) {
    console.error('Delete search history error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}
