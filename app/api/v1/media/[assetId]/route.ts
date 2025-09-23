import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMediaAccessUrl } from '@/packages/core-media/src';

interface RouteContext {
  params: Promise<{ assetId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { assetId } = await context.params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const accessUrl = await getMediaAccessUrl(userId, assetId);

    if (!accessUrl) {
      return NextResponse.json({ ok: false, error: 'Access denied or asset not found' }, { status: 403 });
    }

    // Return the signed URL for direct access
    return NextResponse.json({ ok: true, accessUrl });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
