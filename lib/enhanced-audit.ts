/**
 * Enhanced Audit Logging Service
 * Comprehensive audit trail for compliance and security
 */

import { prisma } from '@packages/core-db';

export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  
  // Account Management
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_UPDATED = 'account_updated',
  ACCOUNT_DELETED = 'account_deleted',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  ACCOUNT_ACTIVATED = 'account_activated',
  ACCOUNT_DEACTIVATED = 'account_deactivated',
  
  // Authorization Events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  FORBIDDEN_ACCESS = 'forbidden_access',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGED = 'role_changed',
  
  // Data Operations
  DATA_CREATED = 'data_created',
  DATA_UPDATED = 'data_updated',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  BULK_OPERATION = 'bulk_operation',
  
  // Admin Actions
  ADMIN_USER_MODIFIED = 'admin_user_modified',
  ADMIN_ROLE_ASSIGNED = 'admin_role_assigned',
  ADMIN_PERMISSION_GRANTED = 'admin_permission_granted',
  ADMIN_SETTINGS_CHANGED = 'admin_settings_changed',
  
  // Security Events
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VIOLATION = 'csrf_violation',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  
  // File Operations
  FILE_UPLOADED = 'file_uploaded',
  FILE_DOWNLOADED = 'file_downloaded',
  FILE_DELETED = 'file_deleted',
  MALICIOUS_FILE_BLOCKED = 'malicious_file_blocked',
  
  // Email/Communication
  EMAIL_SENT = 'email_sent',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  
  // 2FA Events
  TWO_FACTOR_ENABLED = '2fa_enabled',
  TWO_FACTOR_DISABLED = '2fa_disabled',
  TWO_FACTOR_VERIFIED = '2fa_verified',
  TWO_FACTOR_FAILED = '2fa_failed',
  BACKUP_CODE_USED = 'backup_code_used',
}

export interface AuditLogData {
  eventType: AuditEventType | string;
  actorUserId?: string;
  targetUserId?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        eventType: data.eventType,
        actorUserId: data.actorUserId || null,
        resourceType: data.resourceType || null,
        resourceId: data.resourceId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        success: data.success ?? true,
        errorMessage: data.errorMessage || null,
        timestamp: new Date(),
        createdAt: new Date(),
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        type: data.eventType,
        actor: data.actorUserId,
        target: data.targetUserId,
        resource: data.resourceType ? `${data.resourceType}:${data.resourceId}` : null,
        success: data.success ?? true,
      });
    }

    // Send critical events to monitoring service
    if (data.severity === 'critical' || data.severity === 'error') {
      await sendToMonitoring(data);
    }
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('[AUDIT ERROR]', error);
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  eventType: AuditEventType,
  userId: string | null,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    eventType,
    actorUserId: userId || undefined,
    ipAddress,
    userAgent,
    success,
    metadata,
    severity: success ? 'info' : 'warning',
  });
}

/**
 * Log admin action
 */
export async function logAdminAction(
  eventType: AuditEventType,
  adminUserId: string,
  targetUserId: string | null,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    eventType,
    actorUserId: adminUserId,
    targetUserId: targetUserId || undefined,
    metadata: {
      action,
      ...metadata,
    },
    severity: 'warning',
  });
}

/**
 * Log data operation
 */
export async function logDataOperation(
  operation: 'create' | 'update' | 'delete',
  userId: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>
): Promise<void> {
  const eventTypeMap = {
    create: AuditEventType.DATA_CREATED,
    update: AuditEventType.DATA_UPDATED,
    delete: AuditEventType.DATA_DELETED,
  };

  await createAuditLog({
    eventType: eventTypeMap[operation],
    actorUserId: userId,
    resourceType,
    resourceId,
    metadata: changes ? { changes } : undefined,
    severity: 'info',
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: AuditEventType,
  ipAddress: string,
  userAgent: string,
  userId: string | null,
  details: Record<string, any>
): Promise<void> {
  await createAuditLog({
    eventType,
    actorUserId: userId || undefined,
    ipAddress,
    userAgent,
    metadata: details,
    success: false,
    severity: 'error',
  });
}

/**
 * Query audit logs (admin only)
 */
export async function queryAuditLogs(filters: {
  eventType?: string;
  actorUserId?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 50, 100);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.eventType) {
    where.eventType = filters.eventType;
  }

  if (filters.actorUserId) {
    where.actorUserId = filters.actorUserId;
  }

  if (filters.resourceType) {
    where.resourceType = filters.resourceType;
  }

  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) {
      where.timestamp.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.timestamp.lte = filters.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Clean up old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.auditEvent.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });

  console.log(`[AUDIT CLEANUP] Deleted ${result.count} audit logs older than ${retentionDays} days`);
  return result.count;
}

/**
 * Send to monitoring service (placeholder)
 */
async function sendToMonitoring(data: AuditLogData): Promise<void> {
  // TODO: Integrate with monitoring service (DataDog, New Relic, etc.)
  // For now, just log to console
  if (process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL AUDIT EVENT]', data);
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(userId?: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = {
    timestamp: { gte: startDate },
  };

  if (userId) {
    where.actorUserId = userId;
  }

  const [
    totalEvents,
    failedEvents,
    securityEvents,
    eventsByType,
  ] = await Promise.all([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.count({
      where: { ...where, success: false },
    }),
    prisma.auditEvent.count({
      where: {
        ...where,
        eventType: {
          in: [
            AuditEventType.BRUTE_FORCE_ATTEMPT,
            AuditEventType.SUSPICIOUS_ACTIVITY,
            AuditEventType.UNAUTHORIZED_ACCESS,
            AuditEventType.FORBIDDEN_ACCESS,
          ],
        },
      },
    }),
    prisma.auditEvent.groupBy({
      by: ['eventType'],
      where,
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
      take: 10,
    }),
  ]);

  return {
    totalEvents,
    failedEvents,
    securityEvents,
    successRate: totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100,
    topEventTypes: eventsByType.map(e => ({
      type: e.eventType,
      count: e._count,
    })),
  };
}

