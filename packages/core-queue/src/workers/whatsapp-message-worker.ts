import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { scrapedRolesQueue, dlq } from '../queues.js';

const prisma = new PrismaClient();

interface WhatsappMessageJob {
  sourceId: string;
  messageId: string;
  messageText: string;
  senderId: string;
  timestamp: number;
  receivedAt: string;
}

// Create the worker
const whatsappMessageWorker = new Worker(
  'whatsapp-messages', // Corrected queue name
  async (job) => {
    const data: WhatsappMessageJob = job.data;

    try {
      console.log(`💬 Processing raw WhatsApp message ${data.messageId} from source ${data.sourceId}`);

      // The sole purpose of this worker is to forward the raw message content
      // to the same processing queue as the web scraper. This creates a single
      // pipeline for LLM-based data extraction.
      await scrapedRolesQueue.add('process-scraped-role', {
        sourceId: data.sourceId,
        sourceUrl: `whatsapp://${data.senderId}/${data.messageId}`,
        rawMarkdown: data.messageText, // Treat message text as markdown for the next step
        scrapedAt: data.receivedAt,
      });

      console.log(`✅ Forwarded message ${data.messageId} to the scraped-roles queue for extraction.`);

      return {
        status: 'forwarded_for_extraction',
        messageId: data.messageId,
      };

    } catch (error) {
      console.error(`❌ Failed to process WhatsApp message ${data.messageId}:`, error);

      // Send to dead letter queue for manual review
      await dlq.add('failed-whatsapp-message', {
        originalJob: data,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date().toISOString(),
      });

      throw error;
    }
  },
  {
    connection: process.env.REDIS_URL ? {
      url: process.env.REDIS_URL,
    } : {
      host: 'localhost',
      port: 6379,
    },
    concurrency: 5, // Can be higher now as it's just a quick forwarding job
    limiter: {
      max: 100, // 100 jobs
      duration: 1000, // per 1 second
    },
  }
);

// Event handlers
whatsappMessageWorker.on('completed', (job) => {
  console.log(`✅ WhatsApp message job ${job.id} completed successfully`);
});

whatsappMessageWorker.on('failed', (job, err) => {
  const jobId = typeof job === 'string' ? job : (job as any)?.id;
  console.error(`❌ WhatsApp message job ${jobId} failed:`, err.message);
});

whatsappMessageWorker.on('stalled', (job) => {
  const jobId = typeof job === 'string' ? job : (job as any)?.id;
  console.warn(`⚠️ WhatsApp message job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down WhatsApp message worker...');
  await whatsappMessageWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down WhatsApp message worker...');
  await whatsappMessageWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('📱 WhatsApp Message Worker started - listening for message processing jobs');

export default whatsappMessageWorker;
