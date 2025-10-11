import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireTalent } from '@/lib/auth-helpers';

/**
 * POST /api/v1/upload
 * Handle file uploads for casting calls, applications, and profiles
 */
export const POST = requireTalent()(async (req: NextRequest) => {
  try {
    // 1. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'casting-call', 'application', 'profile'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file type and size
    const allowedTypes = {
      'casting-call': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      'application': ['image/jpeg', 'image/png', 'application/pdf'],
      'profile': ['image/jpeg', 'image/png'],
    };

    const maxSizes = {
      'casting-call': 10 * 1024 * 1024, // 10MB
      'application': 5 * 1024 * 1024,   // 5MB
      'profile': 2 * 1024 * 1024,       // 2MB
    };

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (file.size > maxSizes[type as keyof typeof maxSizes]) {
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 400 }
      );
    }

    // 4. Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // 5. Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 6. Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 7. Return file URL
    const fileUrl = `/uploads/${type}/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
});
