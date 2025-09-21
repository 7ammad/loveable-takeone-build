import { Worker } from 'bullmq';
import { mediaQueue } from '@/packages/core-queue/src/queues';
import { prisma } from '@/packages/core-db/src/client';

console.log('Worker starting...');

const worker = new Worker(
  'media',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);

    const { assetId, s3Key } = job.data;

    // This is where you would put your media processing logic.
    // For example, calling a transcoding service, a virus scanner,
    // or a perceptual hash generator.

    // 1. Simulate processing
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

    // 2. Update the status of the media asset in the database
    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: { status: 'ready', pHash: 'dummy-phash-value' },
    });

    console.log(`Job ${job.id} completed successfully.`);
  },
  { connection: mediaQueue.opts.connection }
);

worker.on('completed', (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

process.on('SIGINT', () => {
  worker.close();
});
