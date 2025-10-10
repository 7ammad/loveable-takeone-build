/**
 * Test Fresh Batch of Messages
 * Fetches new messages, processes them, and shows results
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '../packages/core-db/src/client';
import { scrapedRolesQueue } from '@packages/core-queue';

async function testFreshBatch() {
  console.log('🚀 Testing Fresh Message Batch\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const whapiService = new WhapiService();

    // Get one active WhatsApp source
    const source = await prisma.ingestionSource.findFirst({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    if (!source) {
      console.log('❌ No active WhatsApp sources found');
      process.exit(1);
    }

    console.log(`📱 Testing with group: ${source.sourceName}`);
    console.log(`   ID: ${source.sourceIdentifier}\n`);

    // Fetch messages
    console.log('1️⃣  Fetching messages from WhatsApp...\n');
    const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 50);
    
    console.log(`   Found ${messages.length} message(s)\n`);

    // Process messages
    let queued = 0;
    let skippedOld = 0;
    let skippedProcessed = 0;
    let skippedShort = 0;

    console.log('2️⃣  Processing messages...\n');

    for (const message of messages) {
      // Check if recent
      if (!whapiService.isMessageRecent(message, 7)) {
        skippedOld++;
        continue;
      }

      // Check if already processed
      const existing = await prisma.processedMessage.findUnique({
        where: { whatsappMessageId: message.id }
      });

      if (existing) {
        skippedProcessed++;
        continue;
      }

      // Extract text
      const text = whapiService.extractTextFromMessage(message);

      if (!text || text.length < 30) {
        await prisma.processedMessage.create({
          data: {
            whatsappMessageId: message.id,
            sourceId: source.id
          }
        });
        skippedShort++;
        continue;
      }

      // Mark as processed
      await prisma.processedMessage.create({
        data: {
          whatsappMessageId: message.id,
          sourceId: source.id
        }
      });

      // Queue for processing
      await scrapedRolesQueue.add('whatsapp-message', {
        sourceId: source.id,
        sourceUrl: `whatsapp://group/${source.sourceIdentifier}/message/${message.id}`,
        rawMarkdown: text,
        scrapedAt: new Date(message.timestamp * 1000).toISOString()
      });

      console.log(`   ✅ Queued message: "${text.substring(0, 60)}..."`);
      queued++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Results:\n');
    console.log(`   Total messages: ${messages.length}`);
    console.log(`   Queued for processing: ${queued}`);
    console.log(`   Skipped (old): ${skippedOld}`);
    console.log(`   Skipped (already processed): ${skippedProcessed}`);
    console.log(`   Skipped (too short): ${skippedShort}\n`);

    if (queued > 0) {
      console.log('✅ Messages queued! Next steps:\n');
      console.log('   1. Workers will process automatically if running');
      console.log('   2. Or start workers: npx tsx scripts/process-queue-jobs.ts');
      console.log('   3. Wait 30-60 seconds');
      console.log('   4. Check results: npx tsx scripts/quick-test-portal.ts\n');
    } else {
      console.log('ℹ️  No new messages to process\n');
      console.log('   All recent messages already processed.');
      console.log('   Send a new message to your WhatsApp group to test.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    // Give time for queue to add before exit
    setTimeout(() => process.exit(0), 1000);
  }
}

testFreshBatch();

