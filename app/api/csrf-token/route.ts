import { NextRequest } from 'next/server';
import { handleCsrfTokenRequest } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 * Get CSRF token for form submissions
 */
export async function GET(request: NextRequest) {
  return handleCsrfTokenRequest(request);
}

