/**
 * Quick Test - Check Validation Queue Status
 * Simple script that doesn't hang - just checks what's in the queue
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';

async function checkPortal() {
  console.log('🔍 Checking Validation Queue Status\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check pending calls in validation queue
    const pendingCalls = await prisma.castingCall.findMany({
      where: {
        status: 'pending_review',
        isAggregated: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        sourceUrl: true,
        createdAt: true
      }
    });

    console.log(`📋 Pending Calls in Validation Queue: ${pendingCalls.length}\n`);

    if (pendingCalls.length > 0) {
      pendingCalls.forEach((call, i) => {
        const sourceType = call.sourceUrl?.includes('whatsapp') ? '📱 WhatsApp' : 
                          call.sourceUrl?.includes('instagram') ? '📸 Instagram' : 
                          '🌐 Web';
        
        console.log(`${i + 1}. ${sourceType}`);
        console.log(`   Title: ${call.title}`);
        console.log(`   Company: ${call.company || 'N/A'}`);
        console.log(`   Location: ${call.location || 'N/A'}`);
        console.log(`   Created: ${new Date(call.createdAt).toLocaleString()}`);
        console.log(`   ID: ${call.id}`);
        console.log('');
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Calls are ready for review at: /admin/validation-queue');
    } else {
      console.log('ℹ️  No pending calls in validation queue');
      console.log('\nTo populate the queue:');
      console.log('1. Ensure workers are running: npx tsx scripts/process-queue-jobs.ts');
      console.log('2. Run orchestration: npx tsx lib/digital-twin/orchestrators/whatsapp-orchestrator.ts');
      console.log('3. Or send a test message to your WhatsApp group');
    }

    // Check approved calls
    console.log('\n📊 Other Statistics:\n');
    
    const [openCalls, rejectedCalls, processedMessages, activeSources] = await Promise.all([
      prisma.castingCall.count({ where: { status: 'open' } }),
      prisma.castingCall.count({ where: { status: 'rejected' } }),
      prisma.processedMessage.count(),
      prisma.ingestionSource.count({ where: { isActive: true, sourceType: 'WHATSAPP' } })
    ]);

    console.log(`   Open Calls (Published): ${openCalls}`);
    console.log(`   Rejected Calls: ${rejectedCalls}`);
    console.log(`   Messages Processed: ${processedMessages}`);
    console.log(`   Active WhatsApp Sources: ${activeSources}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Admin Portal URLs:\n');
    console.log('   Validation Queue: http://localhost:3000/admin/validation-queue');
    console.log('   Usage & Costs: http://localhost:3000/admin/usage-metrics');
    console.log('   Main Dashboard: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkPortal();

