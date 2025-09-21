import { Queue } from 'bullmq';

// We reuse the Upstash Redis connection details for BullMQ
const connection = {
  host: process.env.UPSTASH_REDIS_REST_URL!.replace('https://', '').split(':')[0],
  port: parseInt(process.env.UPSTASH_REDIS_REST_URL!.split(':')[1] || '6379'),
  password: process.env.UPSTASH_REDIS_REST_TOKEN!,
  tls: {
    rejectUnauthorized: false
  }
};

export const mediaQueue = new Queue('media', { connection });
