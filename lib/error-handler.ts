/**
 * Secure Error Handling
 * Prevents information disclosure in error messages
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Error types we handle
 */
export type AppError = 
  | Error
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError
  | z.ZodError
  | unknown;

/**
 * Sanitized error response
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown> | unknown[] | string;
  code?: string;
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Sanitize error for production
 * Prevents leaking sensitive information
 */
export function sanitizeError(error: AppError): ErrorResponse {
  // ✅ Zod validation errors - safe to expose (user input issues)
  if (error instanceof z.ZodError) {
    return {
      error: 'Validation failed',
      message: 'The request contains invalid data',
      details: isDevelopment() ? error.issues : undefined,
    };
  }

  // ✅ Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return {
          error: 'Duplicate entry',
          message: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY',
        };
      
      case 'P2025': // Record not found
        return {
          error: 'Not found',
          message: 'The requested resource was not found',
          code: 'NOT_FOUND',
        };
      
      case 'P2003': // Foreign key constraint violation
        return {
          error: 'Invalid reference',
          message: 'The referenced resource does not exist',
          code: 'INVALID_REFERENCE',
        };
      
      case 'P2014': // Required relation violation
        return {
          error: 'Missing required data',
          message: 'Related data is missing',
          code: 'MISSING_RELATION',
        };
      
      default:
        // ❌ Don't expose internal database errors
        return {
          error: 'Database error',
          message: 'An error occurred while processing your request',
          code: isDevelopment() ? error.code : undefined,
        };
    }
  }

  // ✅ Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Invalid data',
      message: 'The provided data is invalid',
      // ❌ Don't expose validation details in production (could leak schema)
      details: isDevelopment() ? error.message : undefined,
    };
  }

  // ✅ Standard Error objects
  if (error instanceof Error) {
    // Known safe errors that can be exposed
    const safeErrorMessages = [
      'Unauthorized',
      'Forbidden',
      'Not found',
      'Bad request',
      'Too many requests',
      'Invalid token',
      'Token expired',
      'Invalid credentials',
    ];

    const isSafeError = safeErrorMessages.some(safe => 
      error.message.toLowerCase().includes(safe.toLowerCase())
    );

    if (isSafeError) {
      return {
        error: error.name || 'Error',
        message: error.message,
      };
    }

    // ❌ Generic error for everything else
    return {
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      // Only expose stack trace in development
      details: isDevelopment() ? { message: error.message, stack: error.stack } : undefined,
    };
  }

  // ✅ Unknown errors
  return {
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    details: isDevelopment() ? String(error) : undefined,
  };
}

/**
 * Get appropriate HTTP status code for error
 */
export function getErrorStatusCode(error: AppError): number {
  if (error instanceof z.ZodError) {
    return 400; // Bad Request
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': return 409; // Conflict
      case 'P2025': return 404; // Not Found
      case 'P2003': return 400; // Bad Request
      case 'P2014': return 400; // Bad Request
      default: return 500; // Internal Server Error
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('unauthorized') || message.includes('invalid token')) {
      return 401;
    }
    if (message.includes('forbidden')) {
      return 403;
    }
    if (message.includes('not found')) {
      return 404;
    }
    if (message.includes('too many requests')) {
      return 429;
    }
    if (message.includes('bad request') || message.includes('invalid')) {
      return 400;
    }
  }

  return 500; // Internal Server Error
}

/**
 * Log error for monitoring (only in production)
 */
export function logError(error: AppError, context?: Record<string, any>): void {
  // In production, send to monitoring service (Sentry, DataDog, etc.)
  if (!isDevelopment()) {
    console.error('[ERROR]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Integrate with monitoring service
    // Example: Sentry.captureException(error, { extra: context });
  } else {
    // In development, log full error
    console.error('[ERROR]', error, context);
  }
}

/**
 * Create error response with proper sanitization
 */
export function createErrorResponse(
  error: AppError,
  context?: Record<string, any>
): NextResponse {
  // Log error for monitoring
  logError(error, context);
  
  // Sanitize error
  const sanitized = sanitizeError(error);
  const status = getErrorStatusCode(error);
  
  return NextResponse.json(
    { success: false, ...sanitized },
    { status }
  );
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandler(
  handler: (request: Request, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (request: Request, context?: Record<string, unknown>): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(error, {
        url: request.url,
        method: request.method,
      });
    }
  };
}

/**
 * Create a safe error object for client
 */
export function createSafeError(message: string, code?: string): ErrorResponse {
  return {
    error: 'Error',
    message,
    code,
  };
}

