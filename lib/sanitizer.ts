import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * It removes any potentially malicious code, allowing only a safe subset of HTML.
 *
 * @param dirty The potentially unsafe HTML string.
 * @returns A sanitized HTML string.
 */
export function sanitize(dirty: string | null | undefined): string {
  if (!dirty) {
    return '';
  }
  return purify.sanitize(dirty);
}

/**
 * A more aggressive sanitizer that strips all HTML tags,
 * leaving only the text content. Useful for fields that should be plain text.
 *
 * @param dirty The potentially unsafe string with HTML.
 * @returns A plain text string.
 */
export function stripHtml(dirty: string | null | undefined): string {
    if (!dirty) {
        return '';
    }
    const sanitized = purify.sanitize(dirty, { ALLOWED_TAGS: [] });
    return sanitized;
}
