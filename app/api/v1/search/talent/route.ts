import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { algoliaSearchProvider } from '@/packages/core-search/src/algolia-adapter';
import { z } from 'zod';

const searchQuerySchema = z.object({
  term: z.string().default(''),
  page: z.preprocess(Number, z.number().int().positive().default(1)),
  hitsPerPage: z.preprocess(Number, z.number().int().positive().default(20)),
  // In a real app, you would have more specific filter schemas
  // For now, we'll just accept a string that can be parsed
  filters: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    const validation = searchQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { term, page, hitsPerPage, filters } = validation.data;

    const parsedFilters = filters ? JSON.parse(filters) : undefined;
    
    const searchResults = await algoliaSearchProvider.searchTalent({
      term,
      page: page - 1, // Algolia is 0-indexed, so we adjust
      hitsPerPage,
      filters: parsedFilters,
    });

    return NextResponse.json({ ok: true, ...searchResults });

  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) { // Catches JSON.parse errors
      return NextResponse.json({ ok: false, error: 'Invalid filters JSON format' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
