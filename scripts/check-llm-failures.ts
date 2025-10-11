/**
 * Check LLM Processing Failures
 * Shows why LLM jobs are failing in the Digital Twin system
 */

import 'dotenv/config';
import { scrapedRolesQueue } from '@packages/core-queue';

async function checkLLMFailures() {
  console.log('🧠 Checking LLM Processing Failures...\n');

  try {
    // Get failed jobs from scraped roles queue (LLM processing)
    const failedJobs = await scrapedRolesQueue.getFailed();
    
    console.log(`❌ Found ${failedJobs.length} failed LLM jobs\n`);

    if (failedJobs.length === 0) {
      console.log('✅ No LLM failures found!');
      return;
    }

    // Show first 10 failed jobs with details
    failedJobs.slice(0, 10).forEach((job: any, index: number) => {
      console.log(`\n${index + 1}. Job ID: ${job.id}`);
      console.log(`   Failed At: ${new Date(job.timestamp).toISOString()}`);
      console.log(`   Attempts: ${job.attemptsMade}/${job.opts.attempts || 3}`);
      
      // Show the error
      if (job.failedReason) {
        console.log(`   Error: ${job.failedReason}`);
      }
      
      // Show job data (truncated)
      const dataStr = JSON.stringify(job.data, null, 2);
      const truncatedData = dataStr.length > 500 ? dataStr.substring(0, 500) + '...' : dataStr;
      console.log(`   Data: ${truncatedData}`);
      
      console.log('─'.repeat(80));
    });

    // Analyze common error patterns
    console.log('\n🔍 Error Pattern Analysis:');
    console.log('─'.repeat(80));
    
    const errorCounts = new Map<string, number>();
    failedJobs.forEach((job: any) => {
      const error = job.failedReason || 'Unknown error';
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });

    // Sort by frequency
    const sortedErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedErrors.forEach(([error, count]) => {
      console.log(`${count}x: ${error}`);
    });

    // Common fixes
    console.log('\n💡 Common LLM Failure Causes & Fixes:');
    console.log('─'.repeat(80));
    
    const hasOpenAIErrors = failedJobs.some((job: any) => 
      job.failedReason?.includes('OpenAI') || 
      job.failedReason?.includes('API') ||
      job.failedReason?.includes('rate limit')
    );
    
    const hasValidationErrors = failedJobs.some((job: any) => 
      job.failedReason?.includes('ZodError') ||
      job.failedReason?.includes('validation')
    );

    const hasTimeoutErrors = failedJobs.some((job: any) => 
      job.failedReason?.includes('timeout') ||
      job.failedReason?.includes('ECONNRESET')
    );

    if (hasOpenAIErrors) {
      console.log('🔑 OpenAI API Issues:');
      console.log('   - Check OPENAI_API_KEY is valid');
      console.log('   - Check API quota/billing');
      console.log('   - Check rate limits');
      console.log('');
    }

    if (hasValidationErrors) {
      console.log('📝 LLM Output Validation Issues:');
      console.log('   - LLM returning invalid JSON structure');
      console.log('   - Missing required fields in response');
      console.log('   - Content not matching CastingCall schema');
      console.log('');
    }

    if (hasTimeoutErrors) {
      console.log('⏱️  Timeout Issues:');
      console.log('   - Network connectivity problems');
      console.log('   - OpenAI API slow responses');
      console.log('   - Increase timeout values');
      console.log('');
    }

    // Retry options
    console.log('🔄 Retry Options:');
    console.log('   1. Retry failed jobs: await scrapedRolesQueue.retryFailed()');
    console.log('   2. Clear failed jobs: await scrapedRolesQueue.clean(0, 100)');
    console.log('   3. Check worker logs for more details');

  } catch (error) {
    console.error('❌ Error checking LLM failures:', error);
  }
}

checkLLMFailures();
