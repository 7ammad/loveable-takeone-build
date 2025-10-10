/**
 * Test WhatsApp orchestration with ONE group
 * Full end-to-end test without Redis queues (direct processing)
 */

import 'dotenv/config';
import { WhatsAppOrchestrator } from '../lib/digital-twin/orchestrators/whatsapp-orchestrator';
import { prisma } from '../packages/core-db/src/client';

async function testWhatsAppCycle() {
  console.log('🚀 Testing WhatsApp Orchestration (Single Group)\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Temporarily limit to just ONE group for testing
    console.log('1️⃣  Limiting to "Actors & Actresses" group for test...\n');
    
    await prisma.ingestionSource.updateMany({
      where: {
        sourceType: 'WHATSAPP',
        sourceName: { not: 'Actors & Actresses' }
      },
      data: { isActive: false }
    });

    console.log('✅ All other groups temporarily deactivated\n');

    // Run orchestration
    console.log('2️⃣  Running WhatsApp Orchestrator...\n');
    
    const orchestrator = new WhatsAppOrchestrator();
    await orchestrator.run();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Orchestration Complete!\n');
    console.log('📊 Next Steps:\n');
    console.log('   1. Start workers: npx tsx scripts/process-queue-jobs.ts');
    console.log('   2. Wait 60 seconds for processing');
    console.log('   3. Check validation queue: npx tsx scripts/check-validation-queue.ts\n');

    // Re-enable all groups
    await prisma.ingestionSource.updateMany({
      where: { sourceType: 'WHATSAPP' },
      data: { isActive: true }
    });

    console.log('✅ All WhatsApp groups re-enabled\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Re-enable all groups on error
    await prisma.ingestionSource.updateMany({
      where: { sourceType: 'WHATSAPP' },
      data: { isActive: true }
    });
    
    process.exit(1);
  }
}

testWhatsAppCycle()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

