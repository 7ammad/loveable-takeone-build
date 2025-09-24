import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateHLSToken } from '@/packages/core-media/src/signed-hls';
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

    if (!userId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Check if user has access to the media asset
    const hasAccess = await canAccessMedia(userId, assetId);
    if (!hasAccess) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Generate HLS token for streaming
    const hlsToken = generateHLSToken(userId, assetId);
    
    // Generate streaming URLs
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const streamUrl = `${baseUrl}/api/v1/media/${assetId}/stream?token=${hlsToken}`;

    return NextResponse.json({
      ok: true,
      hlsInfo: {
        assetId,
        streamUrl,
        token: hlsToken,
        expiresIn: 300, // 5 minutes
        format: 'hls',
        supportedQualities: ['720p', '480p', '360p'],
        watermark: true, // Indicates if content has watermark
        drm: false // Indicates if content is DRM protected
      }
    });

  } catch (error) {
    console.error('HLS info error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
