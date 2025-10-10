/**
 * Process One Job Synchronously with Full Logging
 * Helps debug why messages aren't making it to validation queue
 */

import 'dotenv/config';
import { scrapedRolesQueue } from '@packages/core-queue';
import { LlmCastingCallExtractionService } from '@packages/core-lib';
import { prisma } from '@packages/core-db/src/client';

async function processOneJob() {
  console.log('🔄 Processing One Job with Full Logging\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get one waiting job
    const jobs = await scrapedRolesQueue.getJobs(['waiting'], 0, 1);

    if (jobs.length === 0) {
      console.log('ℹ️  No jobs waiting in scraped-roles queue\n');
      console.log('Queue a test message first:');
      console.log('   npx tsx scripts/test-with-real-casting-call.ts\n');
      process.exit(0);
    }

    const job = jobs[0];
    console.log(`📦 Processing job: ${job.id}`);
    console.log(`   Name: ${job.name}`);
    console.log(`   Source URL: ${job.data.sourceUrl}\n`);

    const { sourceId, sourceUrl, rawMarkdown } = job.data;

    console.log('1️⃣  Content Preview:\n');
    console.log(`${rawMarkdown.substring(0, 200)}...\n`);

    // Check pre-filter
    console.log('2️⃣  Testing pre-filter...\n');
    
    const lowerContent = rawMarkdown.toLowerCase();
    const hasNahtaj = lowerContent.includes('نحتاج');
    const hasMomathel = lowerContent.includes('ممثل');
    const hasMatlub = lowerContent.includes('مطلوب');
    const hasKasting = lowerContent.includes('كاستنج') || lowerContent.includes('كاستينج');
    
    console.log(`   Has "نحتاج" (we need): ${hasNahtaj}`);
    console.log(`   Has "ممثل" (actor): ${hasMomathel}`);
    console.log(`   Has "مطلوب" (needed): ${hasMatlub}`);
    console.log(`   Has "كاستنج" (casting): ${hasKasting}\n`);

    // Extract with LLM
    console.log('3️⃣  Calling LLM for extraction...\n');
    
    const llmService = new LlmCastingCallExtractionService();
    const result = await llmService.extractCastingCallFromText(rawMarkdown);

    console.log(`   Success: ${result.success}`);
    
    if (!result.success) {
      console.log(`   ❌ Error: ${result.error}\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🔍 Analysis:\n');
      console.log('   The LLM rejected this as not a casting call.');
      console.log('   This might be correct, or the prompt needs adjustment.\n');
      
      // Remove job from queue
      await job.remove();
      console.log('✅ Job removed from queue\n');
      
      process.exit(0);
    }

    console.log(`   ✅ Extraction successful!\n`);
    console.log('   Extracted Data:');
    console.log(`   - Title: ${result.data?.title}`);
    console.log(`   - Company: ${result.data?.company}`);
    console.log(`   - Location: ${result.data?.location}`);
    console.log(`   - Compensation: ${result.data?.compensation}`);
    console.log(`   - Deadline: ${result.data?.deadline}\n`);

    // Create in validation queue (manually)
    console.log('4️⃣  Creating casting call in database...\n');

    const crypto = await import('crypto');
    const contentString = `${result.data!.title}|${result.data!.description || ''}|${result.data!.company || ''}|${result.data!.location || ''}`;
    const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

    const castingCall = await prisma.castingCall.create({
      data: {
        title: result.data!.title,
        description: result.data!.description || null,
        company: result.data!.company || null,
        location: result.data!.location || null,
        compensation: result.data!.compensation || null,
        requirements: result.data!.requirements || null,
        deadline: result.data!.deadline ? new Date(result.data!.deadline) : null,
        contactInfo: result.data!.contactInfo || null,
        contentHash,
        sourceUrl,
        status: 'pending_review',
        isAggregated: true
      }
    });

    console.log(`   ✅ Created casting call: ${castingCall.id}\n`);

    // Remove job from queue
    await job.remove();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 SUCCESS! Casting call created in validation queue!\n');
    console.log('📱 View in admin portal:\n');
    console.log('   http://localhost:3000/admin/validation-queue\n');
    console.log('   You should see:');
    console.log(`   - Title: ${castingCall.title}`);
    console.log(`   - Status: Pending Review\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 1000);
  }
}

processOneJob();

