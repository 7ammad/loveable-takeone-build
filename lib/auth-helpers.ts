import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';

// Re-export from enhanced-audit for convenience
export { 
  createAuditLog, 
  AuditEventType, 
  logAdminAction,
  logAuthEvent,
  logDataOperation,
  logSecurityEvent 
} from './enhanced-audit';

import { createAuditLog, AuditEventType } from './enhanced-audit';

/**
 * Get current authenticated user from request
 */
export async function getCurrentUser(request: NextRequest) {
  // Try cookie first (httpOnly)
  const tokenFromCookie = request.cookies.get('accessToken')?.value;

  if (tokenFromCookie) {
    return await verifyAccessToken(tokenFromCookie);
  }

  // Fallback to Authorization header (API clients)
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return await verifyAccessToken(token);
  }

  return null;
}

/**
 * Require authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<any | NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role || '')) {
    // Log unauthorized access attempt
    await createAuditLog({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS,
      actorUserId: user.userId,
      metadata: {
        attemptedRole: allowedRoles,
        actualRole: user.role,
        path: request.nextUrl.pathname
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false
    });

    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require resource ownership
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<any | NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Admin can access all resources
  if (user.role === 'admin') {
    return user;
  }

  // Check ownership
  if (user.userId !== resourceUserId) {
    await createAuditLog({
      eventType: AuditEventType.FORBIDDEN_ACCESS,
      actorUserId: user.userId,
      resourceId: resourceUserId,
      metadata: {
        path: request.nextUrl.pathname
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false
    });

    return NextResponse.json(
      { error: 'Forbidden - You can only access your own resources' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require admin role (direct call)
 */
export async function requireAdminDirect(request: NextRequest) {
  return requireRole(request, ['admin']);
}

/**
 * Require talent role (direct call)
 */
export async function requireTalentDirect(request: NextRequest) {
  return requireRole(request, ['talent', 'admin']);
}

/**
 * Require caster role (direct call)
 */
export async function requireCasterDirect(request: NextRequest) {
  return requireRole(request, ['caster', 'admin']);
}

/**
 * Higher-Order Function wrapper for requireAdmin (backward compatibility)
 */
export function requireAdmin() {
  return function(handler: (req: NextRequest, context: any, user: any, dbUser?: any) => Promise<Response>) {
    return async function(req: NextRequest, context: any) {
      const userOrResponse = await requireRole(req, ['admin']);
      if (isErrorResponse(userOrResponse)) {
        return userOrResponse;
      }
      // For HOF pattern, we don't fetch dbUser, just pass user
      return handler(req, context, userOrResponse, userOrResponse);
    };
  };
}

/**
 * Higher-Order Function wrapper for requireTalent (backward compatibility)
 */
export function requireTalent() {
  return function(handler: (req: NextRequest, context: any, user: any, dbUser?: any) => Promise<Response>) {
    return async function(req: NextRequest, context: any) {
      const userOrResponse = await requireRole(req, ['talent', 'admin']);
      if (isErrorResponse(userOrResponse)) {
        return userOrResponse;
      }
      return handler(req, context, userOrResponse, userOrResponse);
    };
  };
}

/**
 * Higher-Order Function wrapper for requireCaster (backward compatibility)
 */
export function requireCaster() {
  return function(handler: (req: NextRequest, context: any, user: any, dbUser?: any) => Promise<Response>) {
    return async function(req: NextRequest, context: any) {
      const userOrResponse = await requireRole(req, ['caster', 'admin']);
      if (isErrorResponse(userOrResponse)) {
        return userOrResponse;
      }
      return handler(req, context, userOrResponse, userOrResponse);
    };
  };
}

/**
 * Type guard helper
 */
export function isErrorResponse(value: any): value is NextResponse {
  return value instanceof NextResponse;
}
