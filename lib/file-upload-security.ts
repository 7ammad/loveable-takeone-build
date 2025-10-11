/**
 * File Upload Security
 * Comprehensive validation for uploaded files
 */

import { createHash } from 'crypto';

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFilename?: string;
  hash?: string;
}

/**
 * Allowed file types with MIME types
 */
export const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  
  // Videos
  'video/mp4': ['.mp4'],
  'video/mpeg': ['.mpeg', '.mpg'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
};

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 20 * 1024 * 1024, // 20MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
  default: 10 * 1024 * 1024, // 10MB
};

/**
 * Dangerous file extensions to block
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
  '.vbs', '.js', '.jar', '.msi', '.app',
  '.deb', '.rpm', '.dmg', '.pkg',
  '.sh', '.bash', '.zsh', '.ps1',
];

/**
 * Validate file upload
 */
export function validateFile(
  file: { name: string; type: string; size: number },
  allowedTypes?: string[]
): FileValidationResult {
  const errors: string[] = [];

  // Check file name
  if (!file.name || file.name.length === 0) {
    errors.push('File name is required');
    return { valid: false, errors };
  }

  if (file.name.length > 255) {
    errors.push('File name too long (max 255 characters)');
  }

  // Check for dangerous extensions
  const ext = getFileExtension(file.name);
  if (DANGEROUS_EXTENSIONS.includes(ext.toLowerCase())) {
    errors.push('File type not allowed for security reasons');
    return { valid: false, errors };
  }

  // Validate MIME type
  const types = allowedTypes || Object.keys(ALLOWED_FILE_TYPES);
  if (!types.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Validate extension matches MIME type
  if (file.type in ALLOWED_FILE_TYPES) {
    const allowedExts = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    if (!allowedExts.includes(ext.toLowerCase())) {
      errors.push(`File extension ${ext} does not match MIME type ${file.type}`);
    }
  }

  // Validate file size
  const category = getFileCategory(file.type);
  const sizeLimit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default;
  
  if (file.size > sizeLimit) {
    const limitMB = Math.round(sizeLimit / 1024 / 1024);
    errors.push(`File size exceeds ${limitMB}MB limit`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Generate sanitized filename
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    valid: errors.length === 0,
    errors,
    sanitizedFilename,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  filename = filename.replace(/\.\./g, '');
  filename = filename.replace(/[\/\\]/g, '');
  
  // Remove special characters
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Remove multiple dots (except for extension)
  const parts = filename.split('.');
  if (parts.length > 2) {
    const ext = parts.pop();
    filename = parts.join('_') + '.' + ext;
  }
  
  // Limit length
  if (filename.length > 100) {
    const ext = getFileExtension(filename);
    const nameWithoutExt = filename.slice(0, filename.length - ext.length);
    filename = nameWithoutExt.slice(0, 100 - ext.length) + ext;
  }
  
  return filename;
}

/**
 * Generate secure random filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const ext = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get file extension
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
}

/**
 * Get file category
 */
function getFileCategory(mimeType: string): keyof typeof FILE_SIZE_LIMITS {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  return 'default';
}

/**
 * Calculate file hash
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate image file (check magic bytes)
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magicBytes = buffer.slice(0, 12);
  
  // JPEG
  if (mimeType === 'image/jpeg') {
    return magicBytes[0] === 0xFF && magicBytes[1] === 0xD8;
  }
  
  // PNG
  if (mimeType === 'image/png') {
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    return pngSignature.every((byte, i) => magicBytes[i] === byte);
  }
  
  // GIF
  if (mimeType === 'image/gif') {
    const gif87 = Buffer.from('GIF87a');
    const gif89 = Buffer.from('GIF89a');
    return magicBytes.slice(0, 6).equals(gif87) || magicBytes.slice(0, 6).equals(gif89);
  }
  
  // WebP
  if (mimeType === 'image/webp') {
    return magicBytes.slice(0, 4).toString() === 'RIFF' && 
           magicBytes.slice(8, 12).toString() === 'WEBP';
  }
  
  return true; // Allow other types (PDF, etc.)
}

