// S3 client
export { s3Client } from './client';

// Signed HLS and watermarking
export { generateSignedMediaUrl, generateWatermark, verifyWatermark } from './signed-hls';

// Perceptual hashing
export { PerceptualHash } from './phash';

// Access control and TTL
export {
  canAccessMedia,
  getMediaAccessUrl,
  isAssetExpired,
  applyTTLPolicy,
  cleanupExpiredAssets,
  setAssetTTLPolicy,
  shouldArchiveSelfTape,
  getTTLPolicyForContent,
  MediaVisibility,
  MediaTTLPolicy
} from './access-control';
