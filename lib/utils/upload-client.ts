import { apiClient } from '@/lib/api/client';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  objectUrl: string;
  s3Key: string;
}

/**
 * Upload a file to S3 using presigned URLs
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the final S3 object URL
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Step 1: Request presigned URL from our API
    const response = await apiClient.post<{
      success: boolean;
      data?: { presignedUrl: string; objectUrl: string; s3Key: string };
    }>('/uploads/presign', {
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    const presignData = response.data;

    if (!presignData.success || !presignData.data) {
      throw new Error('Failed to get presigned URL');
    }

    const { presignedUrl, objectUrl, s3Key } = presignData.data;

    // Step 2: Upload file directly to S3 using presigned URL
    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      // Handle successful upload
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve({ objectUrl, s3Key });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle upload errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      // Open and send the request
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error('File upload error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload file');
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Invalid file type. Only images (JPEG, PNG, WebP) and videos (MP4, QuickTime, AVI) are allowed.',
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image file size exceeds 5MB limit.',
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: 'Video file size exceeds 100MB limit.',
    };
  }

  return { valid: true };
}

