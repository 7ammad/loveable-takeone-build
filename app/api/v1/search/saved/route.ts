import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/packages/core-db/src/client';

export const runtime = 'nodejs';

const savedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  query: z.object({
    term: z.string().optional(),
    filters: z.record(z.any()).optional(),
  }),
  // daily | weekly | null
  notificationFrequency: z.enum(['daily', 'weekly']).nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, data: savedSearches });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Saved Search API] Error fetching saved searches:', error);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validation = savedSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { name, query, notificationFrequency } = validation.data;

    const newSavedSearch = await prisma.savedSearch.create({
      data: {
        name,
        query,
        userId,
        notificationFrequency,
      },
    });

    return NextResponse.json({ ok: true, data: newSavedSearch }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Saved Search API] Error creating saved search:', error);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
