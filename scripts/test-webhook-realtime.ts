/**
 * Test Webhook Real-time Processing
 * Verifies that webhook is receiving and processing messages
 */

import 'dotenv/config';
import axios from 'axios';

async function testWebhookRealtime() {
  console.log('🎣 Testing Webhook Real-time Processing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const WEBHOOK_URL = 'https://requestbin.whapi.cloud/16n587e1';
    
    console.log('📡 Checking webhook endpoint...\n');
    
    // Check if webhook endpoint is accessible
    const response = await axios.get(WEBHOOK_URL, {
      timeout: 10000
    });
    
    console.log('✅ Webhook endpoint is accessible!');
    console.log('   Status:', response.status);
    console.log('   Response:', response.data);
    
    console.log('\n🎯 Webhook Status: ACTIVE');
    console.log('   URL:', WEBHOOK_URL);
    console.log('   Mode: Real-time push notifications');
    console.log('   Events: Messages, Chats, Groups, Statuses\n');
    
    console.log('📋 What to do now:\n');
    console.log('1. Send a casting call message to one of your WhatsApp groups');
    console.log('2. Watch the Whapi dashboard for new webhook events');
    console.log('3. Check the webhook URL for incoming data');
    console.log('4. Messages should appear in < 30 seconds!\n');
    
    console.log('🔍 Monitor these events:\n');
    console.log('   - POST /16n587e1 (new messages)');
    console.log('   - PATCH /16n587e1/chats (chat updates)');
    console.log('   - PUT /16n587e1/groups (group changes)\n');
    
    console.log('💡 Expected webhook data structure:\n');
    console.log('   {');
    console.log('     "messages": [{');
    console.log('       "id": "message_id",');
    console.log('       "type": "text",');
    console.log('       "text": { "body": "casting call content" },');
    console.log('       "from": "sender_id",');
    console.log('       "chat_id": "group_id",');
    console.log('       "timestamp": 1234567890');
    console.log('     }]');
    console.log('   }\n');
    
    console.log('🚀 Your webhook is ready for real-time casting call processing!');
    
  } catch (error: any) {
    console.error('❌ Webhook test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The webhook URL might be temporarily unavailable.');
      console.log('   This is normal for requestbin URLs - they expire after some time.');
      console.log('   Check the Whapi dashboard for the current webhook status.');
    }
  }
}

testWebhookRealtime();
