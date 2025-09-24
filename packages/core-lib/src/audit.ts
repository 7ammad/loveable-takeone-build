import { prisma } from '@/packages/core-db/src/client';
import type { Prisma } from '@prisma/client';

export type AuditEventPayload = Omit<Prisma.AuditEventCreateInput, 'id' | 'createdAt'>;

/**
 * Logs an audit event to the database.
 * This is used for tracking important actions for security and compliance.
 * @param event - The audit event data to log.
 */
export async function logAuditEvent(event: AuditEventPayload): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: event,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // In a production environment, you might want to send this to a more robust logging service.
  }
}

