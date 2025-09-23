import { prisma } from '@/packages/core-db/src/client';
import { indexerQueue, emailQueue, smsQueue, mediaQueue, billingQueue, alertsQueue, dlq } from './queues';

/**
 * Outbox event types
 */
export type OutboxEventType =
  | 'TalentProfileCreated'
  | 'TalentProfileUpdated'
  | 'ApplicationCreated'
  | 'EmailSend'
  | 'SmsSend'
  | 'MediaProcessed'
  | 'BillingEvent';

/**
 * Adds an event to the outbox within a database transaction
 * @param eventType The type of event
 * @param payload The event payload
 * @param tx Optional transaction to use
 * @returns The created outbox entry
 */
export async function addToOutbox(
  eventType: OutboxEventType,
  payload: any,
  tx?: any
) {
  const prismaClient = tx || prisma;
  return await prismaClient.outbox.create({
    data: {
      eventType,
      payload,
    },
  });
}

/**
 * Processes outbox events by routing them to appropriate queues
 * @param outboxId The outbox entry ID
 * @param eventType The event type
 * @param payload The event payload
 * @param attemptNumber Current attempt number
 */
export async function processOutboxEvent(
  outboxId: bigint | number,
  eventType: OutboxEventType,
  payload: any,
  attemptNumber: number
) {
  try {
    switch (eventType) {
      case 'TalentProfileCreated':
      case 'TalentProfileUpdated':
        await indexerQueue.add('index-talent', { outboxId, payload }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        });
        break;

      case 'ApplicationCreated':
        await alertsQueue.add('application-alert', { outboxId, payload }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        });
        break;

      case 'EmailSend':
        await emailQueue.add('send-email', { outboxId, payload }, {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          removeOnComplete: 50,
          removeOnFail: 10,
        });
        break;

      case 'SmsSend':
        await smsQueue.add('send-sms', { outboxId, payload }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 50,
          removeOnFail: 10,
        });
        break;

      case 'MediaProcessed':
        await mediaQueue.add('process-media', { outboxId, payload }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 15000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        });
        break;

      case 'BillingEvent':
        await billingQueue.add('process-billing', { outboxId, payload }, {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 30000,
          },
          removeOnComplete: 20,
          removeOnFail: 10,
        });
        break;

      default:
        console.warn(`Unknown outbox event type: ${eventType}`);
    }

    // Mark as processed
    await prisma.outbox.update({
      where: { id: outboxId },
      data: { status: 'processed' },
    });

  } catch (error) {
    console.error(`Failed to process outbox event ${outboxId}:`, error);

    const maxAttempts = 5;
    if (attemptNumber >= maxAttempts) {
      // Move to DLQ
      await dlq.add('dead-letter', {
        originalEventType: eventType,
        payload,
        error: (error as Error).message,
        attemptNumber,
        outboxId,
      });

      await prisma.outbox.update({
        where: { id: outboxId },
        data: {
          status: 'dead',
          lastError: (error as Error).message
        },
      });
    } else {
      // Schedule retry with exponential backoff
      const nextRunAt = new Date(Date.now() + Math.pow(2, attemptNumber) * 60000); // Exponential backoff in minutes
      await prisma.outbox.update({
        where: { id: outboxId },
        data: {
          attempts: { increment: 1 },
          nextRunAt,
          lastError: (error as Error).message,
        },
      });
    }
  }
}

/**
 * Gets pending outbox events that are ready to be processed
 * @param limit Maximum number of events to return
 * @returns Array of outbox events
 */
export async function getPendingOutboxEvents(limit: number = 50) {
  return await prisma.outbox.findMany({
    where: {
      status: 'pending',
      nextRunAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });
}
