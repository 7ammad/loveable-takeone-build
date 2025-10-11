/**
 * CORS Configuration
 * Secure Cross-Origin Resource Sharing settings
 */

import { NextResponse } from 'next/server';

/**
 * Allowed origins for CORS
 * Update this list based on your deployment environments
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://takeone.sa',
  'https://www.takeone.sa',
  'https://app.takeone.sa',
  'https://admin.takeone.sa',
  // Add staging/production domains as needed
];

/**
 * Check if origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests
  
  // In development, allow all localhost origins
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null,
  methods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
): NextResponse {
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

/**
 * Handle OPTIONS (preflight) requests
 */
export function handleCorsPreflightRequest(origin: string | null): NextResponse {
  const response = NextResponse.json({ success: true }, { status: 200 });
  return addCorsHeaders(response, origin);
}

/**
 * Validate CORS and return error if not allowed
 */
export function validateCors(origin: string | null): NextResponse | null {
  if (origin && !isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: 'CORS: Origin not allowed' },
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  return null;
}

/**
 * Middleware helper for CORS
 */
export function corsMiddleware(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const origin = request.headers.get('origin');
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(origin);
    }
    
    // Validate CORS
    const corsError = validateCors(origin);
    if (corsError) return corsError;
    
    // Execute handler
    const response = await handler(request);
    
    // Add CORS headers to response
    return addCorsHeaders(response, origin);
  };
}

