import { Worker } from 'bullmq';
import { mediaQueue, emailQueue, indexerQueue, billingQueue, alertsQueue, dlq } from '@/packages/core-queue/src/queues';
import { prisma } from '@/packages/core-db/src/client';
import { processOutboxEvent, getPendingOutboxEvents } from '@/packages/core-queue/src/outbox';
import { algoliaSearchProvider } from '@/packages/core-search/src/algolia-adapter';
import { processBillingEvent } from '@/packages/core-payments/src/billing-service';
import { PerceptualHash, cleanupExpiredAssets, shouldArchiveSelfTape } from '@/packages/core-media/src';
import { alertManager, metrics } from '@/packages/core-observability/src/metrics';
import { captureMessage } from '@/packages/core-observability/src/sentry';

console.log('Worker starting...');

/**
 * Check for potential content leaks
 */
async function checkForLeaks(assetId: string, pHash: string) {
  try {
    // Get all other pHash values from the database
    const otherAssets = await prisma.mediaAsset.findMany({
      where: {
        id: { not: assetId },
        pHash: { not: null }
      },
      select: { id: true, pHash: true, userId: true, filename: true }
    });

    const existingHashes = otherAssets.map(asset => asset.pHash!).filter(Boolean);
    
    if (existingHashes.length === 0) {
      return;
    }

    // Check for similar content
    const similarContent = PerceptualHash.findSimilarContent(pHash, existingHashes, 0.8);
    
    if (similarContent.length > 0) {
      console.warn(`Potential leak detected for asset ${assetId}:`, similarContent);
      
      // Queue leak detection notification
      await alertsQueue.add('leak-detected', {
        assetId,
        similarAssets: similarContent.map(item => ({
          hash: item.hash,
          similarity: item.similarity
        }))
      });
    }

  } catch (error) {
    console.error(`Leak detection failed for ${assetId}:`, error);
  }
}

const mediaWorker = new Worker(
  'media',
  async (job) => {
    if (job.name !== 'process_upload') {
      console.log(`Skipping media job ${job.id} of type ${job.name}`);
      return;
    }

    console.log(`Processing media job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);

    const { assetId, s3Key, watermark, contentType } = job.data.data;

    try {
      // 1. Set status to 'processing'
      await prisma.mediaAsset.update({
        where: { id: assetId },
        data: { status: 'processing' },
      });

      // 2. Simulate media processing (e.g., transcoding, thumbnail generation)
      await new Promise(resolve => setTimeout(resolve, 5000));

      let pHash: string | undefined;

      // 3. Compute perceptual hash based on content type
      // In a real scenario, you would download the file from S3 to a temp location to process it
      if (contentType?.startsWith('image/')) {
        pHash = await PerceptualHash.computeImageHash(Buffer.from('dummy-image-data'), 800, 600);
      } else if (contentType?.startsWith('video/')) {
        pHash = await PerceptualHash.computeVideoHash(Buffer.from('dummy-video-data'));
      }

      // 4. Set status to 'ready' and store metadata
      await prisma.mediaAsset.update({
        where: { id: assetId },
        data: {
          status: 'ready',
          pHash,
          watermark, // Store watermark for verification
        },
      });

      // 5. Check for potential leaks if pHash was computed
      if (pHash) {
        await checkForLeaks(assetId, pHash);
      }

      console.log(`Media job ${job.id} completed successfully. pHash: ${pHash}`);
    } catch (error) {
      console.error(`Media processing failed for job ${job.id}:`, error);
      await prisma.mediaAsset.update({
        where: { id: assetId },
        data: { status: 'error' },
      });
      throw error;
    }
  },
  { connection: mediaQueue.opts.connection }
);

const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log(`Processing email job ${job.id} of type ${job.name}`);
    const { to, subject, body } = job.data as { to: string; subject: string; body: string };

    console.log('--- Sending Email ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(body);
    console.log('---------------------');

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`Email job ${job.id} completed successfully.`);
  },
  { connection: emailQueue.opts.connection }
);

// Outbox processor worker
const outboxWorker = new Worker(
  'outbox',
  async (job) => {
    console.log(`Processing outbox job ${job.id}`);

    const events = await getPendingOutboxEvents(10);
    for (const event of events) {
      await processOutboxEvent(event.id, event.eventType as any, event.payload, event.attempts);
    }

    console.log(`Outbox job ${job.id} completed successfully.`);
  },
  { connection: mediaQueue.opts.connection }
);

// Indexer worker
const indexerWorker = new Worker(
  'indexer',
  async (job) => {
    console.log(`Processing indexer job ${job.id} of type ${job.name}`);

    if (job.name === 'TalentProfileCreated' || job.name === 'TalentProfileUpdated') {
      const { id: profileId } = job.data.payload as { id: string };

      if (!profileId) {
        console.error(`Indexer job ${job.id} is missing a profile ID.`);
        return;
      }

      console.log(`Fetching profile ${profileId} for indexing...`);
      const profile = await prisma.talentProfile.findUnique({
        where: { id: profileId },
        // Include any relations needed for the search index
      });

      if (!profile) {
        console.error(`Talent profile with ID ${profileId} not found for indexing.`);
        return;
      }

      await algoliaSearchProvider.indexTalentProfile(profile);
      console.log(`Successfully indexed talent profile ${profile.id}`);

    } else if (job.name === 'index-talent') {
      // This is now legacy, but kept for compatibility.
      // New events should use the outbox pattern.
      const { payload } = job.data;
      console.log(`Indexing talent profile ${payload.id} for user ${payload.userId} (legacy)...`);
      await algoliaSearchProvider.indexTalentProfile(payload);
    }

    console.log(`Indexer job ${job.id} completed successfully.`);
  },
  { connection: indexerQueue.opts.connection }
);

// Billing worker
const billingWorker = new Worker(
  'billing',
  async (job) => {
    console.log(`Processing billing job ${job.id} of type ${job.name}`);

    if (job.name === 'process-billing') {
      const { payload } = job.data;
      await processBillingEvent(payload);
    }

    console.log(`Billing job ${job.id} completed successfully.`);
  },
  { connection: mediaQueue.opts.connection }
);

// Alerts worker
const alertsWorker = new Worker(
  'alerts',
  async (job) => {
    console.log(`Processing alerts job ${job.id} of type ${job.name}`);

    if (job.name === 'application-alert') {
      const { payload } = job.data;
      // Send alerts for new applications
      console.log('Processing application alert:', payload);
    }

    console.log(`Alerts job ${job.id} completed successfully.`);
  },
  { connection: mediaQueue.opts.connection }
);

// DLQ worker
const dlqWorker = new Worker(
  'dlq',
  async (job) => {
    console.log(`Processing DLQ job ${job.id} of type ${job.name}`);

    if (job.name === 'dead-letter') {
      const { originalEventType, payload, error, attemptNumber } = job.data;
      console.error(`Dead letter event: ${originalEventType}`, {
        payload,
        error,
        attemptNumber,
      });
      // Here you could send alerts, log to monitoring, etc.
    }

    console.log(`DLQ job ${job.id} completed successfully.`);
  },
  { connection: mediaQueue.opts.connection }
);

const workers = [mediaWorker, emailWorker, outboxWorker, indexerWorker, billingWorker, alertsWorker, dlqWorker];

workers.forEach(worker => {
  worker.on('completed', (job) => {
    if (!job) return;
    console.log(`${worker.name} job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    const jobId = job?.id ?? 'unknown';
    console.log(`${worker.name} job ${jobId} has failed with ${(err as Error).message}`);
  });
});

// Periodic outbox processing
const OUTBOX_PROCESSING_INTERVAL = 30 * 1000; // 30 seconds

setInterval(async () => {
  try {
    const events = await getPendingOutboxEvents(10);
    if (events.length > 0) {
      console.log(`Found ${events.length} pending outbox events to process`);
      for (const event of events) {
        await processOutboxEvent(event.id, event.eventType as any, event.payload, event.attempts);
      }
    }
  } catch (error) {
    console.error('Error processing outbox events:', error);
  }
}, OUTBOX_PROCESSING_INTERVAL);

console.log(`Outbox processor running every ${OUTBOX_PROCESSING_INTERVAL / 1000} seconds`);

// Periodic media cleanup
const MEDIA_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

setInterval(async () => {
  try {
    console.log('Running media cleanup...');
    const cleanedCount = await cleanupExpiredAssets();
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired media assets`);
    }
  } catch (error) {
    console.error('Error during media cleanup:', error);
  }
}, MEDIA_CLEANUP_INTERVAL);

console.log(`Media cleanup running every ${MEDIA_CLEANUP_INTERVAL / (60 * 60 * 1000)} hours`);

// Periodic alert checking
const ALERT_CHECK_INTERVAL = 60 * 1000; // 1 minute

setInterval(async () => {
  try {
    const triggeredAlerts = alertManager.checkAlerts();
    triggeredAlerts.forEach((alert) => {
      console.error(`🚨 ALERT: ${alert.name} - ${alert.message}`);

      // Send to Sentry
      captureMessage(`Alert triggered: ${alert.name}`, 'warning', {
        alertName: alert.name,
        message: alert.message,
        triggeredAt: new Date(alert.triggeredAt).toISOString(),
      });

      // In production, this could send emails, Slack notifications, etc.
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
}, ALERT_CHECK_INTERVAL);

console.log(`Alert checking running every ${ALERT_CHECK_INTERVAL / 1000} seconds`);

process.on('SIGINT', async () => {
  console.log('Closing workers...');
  await Promise.all(workers.map(w => w.close()));
  console.log('Workers closed.');
  process.exit(0);
});
