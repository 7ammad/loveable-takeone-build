import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { algoliaSearchProvider } from '@/packages/core-search/src/algolia-adapter';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

const suggestionQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.preprocess((val) => val === undefined ? 5 : Number(val), z.number().int().positive().max(20).default(5)),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH SUGGESTIONS] Request received:', {
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
    const validation = suggestionQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: validation.error.format()
      }, { status: 422 });
    }

    const { q, limit } = validation.data;

    // Get search suggestions from Algolia
    const suggestions = await algoliaSearchProvider.getSearchSuggestions(q, limit);

    return NextResponse.json({
      ok: true,
      suggestions,
      query: q,
      limit
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}
