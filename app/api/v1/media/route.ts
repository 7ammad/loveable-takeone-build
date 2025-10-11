import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db/src/client';
import { requireTalent } from '@/lib/auth-helpers';

export const GET = requireTalent()(async (request: NextRequest, _context, user) => {
  try {
    // Fetch user's media assets
    const mediaAssets = await prisma.mediaAsset.findMany({
      where: {
        userId: user.userId,
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
    const baseUrl =
      process.env.AWS_CLOUDFRONT_URL ||
      `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
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
      { status: 500 },
    );
  }
});
