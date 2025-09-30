import { Worker } from 'bullmq';
import { prisma } from '@packages/core-db';
import { dlq } from '../queues';
import { CastingCall } from '@packages/core-contracts';
import crypto from 'crypto';

interface ValidationJob {
  sourceId: string;
  sourceUrl: string;
  castingCallData: CastingCall;
}

const worker = new Worker(
  'validation-queue',
  async (job) => {
    const data: ValidationJob = job.data;
    const { castingCallData } = data;

    try {
      console.log(`🕵️‍♀️ Validating casting call: "${castingCallData.title}"`);

      // 1. Generate content hash for deduplication
      const contentString = `${castingCallData.title}|${castingCallData.description || ''}|${castingCallData.company || ''}|${castingCallData.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      // 2. Check for duplicates
      const existingCall = await prisma.castingCall.findUnique({
        where: { contentHash },
      });

      if (existingCall) {
        console.log(`✅ Duplicate casting call detected, skipping: "${castingCallData.title}"`);
        return { status: 'duplicate', castingCallId: existingCall.id };
      }

      // 3. Persist the new casting call
      const newCastingCall = await prisma.castingCall.create({
        data: {
          ...castingCallData,
          deadline: castingCallData.deadline ? new Date(castingCallData.deadline) : null,
          contentHash,
          sourceUrl: data.sourceUrl,
          status: 'pending_review',
          isAggregated: true,
        },
      });

      console.log(`✅ Successfully created new casting call: "${newCastingCall.title}" (ID: ${newCastingCall.id})`);

      return { status: 'created', castingCallId: newCastingCall.id };

    } catch (error) {
      console.error(`❌ Failed to validate casting call "${castingCallData.title}":`, error);

      await dlq.add('failed-validation', {
        originalJob: data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },
  {
    connection: process.env.REDIS_URL ? (() => {
      const url = new URL(process.env.REDIS_URL);
      return { host: url.hostname, port: parseInt(url.port) || 6379 };
    })() : { host: 'localhost', port: 6379 },
    concurrency: 10,
    limiter: {
      max: 50,
      duration: 1000,
    },
  }
);

worker.on('completed', (job, result) => {
  console.log(`✅ Validation job ${job.id} completed with status: ${result.status}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Validation job ${job?.id} failed:`, err.message);
});

export default worker;
