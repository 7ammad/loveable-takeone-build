/**
 * Direct orchestration trigger - doesn't require service singleton
 * Runs orchestration cycle independently
 */

import { WebOrchestrator } from '../lib/digital-twin/orchestrators/web-orchestrator';
import { InstagramOrchestrator } from '../lib/digital-twin/orchestrators/instagram-orchestrator';
import { logger } from '@packages/core-observability';

async function main() {
  console.log('🚀 Starting Manual Digital Twin Orchestration Cycle\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const startTime = Date.now();

  try {
    // 1. Run Web Orchestrator
    console.log('🌐 Phase 1: Web Sources (14 platforms)');
    console.log('   Processing casting websites...\n');
    const webOrchestrator = new WebOrchestrator();
    await webOrchestrator.run();
    console.log('\n✅ Web orchestration complete\n');

    // 2. Run Instagram Orchestrator
    console.log('📸 Phase 2: Instagram Sources (61 accounts, 18 agencies)');
    console.log('   Processing Instagram posts with NEW filtering...\n');
    const instagramOrchestrator = new InstagramOrchestrator();
    await instagramOrchestrator.run();
    console.log('\n✅ Instagram orchestration complete\n');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Orchestration Cycle Complete! (${duration}s)\n`);
    console.log('📊 NEXT STEPS:\n');
    console.log('1. Check logs above for:');
    console.log('   - "⏭️  Skipped (not casting content)" = Pre-filter working');
    console.log('   - "⏭️  LLM rejected: [reason]" = LLM validation working');
    console.log('   - "✅ Created casting call: [title]" = Success!\n');
    console.log('2. View validation queue:');
    console.log('   pnpm tsx scripts/check-validation-queue.ts\n');
    console.log('3. Admin panel:');
    console.log('   http://localhost:3000/admin/validation-queue\n');

  } catch (error) {
    console.error('\n❌ Orchestration failed:', error);
    logger.error('Manual orchestration failed', { error });
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    setTimeout(() => process.exit(0), 1000);
  });

