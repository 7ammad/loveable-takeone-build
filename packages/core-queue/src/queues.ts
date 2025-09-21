import { Queue } from 'bullmq';

// Use a proper Redis TCP URL for BullMQ (e.g., rediss://:password@host:port)
const redisUrlString = process.env.REDIS_URL || '';
if (!redisUrlString) {
  throw new Error('REDIS_URL is not set. Provide a TCP Redis URL (e.g., rediss://:password@host:port).');
}
const redisUrl = new URL(redisUrlString);

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
};

export const mediaQueue = new Queue('media', { connection });
export const emailQueue = new Queue('email', { connection });
export const smsQueue = new Queue('sms', { connection });
