import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/packages/core-db/src/client';

export const runtime = 'nodejs';

interface RouteContext {
  params: {
    searchId: string;
  };
}

const updateSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  query: z.object({
    term: z.string().optional(),
    filters: z.record(z.any()).optional(),
  }).optional(),
  notificationFrequency: z.enum(['daily', 'weekly']).nullable().optional(),
});


export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const savedSearch = await prisma.savedSearch.findFirst({
      where: { 
        id: params.searchId,
        userId: userId,
       },
    });

    if (!savedSearch) {
      return NextResponse.json({ ok: false, error: 'Saved search not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: savedSearch });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error(`[Saved Search API] Error fetching saved search ${params.searchId}:`, error);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    try {
      const userId = request.headers.get('x-user-id');
      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
      }
  
      const body = await request.json();
      const validation = updateSavedSearchSchema.safeParse(body);
  
      if (!validation.success) {
        return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
      }
  
      // Ensure the user owns this search before updating
      const existingSearch = await prisma.savedSearch.findFirst({
        where: {
            id: params.searchId,
            userId: userId,
        }
      });

      if (!existingSearch) {
        return NextResponse.json({ ok: false, error: 'Saved search not found' }, { status: 404 });
      }

      const updatedSearch = await prisma.savedSearch.update({
        where: { id: params.searchId },
        data: validation.data,
      });
  
      return NextResponse.json({ ok: true, data: updatedSearch });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      console.error(`[Saved Search API] Error updating saved search ${params.searchId}:`, error);
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    try {
      const userId = request.headers.get('x-user-id');
      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
      }
  
      // Ensure the user owns this search before deleting
      const existingSearch = await prisma.savedSearch.findFirst({
        where: {
            id: params.searchId,
            userId: userId,
        }
      });

      if (!existingSearch) {
        return NextResponse.json({ ok: false, error: 'Saved search not found' }, { status: 404 });
      }

      await prisma.savedSearch.delete({
        where: { id: params.searchId },
      });
  
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      console.error(`[Saved Search API] Error deleting saved search ${params.searchId}:`, error);
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
    }
}

