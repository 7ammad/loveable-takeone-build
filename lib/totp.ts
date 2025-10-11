/**
 * TOTP (Time-based One-Time Password) Implementation
 * Two-Factor Authentication using authenticator apps
 */

import { randomBytes, createHmac } from 'crypto';

/**
 * Generate TOTP secret
 */
export function generateTotpSecret(): string {
  return randomBytes(20).toString('hex');
}

/**
 * Generate TOTP code
 */
export function generateTotpCode(secret: string, timeStep: number = 30): string {
  const epoch = Math.floor(Date.now() / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(epoch));
  
  const secretBuffer = Buffer.from(secret, 'hex');
  const hmac = createHmac('sha1', secretBuffer);
  hmac.update(buffer);
  const digest = hmac.digest();
  
  const offset = digest[digest.length - 1] & 0xf;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

/**
 * Verify TOTP code
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  window: number = 1
): boolean {
  // Check current time and ±window steps
  for (let i = -window; i <= window; i++) {
    const timeStep = Math.floor(Date.now() / 1000 / 30) + i;
    const epoch = timeStep;
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(epoch));
    
    const secretBuffer = Buffer.from(secret, 'hex');
    const hmac = createHmac('sha1', secretBuffer);
    hmac.update(buffer);
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0xf;
    const generatedCode = (
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)
    ) % 1000000;
    
    if (generatedCode.toString().padStart(6, '0') === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate QR code URL for authenticator apps
 */
export function generateQrCodeUrl(
  secret: string,
  email: string,
  issuer: string = 'TakeOne'
): string {
  const secretBase32 = bufferToBase32(Buffer.from(secret, 'hex'));
  const label = encodeURIComponent(`${issuer}:${email}`);
  const issuerParam = encodeURIComponent(issuer);
  
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${issuerParam}`;
}

/**
 * Convert buffer to base32 (RFC 4648)
 */
function bufferToBase32(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  
  return codes;
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
    .update(code)
    .digest('hex');
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
}

