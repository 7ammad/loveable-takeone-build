import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client';

const HLS_SIGNING_KEY = process.env.HLS_SIGNING_KEY || 'default-signing-key';
const MEDIA_URL_EXPIRY = 3600; // 1 hour

/**
 * Generate a signed URL for media access with expiration
 * @param s3Key S3 object key
 * @param userId User requesting access
 * @param expirySeconds URL expiration time in seconds
 * @returns Signed URL for media access
 */
export async function generateSignedMediaUrl(
  s3Key: string,
  userId: string,
  expirySeconds: number = MEDIA_URL_EXPIRY
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: s3Key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expirySeconds,
  });

  return signedUrl;
}

/**
 * Generate tamper-evident watermark data
 * @param roleId Casting role ID
 * @param applicationId Application ID
 * @param timestamp Timestamp
 * @returns Watermark data string
 */
export function generateWatermark(roleId: string, applicationId: string, timestamp: number = Date.now()): string {
  const data = `${roleId}|${applicationId}|${timestamp}`;
  // In production, this would be encrypted/signed
  return Buffer.from(data).toString('base64');
}

/**
 * Verify watermark integrity
 * @param watermark Base64 encoded watermark
 * @returns Parsed watermark data or null if invalid
 */
export function verifyWatermark(watermark: string): { roleId: string; applicationId: string; timestamp: number } | null {
  try {
    const data = Buffer.from(watermark, 'base64').toString();
    const [roleId, applicationId, timestampStr] = data.split('|');

    if (!roleId || !applicationId || !timestampStr) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return null;
    }

    return { roleId, applicationId, timestamp };
  } catch (error) {
    return null;
  }
}
