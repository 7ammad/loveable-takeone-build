/**
 * Inspect BullMQ queue jobs to see what was processed
 */

import 'dotenv/config';
import { Queue } from 'bullmq';

async function main() {
  const redisUrl = new URL(process.env.REDIS_URL || '');
  const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    password: redisUrl.password || undefined,
    tls: redisUrl.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
  };

  const scrapedRolesQueue = new Queue('scraped-roles', { connection });

  console.log('🔍 Checking BullMQ Queue Jobs...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const completed = await scrapedRolesQueue.getCompleted(0, 19);
    const failed = await scrapedRolesQueue.getFailed(0, 19);
    const waiting = await scrapedRolesQueue.getWaiting(0, 19);

    console.log(`📊 Queue Status:`);
    console.log(`   ✅ Completed: ${completed.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏳ Waiting: ${waiting.length}\n`);

    if (completed.length > 0) {
      console.log(`\n✅ COMPLETED JOBS (Last ${Math.min(completed.length, 10)}):\n`);
      
      for (const job of completed.slice(0, 10)) {
        const data = job.data;
        const returnValue = job.returnvalue || {};
        
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`\nJob ID: ${job.id}`);
        console.log(`Source: ${data.sourceUrl || 'N/A'}`);
        console.log(`Status: ${returnValue.status || 'unknown'}\n`);
        
        if (data.rawMarkdown) {
          console.log(`CONTENT (first 600 chars):`);
          console.log(`${'-'.repeat(50)}`);
          console.log(data.rawMarkdown.substring(0, 600));
          if (data.rawMarkdown.length > 600) {
            console.log(`\n... (${data.rawMarkdown.length - 600} more chars)`);
          }
          
          // Quick analysis
          const text = data.rawMarkdown.toLowerCase();
          const hasMatlub = text.includes('مطلوب');
          const hasTaqdem = text.includes('تقديم') || text.includes('للتقديم');
          const hasCasting = text.includes('casting') || text.includes('كاستنج');
          
          console.log(`\n🔍 Quick Analysis:`);
          console.log(`   مطلوب: ${hasMatlub ? '✅' : '❌'} | تقديم: ${hasTaqdem ? '✅' : '❌'} | casting: ${hasCasting ? '✅' : '❌'}`);
        }
        console.log('');
      }
    }

    if (failed.length > 0) {
      console.log(`\n❌ FAILED JOBS (Last ${Math.min(failed.length, 5)}):\n`);
      
      for (const job of failed.slice(0, 5)) {
        console.log(`Job ID: ${job.id}`);
        console.log(`Source: ${job.data.sourceUrl || 'N/A'}`);
        console.log(`Error: ${job.failedReason?.substring(0, 200)}\n`);
      }
    }

    await scrapedRolesQueue.close();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));

