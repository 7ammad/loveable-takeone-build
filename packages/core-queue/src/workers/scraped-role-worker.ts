import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { dlq, validationQueue } from '../queues.js';
import { LlmCastingCallExtractionService } from '@packages/core-lib';

const prisma = new PrismaClient();
const llmService = new LlmCastingCallExtractionService();

interface ScrapedRoleJob {
  sourceId: string;
  sourceUrl: string;
  rawMarkdown: string;
  scrapedAt: string;
}

// Create the worker
const scrapedRoleWorker = new Worker(
  'scraped-roles', // Corrected queue name
  async (job) => {
    const data: ScrapedRoleJob = job.data;

    try {
      console.log(`Processing raw content from source: ${data.sourceUrl}`);

      // Step 1: Use LLM to extract structured data from raw markdown
      const extractionResult = await llmService.extractCastingCallFromText(data.rawMarkdown);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(`LLM extraction failed: ${extractionResult.error}`);
      }

      console.log(`🤖 Successfully extracted structured data from ${data.sourceUrl}`);
      
      // Step 2: Push the structured JSON to the validation queue
      await validationQueue.add('validate-casting-call', {
        sourceId: data.sourceId,
        sourceUrl: data.sourceUrl,
        castingCallData: extractionResult.data,
      });
      
      console.log(`✅ Pushed extracted data from ${data.sourceUrl} to the validation queue.`);

      return {
        status: 'pushed_to_validation',
        sourceId: data.sourceId,
      };

    } catch (error) {
      console.error(`❌ Failed to process scraped role from "${data.sourceUrl}":`, error);

      // Send to dead letter queue for manual review
      await dlq.add('failed-scraped-role-extraction', {
        originalJob: data,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date().toISOString(),
      });

      throw error; // Re-throw to mark job as failed
    }
  },
  {
    connection: process.env.REDIS_URL ? {
      url: process.env.REDIS_URL,
    } : {
      host: 'localhost',
      port: 6379,
    },
    concurrency: 2, // Process 2 jobs concurrently
    limiter: {
      max: 10, // Maximum 10 jobs
      duration: 1000, // per 1 second
    },
  }
);

// Event handlers
scrapedRoleWorker.on('completed', (job) => {
  console.log(`✅ Scraped role job ${job.id} completed successfully`);
});

scrapedRoleWorker.on('failed', (job, err) => {
  const jobId = typeof job === 'string' ? job : (job as any)?.id;
  console.error(`❌ Scraped role job ${jobId} failed:`, err.message);
});

scrapedRoleWorker.on('stalled', (job) => {
  const jobId = typeof job === 'string' ? job : (job as any)?.id;
  console.warn(`⚠️ Scraped role job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down scraped role worker...');
  await scrapedRoleWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down scraped role worker...');
  await scrapedRoleWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🎬 Scraped Role Worker started - listening for casting call processing jobs');

export default scrapedRoleWorker;
