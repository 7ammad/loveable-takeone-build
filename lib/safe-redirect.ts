/**
 * Safe Redirect Validation
 * Prevent open redirect vulnerabilities
 */

/**
 * Allowed redirect domains
 */
const ALLOWED_DOMAINS = [
  'localhost',
  'takeone.sa',
  'www.takeone.sa',
  'app.takeone.sa',
  'admin.takeone.sa',
];

/**
 * Validate redirect URL
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    // Allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      // Check for path traversal
      if (url.includes('..')) {
        return false;
      }
      return true;
    }

    // Parse absolute URLs
    const parsed = new URL(url);

    // Block dangerous protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check if domain is allowed
    const hostname = parsed.hostname;
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );

    return isAllowed;
  } catch {
    return false;
  }
}

/**
 * Get safe redirect URL
 */
export function getSafeRedirectUrl(url: string | null, fallback: string = '/'): string {
  if (!url) {
    return fallback;
  }

  if (isValidRedirectUrl(url)) {
    return url;
  }

  return fallback;
}

/**
 * Sanitize redirect parameter
 */
export function sanitizeRedirectParam(redirectParam: string | null): string {
  if (!redirectParam) {
    return '/';
  }

  return getSafeRedirectUrl(redirectParam, '/');
}

