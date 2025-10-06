import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { prisma } from '@packages/core-db/src/client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user's media assets
    const mediaAssets = await prisma.mediaAsset.findMany({
      where: {
        userId: payload.userId,
        status: 'ready', // Only show ready/uploaded media
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        s3Key: true,
        visibility: true,
        createdAt: true,
      },
    });

    // Convert S3 keys to public URLs
    const baseUrl = process.env.AWS_CLOUDFRONT_URL || `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const mediaWithUrls = mediaAssets.map((asset) => ({
      ...asset,
      url: `${baseUrl}/${asset.s3Key}`,
    }));

    return NextResponse.json({
      success: true,
      data: mediaWithUrls,
    });
  } catch (error) {
    console.error('[Media API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
