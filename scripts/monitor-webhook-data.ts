/**
 * Monitor Webhook Data - Real-time Message Viewer
 * Shows raw Arabic text from all WhatsApp groups for manual review
 */

import 'dotenv/config';
import axios from 'axios';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';

const whapiService = new WhapiService();

async function monitorAllGroups() {
  console.log('📱 WhatsApp Group Monitor - Real-time Data Collection\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get all groups
    console.log('🔍 Fetching all WhatsApp groups...\n');
    const groups = await whapiService.getGroups();
    
    console.log(`✅ Found ${groups.length} groups:\n`);
    groups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name || 'Unnamed'} (${group.id})`);
      console.log(`   Size: ${group.size || 'Unknown'} members`);
      console.log(`   Created: ${group.creation ? new Date(group.creation * 1000).toLocaleDateString() : 'Unknown'}\n`);
    });

    // Fetch recent messages from each group
    console.log('📨 Fetching recent messages from all groups...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      console.log(`\n🎯 GROUP ${i + 1}/${groups.length}: ${group.name || 'Unnamed'}`);
      console.log(`   ID: ${group.id}`);
      console.log('   ' + '─'.repeat(50));

      try {
        // Fetch last 20 messages from this group
        const messages = await whapiService.getGroupMessages(group.id, 20);
        
        if (messages.length === 0) {
          console.log('   📭 No messages found\n');
          continue;
        }

        console.log(`   📨 Found ${messages.length} recent messages:\n`);

        // Show each message
        messages.forEach((message, msgIndex) => {
          const messageDate = new Date(message.timestamp * 1000);
          const text = whapiService.extractTextFromMessage(message);
          
          if (text.trim().length === 0) {
            console.log(`   ${msgIndex + 1}. [${message.type.toUpperCase()}] - No text content`);
            console.log(`      Time: ${messageDate.toLocaleString()}`);
            console.log(`      From: ${message.from}\n`);
            return;
          }

          console.log(`   ${msgIndex + 1}. [${message.type.toUpperCase()}]`);
          console.log(`      Time: ${messageDate.toLocaleString()}`);
          console.log(`      From: ${message.from}`);
          console.log(`      Text: ${text}`);
          console.log('');
        });

        // Small delay between groups to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.log(`   ❌ Error fetching messages: ${error.message}\n`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Review the messages above and identify:');
    console.log('   1. Which messages are REAL casting calls?');
    console.log('   2. What patterns do you see in the Arabic text?');
    console.log('   3. What keywords/phrases indicate casting calls?');
    console.log('   4. What should we filter OUT (non-casting content)?\n');

    console.log('💡 Share your findings and I\'ll update the filters accordingly!');

  } catch (error: any) {
    console.error('\n❌ Error monitoring groups:', error.message);
    process.exit(1);
  }
}

monitorAllGroups();
