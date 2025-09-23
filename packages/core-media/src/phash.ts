import crypto from 'crypto';

/**
 * Simple perceptual hash implementation for content matching
 * In production, this would use a proper pHash library like node-phash
 */
export class PerceptualHash {
  /**
   * Compute perceptual hash of image data
   * @param imageBuffer Image buffer
   * @param width Image width
   * @param height Image height
   * @returns pHash string
   */
  static async computeImageHash(imageBuffer: Buffer, width: number, height: number): Promise<string> {
    // Simplified implementation - in production use proper pHash algorithm
    // This creates a hash based on image dimensions and content sample

    const sampleSize = Math.min(1024, imageBuffer.length);
    const sample = imageBuffer.slice(0, sampleSize);

    const hash = crypto.createHash('sha256')
      .update(sample)
      .update(`${width}x${height}`)
      .digest('hex');

    return hash.substring(0, 16); // 64-bit hash
  }

  /**
   * Compute perceptual hash of video data
   * @param videoBuffer Video buffer (first few frames)
   * @returns pHash string
   */
  static async computeVideoHash(videoBuffer: Buffer): Promise<string> {
    // Simplified video hashing - sample first 64KB
    const sampleSize = Math.min(65536, videoBuffer.length);
    const sample = videoBuffer.slice(0, sampleSize);

    const hash = crypto.createHash('sha256')
      .update(sample)
      .digest('hex');

    return hash.substring(0, 16);
  }

  /**
   * Compare two perceptual hashes
   * @param hash1 First hash
   * @param hash2 Second hash
   * @returns Similarity score (0-1, where 1 is identical)
   */
  static compareHashes(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) {
      return 0;
    }

    let matchingBits = 0;
    const totalBits = hash1.length * 4; // hex chars to bits

    for (let i = 0; i < hash1.length; i++) {
      const byte1 = parseInt(hash1[i], 16);
      const byte2 = parseInt(hash2[i], 16);

      // Count matching bits in each hex digit (4 bits)
      for (let bit = 0; bit < 4; bit++) {
        if ((byte1 & (1 << bit)) === (byte2 & (1 << bit))) {
          matchingBits++;
        }
      }
    }

    return matchingBits / totalBits;
  }

  /**
   * Check if content is similar (potential duplicate/leak)
   * @param hash1 Content hash
   * @param hash2 Comparison hash
   * @param threshold Similarity threshold (0-1)
   * @returns True if similar enough
   */
  static isSimilar(hash1: string, hash2: string, threshold: number = 0.8): boolean {
    const similarity = this.compareHashes(hash1, hash2);
    return similarity >= threshold;
  }
}
