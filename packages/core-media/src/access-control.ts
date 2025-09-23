import { prisma } from '@/packages/core-db/src/client';
import { generateSignedMediaUrl } from './signed-hls';

export enum MediaVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

export enum MediaTTLPolicy {
  PERMANENT = 'permanent',
  ARCHIVE_30_DAYS = 'archive_30d',
  ARCHIVE_180_DAYS = 'archive_180d', // For self-tapes
  ARCHIVE_1_YEAR = 'archive_1y',
}

/**
 * Check if a user has access to view a media asset
 * @param userId User requesting access
 * @param assetId Media asset ID
 * @returns True if access is allowed
 */
export async function canAccessMedia(userId: string, assetId: string): Promise<boolean> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    return false;
  }

  // Owner always has access
  if (asset.userId === userId) {
    return true;
  }

  // Check visibility rules
  switch (asset.visibility) {
    case MediaVisibility.PUBLIC:
      return true;
    case MediaVisibility.UNLISTED:
      // Unlisted: accessible via direct link but not listed publicly
      return true;
    case MediaVisibility.PRIVATE:
    default:
      // Private: only owner can access
      return false;
  }
}

/**
 * Generate a signed URL for media access with proper access control
 * @param userId User requesting access
 * @param assetId Media asset ID
 * @param expirySeconds URL expiration time
 * @returns Signed URL or null if access denied
 */
export async function getMediaAccessUrl(
  userId: string,
  assetId: string,
  expirySeconds: number = 3600
): Promise<string | null> {
  const hasAccess = await canAccessMedia(userId, assetId);
  if (!hasAccess) {
    return null;
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    return null;
  }

  // Check if asset has expired according to TTL policy
  if (isAssetExpired(asset)) {
    return null;
  }

  return generateSignedMediaUrl(asset.s3Key, userId, expirySeconds);
}

/**
 * Check if a media asset has expired according to its TTL policy
 * @param asset Media asset
 * @returns True if expired
 */
export function isAssetExpired(asset: any): boolean {
  if (!asset.ttlPolicy || asset.ttlPolicy === MediaTTLPolicy.PERMANENT) {
    return false;
  }

  const createdAt = new Date(asset.createdAt);
  const now = new Date();

  switch (asset.ttlPolicy) {
    case MediaTTLPolicy.ARCHIVE_30_DAYS:
      return now.getTime() - createdAt.getTime() > 30 * 24 * 60 * 60 * 1000;
    case MediaTTLPolicy.ARCHIVE_180_DAYS:
      return now.getTime() - createdAt.getTime() > 180 * 24 * 60 * 60 * 1000;
    case MediaTTLPolicy.ARCHIVE_1_YEAR:
      return now.getTime() - createdAt.getTime() > 365 * 24 * 60 * 60 * 1000;
    default:
      return false;
  }
}

/**
 * Apply TTL policy to a media asset based on its type
 * @param assetId Media asset ID
 * @param contentType MIME type
 * @returns Applied TTL policy
 */
export function applyTTLPolicy(assetId: string, contentType: string): MediaTTLPolicy {
  // Self-tapes (videos) get 180-day TTL
  if (contentType.startsWith('video/')) {
    return MediaTTLPolicy.ARCHIVE_180_DAYS;
  }

  // Images get 1-year TTL
  if (contentType.startsWith('image/')) {
    return MediaTTLPolicy.ARCHIVE_1_YEAR;
  }

  // Documents and other files are permanent
  return MediaTTLPolicy.PERMANENT;
}

/**
 * Clean up expired media assets
 * @returns Number of assets cleaned up
 */
export async function cleanupExpiredAssets(): Promise<number> {
  const expiredAssets = await prisma.mediaAsset.findMany({
    where: {
      status: 'ready',
    },
  });

  let cleanedCount = 0;
  for (const asset of expiredAssets) {
    if (isAssetExpired(asset)) {
      // Mark as archived (could also delete from S3)
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { status: 'archived' },
      });
      cleanedCount++;
    }
  }

  return cleanedCount;
}

/**
 * Update media asset with TTL policy
 * @param assetId Asset ID
 * @param ttlPolicy TTL policy to apply
 */
export async function setAssetTTLPolicy(assetId: string, ttlPolicy: MediaTTLPolicy): Promise<void> {
  await prisma.mediaAsset.update({
    where: { id: assetId },
    data: { ttlPolicy },
  });
}
