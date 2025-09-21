import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mediaQueue } from '@/packages/core-queue/src/queues';
import { prisma } from '@/packages/core-db/src/client';
import { z } from 'zod';

const s3WebhookSchema = z.object({
  // This is a simplified schema. A real S3 event is more complex.
  s3Key: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = s3WebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { s3Key } = validation.data;

    // Find the corresponding media asset in our database
    const asset = await prisma.mediaAsset.findUnique({
      where: { s3Key },
    });

    if (!asset) {
      return NextResponse.json({ ok: false, error: 'Asset not found' }, { status: 404 });
    }

    // Add a job to the queue for this asset
    await mediaQueue.add('process-media', {
      assetId: asset.id,
      s3Key: asset.s3Key,
    });

    // Update the asset status to 'processing'
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: 'processing' },
    });

    return NextResponse.json({ ok: true, message: 'Job added to queue' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
