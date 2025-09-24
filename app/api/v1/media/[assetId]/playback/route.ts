import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMediaAccessUrl } from '@/packages/core-media/src/access-control';

export const runtime = 'nodejs';

interface PlaybackParams {
  params: {
    assetId: string;
  };
}

export async function GET(request: NextRequest, { params }: PlaybackParams) {
  try {
    const userId = request.headers.get('x-user-id');
    const { assetId } = params;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!assetId) {
      return NextResponse.json({ ok: false, error: 'Asset ID is required' }, { status: 400 });
    }

    const playbackUrl = await getMediaAccessUrl(userId, assetId);

    if (!playbackUrl) {
      return NextResponse.json({ ok: false, error: 'Asset not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, url: playbackUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error(`[Playback API] Error fetching playback URL for asset:`, error);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

