import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/packages/core-db/src/client';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const createUploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/\w+\/[\-+.\w]+/),
  size: z.number().positive(),
  userId: z.string().cuid(), 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createUploadUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { filename, contentType, size, userId } = validation.data;

    const s3Key = `${userId}/${randomUUID()}/${filename}`;

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        userId,
        filename,
        mimetype: contentType,
        size,
        s3Key,
        status: 'pending',
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key,
      ContentType: contentType,
      ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return NextResponse.json({ ok: true, uploadUrl, assetId: mediaAsset.id });

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
