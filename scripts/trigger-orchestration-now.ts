/**
 * Manually trigger Digital Twin orchestration cycle
 * Runs the full cycle immediately instead of waiting for scheduled time
 */

import { getDigitalTwinService } from '../lib/digital-twin/background-service';

async function main() {
  console.log('🚀 Manually triggering Digital Twin orchestration cycle...\n');
  
  const service = getDigitalTwinService();
  
  if (!service) {
    console.error('❌ Digital Twin service not initialized!');
    console.log('   Make sure the dev server is running.\n');
    process.exit(1);
  }

  try {
    console.log('⏳ Starting orchestration cycle...');
    console.log('   This will scrape all 75 active sources with new filtering.\n');
    
    // Trigger the orchestration cycle
    await service.runOrchestrationCycle();
    
    console.log('\n✅ Orchestration cycle completed!');
    console.log('   Check the terminal logs above for results.\n');
    console.log('📊 To view results:');
    console.log('   1. Check server logs for pre-filter and LLM rejections');
    console.log('   2. Run: pnpm tsx scripts/check-validation-queue.ts');
    console.log('   3. Visit: http://localhost:3000/admin/validation-queue\n');
    
  } catch (error) {
    console.error('❌ Error during orchestration:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('Done.');
    process.exit(0);
  });

