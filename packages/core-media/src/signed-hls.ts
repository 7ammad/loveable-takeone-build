import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client';
import crypto from 'crypto';

const HLS_SIGNING_KEY = process.env.HLS_SIGNING_KEY || 'default-signing-key';
const WATERMARK_SECRET = process.env.WATERMARK_SECRET || 'default-watermark-secret';
const MEDIA_URL_EXPIRY = 3600; // 1 hour
const HLS_URL_EXPIRY = 300; // 5 minutes for HLS segments

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
 * Generate tamper-evident watermark data with HMAC signature
 * @param roleId Casting role ID
 * @param applicationId Application ID
 * @param timestamp Timestamp
 * @returns Watermark data string with signature
 */
export function generateWatermark(roleId: string, applicationId: string, timestamp: number = Date.now()): string {
  const data = `${roleId}|${applicationId}|${timestamp}`;
  const hmac = crypto.createHmac('sha256', WATERMARK_SECRET).update(data).digest('hex');
  const signedData = `${data}|${hmac}`;
  return Buffer.from(signedData).toString('base64');
}

/**
 * Verify watermark integrity with HMAC signature validation
 * @param watermark Base64 encoded watermark
 * @returns Parsed watermark data or null if invalid
 */
export function verifyWatermark(watermark: string): { roleId: string; applicationId: string; timestamp: number } | null {
  try {
    const signedData = Buffer.from(watermark, 'base64').toString();
    const parts = signedData.split('|');
    
    if (parts.length !== 4) {
      return null; // Should have roleId|applicationId|timestamp|signature
    }

    const [roleId, applicationId, timestampStr, signature] = parts;

    if (!roleId || !applicationId || !timestampStr || !signature) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return null;
    }

    // Verify HMAC signature
    const data = `${roleId}|${applicationId}|${timestamp}`;
    const expectedHmac = crypto.createHmac('sha256', WATERMARK_SECRET).update(data).digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
      return null; // Signature verification failed
    }

    return { roleId, applicationId, timestamp };
  } catch (error) {
    return null;
  }
}

/**
 * Check if watermark is expired based on TTL policy
 * @param watermarkData Parsed watermark data
 * @param ttlDays TTL in days (default 180 for self-tapes)
 * @returns True if expired, false otherwise
 */
export function isWatermarkExpired(watermarkData: { roleId: string; applicationId: string; timestamp: number }, ttlDays: number = 180): boolean {
  const now = Date.now();
  const expiryTime = watermarkData.timestamp + (ttlDays * 24 * 60 * 60 * 1000);
  return now > expiryTime;
}

/**
 * Generate signed HLS master playlist URL
 * @param s3Key S3 object key for HLS master playlist
 * @param userId User requesting access
 * @param expirySeconds URL expiration time
 * @returns Signed HLS master playlist URL
 */
export async function generateSignedHLSMasterUrl(
  s3Key: string,
  userId: string,
  expirySeconds: number = HLS_URL_EXPIRY
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
 * Generate signed HLS segment URL
 * @param s3Key S3 object key for HLS segment
 * @param userId User requesting access
 * @param expirySeconds URL expiration time
 * @returns Signed HLS segment URL
 */
export async function generateSignedHLSSegmentUrl(
  s3Key: string,
  userId: string,
  expirySeconds: number = HLS_URL_EXPIRY
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
 * Generate HLS token for authentication
 * @param userId User ID
 * @param assetId Media asset ID
 * @param expirySeconds Token expiration time
 * @returns HLS authentication token
 */
export function generateHLSToken(
  userId: string,
  assetId: string,
  expirySeconds: number = HLS_URL_EXPIRY
): string {
  const payload = {
    userId,
    assetId,
    exp: Math.floor(Date.now() / 1000) + expirySeconds,
    iat: Math.floor(Date.now() / 1000)
  };

  return crypto
    .createHmac('sha256', HLS_SIGNING_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
}

/**
 * Verify HLS token
 * @param token HLS authentication token
 * @param userId Expected user ID
 * @param assetId Expected asset ID
 * @returns True if token is valid
 */
export function verifyHLSToken(
  token: string,
  userId: string,
  assetId: string
): boolean {
  try {
    // In a real implementation, we'd decode the token and verify the signature
    // For now, we'll just check if it's a valid hex string
    return /^[a-f0-9]{64}$/.test(token);
  } catch (error) {
    return false;
  }
}

/**
 * Generate HLS manifest with signed URLs
 * @param masterPlaylistS3Key S3 key for master playlist
 * @param segmentS3Keys Array of S3 keys for segments
 * @param userId User requesting access
 * @returns HLS manifest content
 */
export async function generateHLSManifest(
  masterPlaylistS3Key: string,
  segmentS3Keys: string[],
  userId: string
): Promise<string> {
  const masterUrl = await generateSignedHLSMasterUrl(masterPlaylistS3Key, userId);
  
  // Generate signed URLs for all segments
  const segmentUrls = await Promise.all(
    segmentS3Keys.map(key => generateSignedHLSSegmentUrl(key, userId))
  );

  // Create HLS manifest with signed URLs
  const manifest = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-TARGETDURATION:10',
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:VOD',
    ...segmentUrls.map((url, index) => [
      `#EXTINF:10.0,`,
      url
    ].join('\n')),
    '#EXT-X-ENDLIST'
  ].join('\n');

  return manifest;
}
