/**
 * Payment Receipt Data Encryption
 * 
 * Encrypts sensitive payment receipt data before storing in database.
 * Uses AES-256-GCM for authenticated encryption.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes auth tag
// Salt length constant for future use
// const SALT_LENGTH = 32; // 32 bytes salt for key derivation

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.RECEIPT_ENCRYPTION_KEY;
  
  if (!keyHex) {
    throw new Error('RECEIPT_ENCRYPTION_KEY environment variable not set');
  }
  
  const key = Buffer.from(keyHex, 'hex');
  
  if (key.length !== 32) {
    throw new Error('RECEIPT_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  
  return key;
}

/**
 * Encrypt sensitive receipt data
 * 
 * @param data - Plain text data to encrypt
 * @returns Encrypted data with IV and auth tag
 * 
 * @example
 * const encrypted = encryptReceiptData(JSON.stringify(paymentData));
 * // Store encrypted in database
 */
export function encryptReceiptData(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('[Payment Encryption] Encryption failed:', error);
    throw new Error('Failed to encrypt receipt data');
  }
}

/**
 * Decrypt sensitive receipt data
 * 
 * @param encryptedData - Encrypted data (base64)
 * @returns Decrypted plain text data
 * 
 * @example
 * const decrypted = decryptReceiptData(encrypted);
 * const paymentData = JSON.parse(decrypted);
 */
export function decryptReceiptData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Payment Encryption] Decryption failed:', error);
    throw new Error('Failed to decrypt receipt data');
  }
}

/**
 * Sanitize sensitive payment data before storing
 * 
 * Removes or masks sensitive fields that shouldn't be stored.
 * 
 * @param rawData - Raw payment provider response
 * @returns Sanitized data safe for storage
 */
export function sanitizePaymentData(rawData: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...rawData };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'cvv',
    'cvc',
    'card_number',
    'cardNumber',
    'password',
    'pin',
    'secret',
    'api_key',
    'apiKey',
    'token',
    'access_token',
    'accessToken',
  ];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  // Mask card numbers if present (keep last 4 digits)
  if (sanitized.card && typeof sanitized.card === 'object' && sanitized.card !== null) {
    const card = sanitized.card as Record<string, unknown>;
    if (typeof card.number === 'string') {
      card.number = maskCardNumber(card.number);
    }
  }

  if (sanitized.source && typeof sanitized.source === 'object' && sanitized.source !== null) {
    const source = sanitized.source as Record<string, unknown>;
    if (typeof source.number === 'string') {
      source.number = maskCardNumber(source.number);
    }
  }
  
  return sanitized;
}

/**
 * Mask credit card number (show only last 4 digits)
 * 
 * @param cardNumber - Full card number
 * @returns Masked card number (e.g., "**** **** **** 1234")
 */
function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Generate encryption key (run once to generate key for environment variable)
 * 
 * @returns Hex-encoded 256-bit key
 * 
 * @example
 * const key = generateEncryptionKey();
 * // Store in .env as RECEIPT_ENCRYPTION_KEY=<key>
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store receipt with encryption
 * 
 * @param rawData - Raw payment provider response
 * @returns Object ready to store in Receipt model
 */
export function prepareReceiptForStorage(rawData: Record<string, unknown>) {
  const sanitized = sanitizePaymentData(rawData);
  const encrypted = encryptReceiptData(JSON.stringify(sanitized));
  
  return {
    raw: encrypted,
    isEncrypted: true,
  };
}

/**
 * Retrieve and decrypt receipt data
 * 
 * @param encryptedRaw - Encrypted raw field from Receipt model
 * @returns Decrypted and parsed payment data
 */
export function retrieveReceiptData(encryptedRaw: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof encryptedRaw === 'string') {
    try {
      const decrypted = decryptReceiptData(encryptedRaw);
      return JSON.parse(decrypted) as Record<string, unknown>;
    } catch {
      console.warn('[Payment Encryption] Failed to decrypt, returning raw data');
      return { raw: encryptedRaw };
    }
  }
  
  // Already decrypted or plain object
  return encryptedRaw;
}

