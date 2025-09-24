import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateHLSManifest, generateHLSToken, verifyHLSToken } from '@/packages/core-media/src/signed-hls';
import { canAccessMedia } from '@/packages/core-media/src/access-control';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { assetId } = await params;
    const token = request.nextUrl.searchParams.get('token');

    if (!userId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify HLS token if provided
    if (token && !verifyHLSToken(token, userId, assetId)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid HLS token' 
      }, { status: 403 });
    }

    // Check if user has access to the media asset
    const hasAccess = await canAccessMedia(userId, assetId);
    if (!hasAccess) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // In a real implementation, we would:
    // 1. Fetch the media asset from database
    // 2. Check if it's a video file
    // 3. Generate HLS manifest with signed URLs
    // 4. Return the manifest

    // Mock HLS manifest generation
    const mockMasterPlaylistKey = `hls/${assetId}/master.m3u8`;
    const mockSegmentKeys = [
      `hls/${assetId}/segment_0.ts`,
      `hls/${assetId}/segment_1.ts`,
      `hls/${assetId}/segment_2.ts`,
      `hls/${assetId}/segment_3.ts`,
      `hls/${assetId}/segment_4.ts`
    ];

    const manifest = await generateHLSManifest(
      mockMasterPlaylistKey,
      mockSegmentKeys,
      userId
    );

    // Generate new HLS token for client
    const hlsToken = generateHLSToken(userId, assetId);

    return new NextResponse(manifest, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-HLS-Token': hlsToken
      }
    });

  } catch (error) {
    console.error('HLS streaming error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
