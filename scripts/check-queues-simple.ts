/**
 * Simple Queue Check - No hanging
 */

import 'dotenv/config';
import { scrapedRolesQueue, validationQueue, dlq } from '@packages/core-queue';

async function checkQueues() {
  console.log('📊 Checking Queue Status\n');

  try {
    const [scrapedWaiting, validationWaiting, dlqWaiting] = await Promise.all([
      scrapedRolesQueue.getWaitingCount(),
      validationQueue.getWaitingCount(),
      dlq.getWaitingCount()
    ]);

    console.log(`📦 Scraped Roles Queue: ${scrapedWaiting} waiting`);
    console.log(`✅ Validation Queue: ${validationWaiting} waiting`);
    console.log(`❌ Dead Letter Queue: ${dlqWaiting} failed\n`);

    if (scrapedWaiting > 0 || validationWaiting > 0) {
      console.log('🔄 Jobs waiting! Start workers with:');
      console.log('   npx tsx scripts/process-queue-jobs.ts\n');
    } else if (dlqWaiting > 0) {
      console.log('⚠️  Failed jobs detected in DLQ');
    } else {
      console.log('✅ All queues empty - everything processed!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkQueues();

