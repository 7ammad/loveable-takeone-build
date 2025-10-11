/**
 * Validation Queue Worker
 * Processes approved casting calls and indexes them in Algolia
 */

import { Worker } from 'bullmq';
import { prisma } from '@/packages/core-db/src/client';
import { indexCastingCall } from '@/packages/core-search/src/casting-call-indexer';

export function createValidationQueueWorker() {
  const worker = new Worker(
    'validation-queue',
    async (job) => {
      const { castingCallId, action } = job.data;

      console.log(`🔄 Processing validation queue job: ${action} for casting call ${castingCallId}`);

      try {
        // Get the casting call
        const castingCall = await prisma.castingCall.findUnique({
          where: { id: castingCallId },
        });

        if (!castingCall) {
          throw new Error(`Casting call ${castingCallId} not found`);
        }

        if (action === 'approve' && castingCall.status === 'active') {
          // Index in Algolia for search with retry
          console.log(`🔍 Indexing casting call ${castingCallId} in Algolia`);

          let attempts = 0;
          const maxAttempts = 3;
          let lastError;

          while (attempts < maxAttempts) {
            try {
              await indexCastingCall({
                id: castingCall.id,
                title: castingCall.title,
                description: (castingCall as any).description ?? null,
                company: (castingCall as any).company ?? null,
                location: (castingCall as any).location ?? null,
                skills: (castingCall as any).skills ?? [],
                status: castingCall.status,
                createdAt: castingCall.createdAt,
                updatedAt: castingCall.updatedAt,
                isAggregated: (castingCall as any).isAggregated ?? null,
                deadline: (castingCall as any).deadline ?? null,
              });
              break; // Success, exit retry loop
            } catch (e) {
              lastError = e;
              attempts++;
              if (attempts < maxAttempts) {
                const backoffMs = Math.pow(2, attempts) * 1000;
                console.warn(`Algolia indexing attempt ${attempts} failed, retrying in ${backoffMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
              }
            }
          }

          if (attempts === maxAttempts && lastError) {
            console.error('Failed indexing to Algolia after retries:', (lastError as Error).message);
            throw lastError;
          }

          // Log successful indexing
          await prisma.auditEvent.create({
            data: {
              eventType: 'CastingCallIndexed',
              resourceType: 'CastingCall',
              resourceId: castingCallId,
              metadata: {
                indexedIn: 'algolia',
                title: castingCall.title,
                isAggregated: castingCall.isAggregated,
              },
            },
          });

          console.log(`✅ Successfully indexed casting call ${castingCallId}`);

        } else if (action === 'reject' && castingCall.status === 'rejected') {
          // Log rejection (no indexing needed)
          console.log(`🚫 Casting call ${castingCallId} rejected, skipping indexing`);
        }

      } catch (error) {
        console.error(`❌ Failed to process validation queue job for ${castingCallId}:`, error);

        // Log error
        await prisma.auditEvent.create({
          data: {
            eventType: 'ValidationQueueError',
            resourceType: 'CastingCall',
            resourceId: castingCallId,
            metadata: {
              error: (error as Error).message,
              action,
            },
          },
        });

        throw error;
      }
    },
    {
      // Redis connection will be handled by the queue system
      connection: process.env.REDIS_URL ? {
        url: process.env.REDIS_URL,
      } : {
        host: 'localhost',
        port: 6379,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Validation queue job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Validation queue job ${job?.id} failed:`, err);
  });

  return worker;
}

// For testing/development
export async function processValidationJob(castingCallId: string, action: 'approve' | 'reject') {
  const worker = createValidationQueueWorker();

  // Simulate job processing
  await worker.run();

  // Close worker after processing
  await worker.close();
}
