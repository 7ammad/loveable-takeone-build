/**
 * Test Webhook Endpoint
 * Simulates a Whapi.Cloud webhook payload for testing
 */

import axios from 'axios';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// Sample casting call message in Arabic (real format from Saudi groups)
const sampleCastingCall = `🎬 كاستنج مفتوح

نحتاج فيه:
1- ممثلين سعوديين (ذكور)
   العمر: 25-35 سنة
   الطول: 175 سم وأكثر

2- ممثلات سعوديات
   العمر: 22-30 سنة

📍 الموقع: الرياض
💰 التصوير مدفوع
📅 آخر موعد للتقديم: ٢٥ ديسمبر

للتواصل: تابعونا على السناب
Snapchat: castingsa

#كاستنج #ممثلين #الرياض`;

// Sample non-casting message (should be filtered out)
const sampleNonCasting = `مبروك للمشتركين في مشروع "الطريق" 🎉
التصوير انتهى بنجاح والعمل بينزل قريباً في جميع المنصات!`;

interface TestWebhookPayload {
  event: string;
  instanceId: string;
  data: {
    id: string;
    type: string;
    timestamp: number;
    from: string;
    chatId: string;
    text: {
      body: string;
    };
  };
}

function createTestPayload(messageText: string, messageId = 'test-message-' + Date.now()): TestWebhookPayload {
  return {
    event: 'message',
    instanceId: 'test-instance',
    data: {
      id: messageId,
      type: 'text',
      timestamp: Math.floor(Date.now() / 1000), // Current time in seconds
      from: '966500000000@s.whatsapp.net',
      chatId: '120363123456789012@g.us', // Group chat format
      text: {
        body: messageText
      }
    }
  };
}

function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function testWebhook() {
  const WEBHOOK_URL = process.env.WHAPI_WEBHOOK_URL || 'http://localhost:3000/api/v1/webhooks/whapi';
  const WEBHOOK_SECRET = process.env.WHAPI_WEBHOOK_SECRET;

  console.log('🧪 Testing Webhook Endpoint');
  console.log('============================');
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

  // Test 1: Health check
  console.log('1️⃣  Testing health check (GET)...');
  try {
    const healthResponse = await axios.get(WEBHOOK_URL);
    console.log('✅ Health check passed');
    console.log('   Response:', healthResponse.data);
  } catch (error: any) {
    console.log('⚠️  Health check failed:', error.message);
  }

  // Test 2: Valid casting call message
  console.log('\n2️⃣  Testing valid casting call message...');
  try {
    const castingPayload = createTestPayload(sampleCastingCall);
    const castingBody = JSON.stringify(castingPayload);
    
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (WEBHOOK_SECRET) {
      headers['x-webhook-signature'] = generateSignature(castingBody, WEBHOOK_SECRET);
    }

    const response = await axios.post(WEBHOOK_URL, castingBody, { headers });
    
    console.log('✅ Casting call message processed');
    console.log('   Response:', response.data);
    
    if (response.data.queued) {
      console.log('   🎉 Message queued for processing!');
    }
  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }

  // Test 3: Non-casting message (should be filtered)
  console.log('\n3️⃣  Testing non-casting message (should be filtered)...');
  try {
    const nonCastingPayload = createTestPayload(sampleNonCasting, 'test-non-casting-' + Date.now());
    const nonCastingBody = JSON.stringify(nonCastingPayload);
    
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (WEBHOOK_SECRET) {
      headers['x-webhook-signature'] = generateSignature(nonCastingBody, WEBHOOK_SECRET);
    }

    const response = await axios.post(WEBHOOK_URL, nonCastingBody, { headers });
    
    console.log('✅ Non-casting message handled');
    console.log('   Response:', response.data);
    
    if (response.data.skipped) {
      console.log('   ✅ Correctly skipped:', response.data.skipped);
    } else if (response.data.queued) {
      console.log('   ⚠️  Message was queued (will be filtered by pre-filter or LLM)');
    }
  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }

  // Test 4: Invalid signature (if secret is set)
  if (WEBHOOK_SECRET) {
    console.log('\n4️⃣  Testing invalid signature (security check)...');
    try {
      const payload = createTestPayload(sampleCastingCall, 'test-invalid-sig-' + Date.now());
      const body = JSON.stringify(payload);
      
      const response = await axios.post(WEBHOOK_URL, body, {
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'invalid-signature-123'
        }
      });
      
      console.log('⚠️  Invalid signature was accepted (should have been rejected)');
      console.log('   Response:', response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid signature correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
  }

  // Test 5: Old message (should be skipped)
  console.log('\n5️⃣  Testing old message (should be skipped)...');
  try {
    const oldPayload = createTestPayload(sampleCastingCall, 'test-old-' + Date.now());
    oldPayload.data.timestamp = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000); // 48 hours ago
    
    const body = JSON.stringify(oldPayload);
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (WEBHOOK_SECRET) {
      headers['x-webhook-signature'] = generateSignature(body, WEBHOOK_SECRET);
    }

    const response = await axios.post(WEBHOOK_URL, body, { headers });
    
    console.log('✅ Old message handled');
    console.log('   Response:', response.data);
    
    if (response.data.skipped === 'old_message') {
      console.log('   ✅ Correctly skipped old message');
    }
  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log('If all tests passed, your webhook is ready for production!');
  console.log('\nNext steps:');
  console.log('1. Configure webhook on Whapi.Cloud: npx tsx scripts/configure-whapi-webhook.ts');
  console.log('2. Send a real message to your WhatsApp group');
  console.log('3. Check validation queue: /admin/validation-queue');
}

// Run tests
testWebhook().catch(console.error);

