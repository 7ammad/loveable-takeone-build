/**
 * Check ProcessedMessage table to see what WhatsApp messages have been processed
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';

async function checkProcessedMessages() {
  console.log('🔍 Checking ProcessedMessage table...\n');
  
  try {
    const processed = await prisma.processedMessage.findMany({
      orderBy: { processedAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 Total processed messages: ${processed.length}`);
    
    if (processed.length > 0) {
      console.log('\nRecent processed messages:');
      processed.forEach((msg, i) => {
        console.log(`${i + 1}. ${msg.whatsappMessageId} - ${msg.processedAt.toISOString()}`);
      });
    } else {
      console.log('\n❌ No messages have been processed yet');
    }
    
  } catch (error) {
    console.error('❌ Error checking processed messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProcessedMessages();
