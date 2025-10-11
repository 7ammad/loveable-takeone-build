/**
 * Digital Twin Sources Management API
 * GET /api/digital-twin/sources - List all sources
 * POST /api/digital-twin/sources - Add new sources (bulk)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { verifyAccessToken } from '@packages/core-auth';
import { z } from 'zod';

const SourceSchema = z.object({
  sourceType: z.enum(['WEB', 'INSTAGRAM', 'WHATSAPP', 'OTHER']),
  sourceIdentifier: z.string(),
  sourceName: z.string(),
  isActive: z.boolean().optional().default(true),
});

const BulkSourcesSchema = z.array(SourceSchema);

// GET - List all sources
export async function GET() {
  try {
    const sources = await prisma.ingestionSource.findMany({
      orderBy: [
        { sourceType: 'asc' },
        { sourceName: 'asc' },
      ],
    });

    const stats = {
      total: sources.length,
      active: sources.filter(s => s.isActive).length,
      byType: {
        WEB: sources.filter(s => s.sourceType === 'WEB').length,
        INSTAGRAM: sources.filter(s => s.sourceType === 'INSTAGRAM').length,
        WHATSAPP: sources.filter(s => s.sourceType === 'WHATSAPP').length,
        OTHER: sources.filter(s => s.sourceType === 'OTHER').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        sources,
        stats,
      },
    });

  } catch (error) {
    console.error('Failed to fetch sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST - Add sources (bulk)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = BulkSourcesSchema.parse(body);

    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const source of validated) {
      try {
        // Check if source already exists
        const existing = await prisma.ingestionSource.findFirst({
          where: {
            sourceIdentifier: source.sourceIdentifier,
          },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create source
        await prisma.ingestionSource.create({
          data: source,
        });

        results.added++;

      } catch (error) {
        results.errors.push(`${source.sourceName}: ${(error as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('Failed to add sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add sources' },
      { status: 500 }
    );
  }
}

