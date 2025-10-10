/**
 * Test Whapi Message Fetching
 * Tests fetching messages from a specific group
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';

async function testMessageFetching() {
  console.log('🧪 Testing Whapi Message Fetching...\n');

  try {
    const whapiService = new WhapiService();

    // Test with the first group from your database
    const testGroupId = '120363316435315571@g.us'; // 🎭 Talents & Auditions
    const testGroupName = '🎭 Talents & Auditions';

    console.log(`📱 Attempting to fetch messages from: ${testGroupName}`);
    console.log(`   Group ID: ${testGroupId}\n`);

    const messages = await whapiService.getGroupMessages(testGroupId, 10);

    console.log(`✅ Success! Fetched ${messages.length} message(s)\n`);

    if (messages.length > 0) {
      console.log('📬 Sample Messages:');
      console.log('─'.repeat(80));
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`\nMessage ${index + 1}:`);
        console.log(`  ID: ${msg.id}`);
        console.log(`  Type: ${msg.type}`);
        console.log(`  From: ${msg.from}`);
        console.log(`  Timestamp: ${new Date(msg.timestamp * 1000).toISOString()}`);
        
        const text = whapiService.extractTextFromMessage(msg);
        if (text) {
          console.log(`  Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        }
      });
    } else {
      console.log('ℹ️  No messages found in this group');
      console.log('   This could mean:');
      console.log('   - The group has no messages');
      console.log('   - The messages are too old');
      console.log('   - The bot joined recently and can only see new messages');
    }

  } catch (error: any) {
    console.error('\n❌ Message fetching failed!\n');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('\nAPI Response:');
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.message.includes('404')) {
      console.log('\n💡 Possible fixes for 404 "Channel not found":');
      console.log('   1. Check if your Whapi channel/session is properly connected');
      console.log('   2. Go to https://whapi.cloud/ and verify the session status');
      console.log('   3. Try reconnecting your WhatsApp account');
      console.log('   4. The endpoint might have changed - check Whapi API docs');
      console.log('   5. Make sure you have the correct API version/plan');
    }
  }
}

testMessageFetching();

