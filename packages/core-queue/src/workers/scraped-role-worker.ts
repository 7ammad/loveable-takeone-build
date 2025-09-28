import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { dlq } from '../queues.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface ScrapedRoleJob {
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
  sourceUrl: string;
  sourceName: string;
  ingestedAt: string;
}

// Create the worker
const scrapedRoleWorker = new Worker(
  'process-scraped-role',
  async (job) => {
    const data: ScrapedRoleJob = job.data;

    try {
      console.log(`Processing scraped role: ${data.title} from ${data.sourceName}`);

      // Create content hash for deduplication
      const contentString = `${data.title}|${data.description || ''}|${data.company || ''}|${data.location || ''}`;
      const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

      // Check for duplicates
      const existingCall = await prisma.castingCall.findUnique({
        where: { contentHash },
      });

      if (existingCall) {
        console.log(`Duplicate casting call detected: ${data.title} (hash: ${contentHash})`);
        return { status: 'duplicate', existingId: existingCall.id };
      }

      // Parse deadline if provided
      let deadline: Date | undefined;
      if (data.deadline) {
        try {
          deadline = new Date(data.deadline);
          // Validate the date
          if (isNaN(deadline.getTime())) {
            deadline = undefined;
          }
        } catch {
          deadline = undefined;
        }
      }

      // Create the casting call
      const newCastingCall = await prisma.castingCall.create({
        data: {
          title: data.title,
          description: data.description,
          company: data.company,
          location: data.location,
          compensation: data.compensation,
          requirements: data.requirements,
          deadline,
          contactInfo: data.contactInfo,
          sourceUrl: data.sourceUrl,
          contentHash,
          status: 'pending_review', // All scraped calls need admin review
        },
      });

      console.log(`✅ Created casting call: ${newCastingCall.title} (ID: ${newCastingCall.id})`);

      // TODO: Trigger indexing in search system (Algolia)
      // This would be implemented once we have the search indexing system

      return {
        status: 'created',
        castingCallId: newCastingCall.id,
        title: newCastingCall.title
      };

    } catch (error) {
      console.error(`❌ Failed to process scraped role "${data.title}":`, error);

      // Send to dead letter queue for manual review
      await dlq.add('failed-scraped-role', {
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
    } : undefined,
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
  console.error(`❌ Scraped role job ${job?.id} failed:`, err.message);
});

scrapedRoleWorker.on('stalled', (job) => {
  console.warn(`⚠️ Scraped role job ${job?.id} stalled`);
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
