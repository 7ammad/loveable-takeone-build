import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

const searchQuerySchema = z.object({
  term: z.string().default(''),
  page: z.preprocess(Number, z.number().int().positive().default(1)),
  hitsPerPage: z.preprocess(Number, z.number().int().positive().default(20)),
  filters: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[SEARCH ROUTE] Request received:', { 
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
    const validation = searchQuerySchema.safeParse(query);
    
    if (!validation.success) {
      return NextResponse.json({ 
        ok: false, 
        error: validation.error.format() 
      }, { status: 422 });
    }

    const { term, page, hitsPerPage, filters } = validation.data;
    const parsedFilters = filters ? JSON.parse(filters) : undefined;

    // Mock search results for now - replace with actual Algolia integration
    const mockResults = {
      hits: [
        {
          id: '1',
          name: 'Test Actor 1',
          skills: ['acting', 'dancing'],
          location: 'Riyadh',
          experience: '5 years'
        },
        {
          id: '2', 
          name: 'Test Actor 2',
          skills: ['acting', 'singing'],
          location: 'Jeddah',
          experience: '3 years'
        }
      ],
      page: page - 1,
      nbPages: 1,
      hitsPerPage,
      nbHits: 2,
      query: term,
    };

    // Add explainability payload for fairness audits
    const explainabilityPayload = {
      searchTimestamp: new Date().toISOString(),
      userId,
      query: {
        term,
        filters: parsedFilters,
        page,
        hitsPerPage,
      },
      totalResults: mockResults.nbHits,
      searchId: crypto.randomUUID(),
    };

    return NextResponse.json({
      ok: true,
      ...mockResults,
      _explain: explainabilityPayload
    });

  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid filters JSON format' 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}