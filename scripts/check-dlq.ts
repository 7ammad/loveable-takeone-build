/**
 * Check Dead Letter Queue
 * See what jobs failed and why
 */

import 'dotenv/config';
import { dlq } from '@packages/core-queue';

async function checkDLQ() {
  console.log('💀 Checking Dead Letter Queue\n');

  try {
    const failedJobs = await dlq.getJobs(['failed', 'completed'], 0, 20);

    console.log(`Found ${failedJobs.length} failed jobs\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const job of failedJobs) {
      console.log(`Job ${job.id}: ${job.name}`);
      console.log(`Timestamp: ${new Date(job.timestamp).toLocaleString()}`);
      console.log(`Data:`, JSON.stringify(job.data, null, 2));
      
      if (job.failedReason) {
        console.log(`❌ Failed Reason: ${job.failedReason}`);
      }
      
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDLQ();

