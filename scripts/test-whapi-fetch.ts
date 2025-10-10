/**
 * Test fetching messages from WhatsApp groups
 * Verifies Whapi integration is working before full orchestration
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '../packages/core-db/src/client';

async function testWhapiFetch() {
  console.log('🧪 Testing Whapi Message Fetching...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Initialize service
    const whapiService = new WhapiService();
    console.log('✅ WhapiService initialized\n');

    // Get first WhatsApp source from database
    const source = await prisma.ingestionSource.findFirst({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    if (!source) {
      console.error('❌ No active WhatsApp sources found in database');
      console.log('\n💡 Run: npx tsx scripts/import-whatsapp-groups.ts first\n');
      process.exit(1);
    }

    console.log(`📱 Testing with group: ${source.sourceName}`);
    console.log(`   Group ID: ${source.sourceIdentifier}\n`);

    // Fetch messages
    console.log('🔄 Fetching last 10 messages...\n');
    const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 10);

    if (messages.length === 0) {
      console.log('⚠️  No messages found in this group');
      console.log('   This could mean:');
      console.log('   1. Group is empty or has no recent messages');
      console.log('   2. WhatsApp connection needs refresh\n');
      return;
    }

    console.log(`✅ Fetched ${messages.length} message(s)\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display messages
    messages.forEach((msg, index) => {
      const date = new Date(msg.timestamp * 1000);
      const text = whapiService.extractTextFromMessage(msg);
      const isRecent = whapiService.isMessageRecent(msg, 7);

      console.log(`${index + 1}. Message from ${date.toLocaleString()}`);
      console.log(`   ID: ${msg.id}`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Recent (< 7 days): ${isRecent ? '✅ YES' : '❌ NO'}`);
      console.log(`   Content: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Analysis
    const recentMessages = messages.filter(m => whapiService.isMessageRecent(m, 7));
    const textMessages = messages.filter(m => {
      const text = whapiService.extractTextFromMessage(m);
      return text && text.length >= 30;
    });

    console.log('📊 ANALYSIS:\n');
    console.log(`   Total messages: ${messages.length}`);
    console.log(`   Recent (< 7 days): ${recentMessages.length}`);
    console.log(`   With text (>30 chars): ${textMessages.length}`);
    console.log(`   Would be queued for processing: ${textMessages.filter(m => whapiService.isMessageRecent(m, 7)).length}\n`);

    console.log('✅ Whapi integration is working!\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Run full WhatsApp orchestration');
    console.log('   2. Monitor pre-filter and LLM processing');
    console.log('   3. Check validation queue for extracted casting calls\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Details: ${JSON.stringify(error.response.data, null, 2)}\n`);
    }
    
    process.exit(1);
  }
}

testWhapiFetch()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

