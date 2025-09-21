import { Worker } from 'bullmq';
import { mediaQueue, emailQueue } from '@/packages/core-queue/src/queues';
import { prisma } from '@/packages/core-db/src/client';

console.log('Worker starting...');

const mediaWorker = new Worker(
  'media',
  async (job) => {
    console.log(`Processing media job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);

    const { assetId } = job.data;

    await new Promise(resolve => setTimeout(resolve, 5000));

    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: { status: 'ready', pHash: 'dummy-phash-value' },
    });

    console.log(`Media job ${job.id} completed successfully.`);
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

const workers = [mediaWorker, emailWorker];

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

process.on('SIGINT', async () => {
  console.log('Closing workers...');
  await Promise.all(workers.map(w => w.close()));
  console.log('Workers closed.');
  process.exit(0);
});
