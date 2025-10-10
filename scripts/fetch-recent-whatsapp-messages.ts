/**
 * Fetch Recent Long WhatsApp Messages
 * Gets the last 50 long messages from WhatsApp groups (likely casting calls)
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '@packages/core-db';

async function fetchRecentLongMessages() {
  console.log('📱 Fetching recent long WhatsApp messages...\n');

  try {
    const whapiService = new WhapiService();

    // Get all active WhatsApp sources
    const sources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      },
      take: 10 // Limit to first 10 groups to avoid rate limiting
    });

    console.log(`📋 Found ${sources.length} active WhatsApp group(s)\n`);

    const allLongMessages: Array<{
      groupName: string;
      groupId: string;
      messageId: string;
      text: string;
      timestamp: Date;
      from: string;
      length: number;
    }> = [];

    // Fetch messages from each group
    for (const source of sources) {
      try {
        console.log(`📱 Fetching from: ${source.sourceName}`);
        
        const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 50);
        
        console.log(`   Found ${messages.length} message(s)`);

        // Filter for long messages (>100 characters - likely casting calls)
        for (const message of messages) {
          const text = whapiService.extractTextFromMessage(message);
          
          if (text && text.length > 100) {
            allLongMessages.push({
              groupName: source.sourceName,
              groupId: source.sourceIdentifier,
              messageId: message.id,
              text: text,
              timestamp: new Date(message.timestamp * 1000),
              from: message.from,
              length: text.length
            });
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to fetch from ${source.sourceName}:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Sort by timestamp (newest first) and take last 50
    const recentMessages = allLongMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    console.log(`\n✅ Found ${recentMessages.length} long messages\n`);
    console.log('─'.repeat(80));

    // Display messages
    recentMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. 📱 ${msg.groupName}`);
      console.log(`   ID: ${msg.messageId}`);
      console.log(`   Time: ${msg.timestamp.toISOString()}`);
      console.log(`   Length: ${msg.length} characters`);
      console.log(`   From: ${msg.from}`);
      console.log(`\n   📝 Text Preview:`);
      console.log(`   ${msg.text.substring(0, 300)}${msg.text.length > 300 ? '...' : ''}`);
      console.log('─'.repeat(80));
    });

    // Check if any were already processed
    console.log(`\n🔍 Checking which messages are already processed...\n`);

    const messageIds = recentMessages.map(m => `whatsapp://group/${m.groupId}/message/${m.messageId}`);
    
    const alreadyProcessed = await prisma.processedMessage.findMany({
      where: {
        messageIdentifier: {
          in: messageIds
        }
      },
      select: {
        messageIdentifier: true
      }
    });

    const processedSet = new Set(alreadyProcessed.map(p => p.messageIdentifier));
    const unprocessed = recentMessages.filter(m => 
      !processedSet.has(`whatsapp://group/${m.groupId}/message/${m.messageId}`)
    );

    console.log(`✅ Already processed: ${alreadyProcessed.length}`);
    console.log(`⚠️  Unprocessed: ${unprocessed.length}\n`);

    if (unprocessed.length > 0) {
      console.log('📋 Unprocessed Messages:\n');
      unprocessed.slice(0, 10).forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.groupName}] ${msg.text.substring(0, 100)}...`);
      });

      console.log(`\n💡 To process these messages, run:`);
      console.log(`   npx tsx scripts/manually-queue-messages.ts`);
    }

    // Save to file for manual review
    const fs = await import('fs');
    const outputPath = 'recent-whatsapp-messages.json';
    fs.writeFileSync(outputPath, JSON.stringify(recentMessages, null, 2));
    console.log(`\n💾 Saved all messages to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchRecentLongMessages();

