/**
 * Request/Response Logging
 * Structured logging for API requests
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RequestLogData {
  method: string;
  path: string;
  query: Record<string, string>;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  responseSize?: number;
  error?: string;
}

/**
 * Sanitize sensitive data from logs
 */
function sanitize(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any[] | Record<string, any> = Array.isArray(data) ? [] : {};
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie'];

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      (sanitized as Record<string, any>)[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as Record<string, any>)[key] = sanitize(value);
    } else {
      (sanitized as Record<string, any>)[key] = value;
    }
  }

  return sanitized;
}

/**
 * Log request/response
 */
export function logRequest(data: RequestLogData): void {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldLog = isDevelopment || data.statusCode >= 400;

  if (!shouldLog) {
    return;
  }

  const logLevel = data.statusCode >= 500 ? 'ERROR' : data.statusCode >= 400 ? 'WARN' : 'INFO';
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: logLevel,
    method: data.method,
    path: data.path,
    query: sanitize(data.query),
    userId: data.userId,
    ip: data.ipAddress,
    userAgent: data.userAgent,
    status: data.statusCode,
    responseTime: `${data.responseTime}ms`,
    size: data.responseSize,
    error: data.error,
  };

  if (isDevelopment) {
    console.log(`[${logLevel}] ${data.method} ${data.path} - ${data.statusCode} (${data.responseTime}ms)`);
  } else {
    // In production, use structured logging
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Request logging middleware
 */
export async function requestLoggingMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const response = await handler();
    const responseTime = Date.now() - startTime;

    logRequest({
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      statusCode: response.status,
      responseTime,
    });

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logRequest({
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      statusCode: 500,
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

