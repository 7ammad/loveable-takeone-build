import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { lookup } from 'mime-types';

// Force Node.js runtime for external dependencies
export const runtime = 'nodejs';

// Media validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'application/pdf'
];

const createUploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/\w+\/[\-+.\w]+/),
  size: z.number().positive().max(MAX_FILE_SIZE),
  userId: z.string().cuid(),
  roleId: z.string().optional(),
  applicationId: z.string().optional(),
});

// Mock virus scan function
async function performVirusScan(filename: string, contentType: string, size: number): Promise<boolean> {
  // In a real implementation, this would call a virus scanning service
  console.log(`Mock virus scan for ${filename} (${contentType}, ${size} bytes)`);
  return true; // Always pass for now
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    console.log('[MEDIA ROUTE] Request received:', { 
      userId, 
      path: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    if (!userId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = createUploadUrlSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        ok: false, 
        error: validation.error.format() 
      }, { status: 422 });
    }

    const { filename, contentType, size, userId: bodyUserId, roleId, applicationId } = validation.data;

    // Verify user ID matches
    if (userId !== bodyUserId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'User ID mismatch' 
      }, { status: 403 });
    }

    // MIME type validation
    const detectedMimeType = lookup(filename);
    if (detectedMimeType && detectedMimeType !== contentType) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Content type mismatch with file extension' 
      }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'File type not allowed' 
      }, { status: 400 });
    }

    // Mock virus scan
    const virusScanPassed = await performVirusScan(filename, contentType, size);
    if (!virusScanPassed) {
      return NextResponse.json({ 
        ok: false, 
        error: 'File failed security scan' 
      }, { status: 400 });
    }

    // Generate unique S3 key
    const s3Key = `${userId}/${randomUUID()}/${filename}`;
    
    // Mock watermark generation for video files
    let watermark: string | undefined;
    if (roleId && applicationId && contentType.startsWith('video/')) {
      // Mock watermark - in real implementation, this would generate a proper watermark
      watermark = `watermark_${roleId}_${applicationId}_${Date.now()}`;
    }

    // Mock TTL policy
    const ttlPolicy = contentType.startsWith('video/') ? 'archive_180d' : 
                     contentType.startsWith('image/') ? 'archive_1y' : 'permanent';

    // Mock media asset creation
    const mediaAsset = {
      id: randomUUID(),
      userId,
      filename,
      mimetype: contentType,
      size,
      s3Key,
      status: 'pending',
      watermark,
      ttlPolicy,
      createdAt: new Date().toISOString()
    };

    // Mock signed URL generation
    const mockUploadUrl = `https://mock-s3.example.com/uploads/${s3Key}?token=mock-signed-token`;

    return NextResponse.json({
      ok: true,
      uploadUrl: mockUploadUrl,
      assetId: mediaAsset.id,
      expiresIn: 3600, // 1 hour
      fields: {
        key: s3Key,
        'Content-Type': contentType,
        'x-amz-meta-user-id': userId,
        'x-amz-meta-filename': filename,
        'x-amz-meta-size': size.toString(),
        ...(watermark && { 'x-amz-meta-watermark': watermark }),
        ...(ttlPolicy && { 'x-amz-meta-ttl-policy': ttlPolicy })
      }
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}