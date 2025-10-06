import { Queue } from 'bullmq';

// Graceful Redis connection handling
let connection: any = null;
let queues: any = {};

try {
  // Use a proper Redis TCP URL for BullMQ (e.g., rediss://:password@host:port)
  const redisUrlString = process.env.REDIS_URL || '';
  if (!redisUrlString) {
    throw new Error('REDIS_URL is not set. Provide a TCP Redis URL (e.g., rediss://:password@host:port).');
  }
  const redisUrl = new URL(redisUrlString);

  connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
  };

  // Create queues only if Redis is available
  queues = {
    mediaQueue: new Queue('media', { connection }),
    emailQueue: new Queue('email', { connection }),
    smsQueue: new Queue('sms', { connection }),
    indexerQueue: new Queue('indexer', { connection }),
    billingQueue: new Queue('billing', { connection }),
    alertsQueue: new Queue('alerts', { connection }),
    scrapedRolesQueue: new Queue('scraped-roles', { connection }),
    whatsappMessagesQueue: new Queue('whatsapp-messages', { connection }),
    validationQueue: new Queue('validation-queue', { connection }),
    dlq: new Queue('dlq', { connection })
  };

  console.log('Queue system initialized successfully');
} catch (error) {
  console.warn('Queue system initialization failed:', error);
  // Create mock queues that don't actually work but don't break the app
  queues = {
    mediaQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    emailQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    smsQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    indexerQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    billingQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    alertsQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    scrapedRolesQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    whatsappMessagesQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    validationQueue: { add: () => Promise.resolve(), opts: { connection: null } },
    dlq: { add: () => Promise.resolve(), opts: { connection: null } }
  };
}

export const { mediaQueue, emailQueue, smsQueue, indexerQueue, billingQueue, alertsQueue, scrapedRolesQueue, whatsappMessagesQueue, validationQueue, dlq } = queues;
export { connection as redis };
