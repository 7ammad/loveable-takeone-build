/**
 * Check Queue Status and Failed Jobs
 * Shows blocked/unprocessed items in the Digital Twin system
 */

import 'dotenv/config';
import { scrapedRolesQueue, validationQueue, dlq } from '@packages/core-queue';
import { prisma } from '@packages/core-db';

async function checkQueueStatus() {
  console.log('🔍 Checking Queue Status and Failed Jobs...\n');

  try {
    // Check Redis connection first
    console.log('📊 Queue Status:');
    console.log('─'.repeat(80));

    // Scraped Roles Queue (WhatsApp/Instagram messages)
    const scrapedRolesWaiting = await scrapedRolesQueue.getWaiting();
    const scrapedRolesActive = await scrapedRolesQueue.getActive();
    const scrapedRolesCompleted = await scrapedRolesQueue.getCompleted();
    const scrapedRolesFailed = await scrapedRolesQueue.getFailed();

    console.log(`📱 Scraped Roles Queue:`);
    console.log(`   Waiting: ${scrapedRolesWaiting.length}`);
    console.log(`   Active: ${scrapedRolesActive.length}`);
    console.log(`   Completed: ${scrapedRolesCompleted.length}`);
    console.log(`   Failed: ${scrapedRolesFailed.length}`);

    // Validation Queue (LLM processed casting calls)
    const validationWaiting = await validationQueue.getWaiting();
    const validationActive = await validationQueue.getActive();
    const validationCompleted = await validationQueue.getCompleted();
    const validationFailed = await validationQueue.getFailed();

    console.log(`\n✅ Validation Queue:`);
    console.log(`   Waiting: ${validationWaiting.length}`);
    console.log(`   Active: ${validationActive.length}`);
    console.log(`   Completed: ${validationCompleted.length}`);
    console.log(`   Failed: ${validationFailed.length}`);

    // Dead Letter Queue (permanently failed jobs)
    const dlqJobs = await dlq.getFailed();

    console.log(`\n💀 Dead Letter Queue:`);
    console.log(`   Failed Jobs: ${dlqJobs.length}`);

    // Show failed jobs details
    if (scrapedRolesFailed.length > 0) {
      console.log(`\n❌ Failed Scraped Roles Jobs (${scrapedRolesFailed.length}):`);
      console.log('─'.repeat(80));
      scrapedRolesFailed.slice(0, 5).forEach((job: any, index: number) => {
        console.log(`\n${index + 1}. Job ID: ${job.id}`);
        console.log(`   Data: ${JSON.stringify(job.data, null, 2)}`);
        console.log(`   Error: ${job.failedReason}`);
        console.log(`   Failed At: ${job.timestamp}`);
      });
    }

    if (validationFailed.length > 0) {
      console.log(`\n❌ Failed Validation Jobs (${validationFailed.length}):`);
      console.log('─'.repeat(80));
      validationFailed.slice(0, 5).forEach((job: any, index: number) => {
        console.log(`\n${index + 1}. Job ID: ${job.id}`);
        console.log(`   Data: ${JSON.stringify(job.data, null, 2)}`);
        console.log(`   Error: ${job.failedReason}`);
        console.log(`   Failed At: ${job.timestamp}`);
      });
    }

    if (dlqJobs.length > 0) {
      console.log(`\n💀 Dead Letter Queue Jobs (${dlqJobs.length}):`);
      console.log('─'.repeat(80));
      dlqJobs.slice(0, 5).forEach((job: any, index: number) => {
        console.log(`\n${index + 1}. Job ID: ${job.id}`);
        console.log(`   Data: ${JSON.stringify(job.data, null, 2)}`);
        console.log(`   Error: ${job.failedReason}`);
        console.log(`   Failed At: ${job.timestamp}`);
      });
    }

    // Check database casting calls
    console.log(`\n📊 Database Status:`);
    console.log('─'.repeat(80));

    const pendingCalls = await prisma.castingCall.count({
      where: { status: 'pending_review' }
    });

    const approvedCalls = await prisma.castingCall.count({
      where: { status: 'approved' }
    });

    const rejectedCalls = await prisma.castingCall.count({
      where: { status: 'rejected' }
    });

    console.log(`   Pending Review: ${pendingCalls}`);
    console.log(`   Approved: ${approvedCalls}`);
    console.log(`   Rejected: ${rejectedCalls}`);

    // Summary
    const totalBlocked = scrapedRolesWaiting.length + scrapedRolesFailed.length + 
                        validationWaiting.length + validationFailed.length + 
                        dlqJobs.length;

    console.log(`\n🎯 Summary:`);
    console.log('─'.repeat(80));
    
    if (totalBlocked === 0) {
      console.log('✅ No blocked or unprocessed items found!');
    } else {
      console.log(`⚠️  Total blocked/unprocessed items: ${totalBlocked}`);
      console.log(`   - ${scrapedRolesWaiting.length} waiting for LLM processing`);
      console.log(`   - ${scrapedRolesFailed.length} failed LLM jobs`);
      console.log(`   - ${validationWaiting.length} waiting for validation`);
      console.log(`   - ${validationFailed.length} failed validation jobs`);
      console.log(`   - ${dlqJobs.length} permanently failed jobs`);
    }

  } catch (error) {
    console.error('❌ Error checking queue status:', error);
    
    if (error instanceof Error && error.message.includes('REDIS_URL')) {
      console.log('\n💡 Fix: Set REDIS_URL in your .env file');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkQueueStatus();