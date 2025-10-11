import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import crypto from 'crypto';
import { requireTalent } from '@/lib/auth-helpers';
import { createErrorResponse } from '@/lib/error-handler';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'takeone-uploads';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Validation schema
const PresignRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (type) => ALLOWED_TYPES.includes(type),
    { message: 'Invalid file type. Only images (JPEG, PNG, WebP) and videos (MP4, QuickTime, AVI) are allowed' }
  ),
  fileSize: z.number().positive('File size must be positive'),
});

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove any directory paths
  const basename = filename.split('/').pop() || filename;
  // Remove special characters except dots, hyphens, and underscores
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const POST = requireTalent()(async (request: NextRequest, _context, user) => {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validatedData = PresignRequestSchema.parse(body);

    // 3. Validate file size based on content type
    const isImage = ALLOWED_IMAGE_TYPES.includes(validatedData.contentType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(validatedData.contentType);

    if (isImage && validatedData.fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image file size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    if (isVideo && validatedData.fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Video file size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // 4. Generate secure S3 key (SERVER controls the path)
    const sanitized = sanitizeFilename(validatedData.filename);
    const uuid = crypto.randomUUID();
    const fileExtension = sanitized.split('.').pop();
    const s3Key = `uploads/${user.userId}/${uuid}.${fileExtension}`;

    // 5. Generate presigned URL with strict content-type enforcement
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: validatedData.contentType,
      // Enforce content-type and size on upload
      ContentLength: validatedData.fileSize,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // 6. Generate final object URL
    const objectUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

    // 7. Return presigned URL and object URL
    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        publicUrl: objectUrl, // Frontend expects 'publicUrl'
        objectUrl, // Keep for backward compatibility
        s3Key,
        expiresIn: 300,
      },
    });
  } catch (error) {
    return createErrorResponse(error, {
      functionName: '[Presign API] Error generating presigned URL',
    });
  }
});

