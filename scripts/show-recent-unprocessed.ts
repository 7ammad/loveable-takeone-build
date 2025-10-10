/**
 * Show Recent Unprocessed Messages
 * Display the actual content to see what's being rejected
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';

async function showUnprocessed() {
  console.log('📋 Recent Unprocessed Messages\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const whapiService = new WhapiService();

    // Get first 3 active sources for quick check
    const sources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      },
      take: 3
    });

    for (const source of sources) {
      console.log(`\n📱 Group: ${source.sourceName}`);
      console.log('─'.repeat(60));

      const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 10);
      
      let shown = 0;
      for (const message of messages) {
        if (shown >= 3) break;

        // Skip old messages
        if (!whapiService.isMessageRecent(message, 7)) continue;

        // Check if already processed
        const existing = await prisma.processedMessage.findUnique({
          where: { whatsappMessageId: message.id }
        });

        if (existing) continue;

        // Extract text
        const text = whapiService.extractTextFromMessage(message);
        if (!text || text.length < 30) continue;

        shown++;
        console.log(`\nMessage ${shown}:`);
        console.log(`Time: ${new Date(message.timestamp * 1000).toLocaleString()}`);
        console.log(`Content:\n${text}\n`);
        console.log('─'.repeat(60));
      }

      if (shown === 0) {
        console.log('\n(All recent messages already processed)\n');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Analysis:\n');
    console.log('If you see casting calls above that should pass,');
    console.log('the pre-filter needs adjustment.\n');
    console.log('If you see non-casting content, the filter is working correctly.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

showUnprocessed();

