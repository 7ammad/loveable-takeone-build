/**
 * Configure Whapi.Cloud Webhook
 * Sets up real-time webhook for instant WhatsApp message processing
 */

import axios from 'axios';
import { logger } from '@packages/core-observability';
import * as dotenv from 'dotenv';

dotenv.config();

interface WebhookConfig {
  url: string;
  events: string[];
  mode: 'body' | 'headers';
}

async function configureWebhook() {
  const WHAPI_URL = process.env.WHAPI_CLOUD_URL;
  const WHAPI_TOKEN = process.env.WHAPI_CLOUD_TOKEN;
  const WEBHOOK_URL = process.env.WHAPI_WEBHOOK_URL; // e.g., https://your-domain.com/api/v1/webhooks/whapi
  const WEBHOOK_SECRET = process.env.WHAPI_WEBHOOK_SECRET;

  if (!WHAPI_URL || !WHAPI_TOKEN) {
    console.error('❌ Missing WHAPI_CLOUD_URL or WHAPI_CLOUD_TOKEN');
    process.exit(1);
  }

  if (!WEBHOOK_URL) {
    console.error('❌ Missing WHAPI_WEBHOOK_URL');
    console.log('\n📋 Please add to your .env file:');
    console.log('WHAPI_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/whapi');
    console.log('WHAPI_WEBHOOK_SECRET=your-secret-key-here (optional but recommended)');
    process.exit(1);
  }

  try {
    console.log('🔧 Configuring Whapi.Cloud webhook...');
    console.log(`   Webhook URL: ${WEBHOOK_URL}`);

    // 1. Check current webhook configuration
    console.log('\n1️⃣  Checking current webhook configuration...');
    const currentConfig = await axios.get(`${WHAPI_URL}/settings/webhook`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   Current webhook:', JSON.stringify(currentConfig.data, null, 2));

    // 2. Set new webhook configuration
    console.log('\n2️⃣  Setting new webhook configuration...');
    
    const webhookConfig: WebhookConfig = {
      url: WEBHOOK_URL,
      events: [
        'message',           // New messages
        'messages.upsert',   // Message updates
      ],
      mode: 'body'          // Send full message body
    };

    const response = await axios.patch(
      `${WHAPI_URL}/settings/webhook`,
      webhookConfig,
      {
        headers: {
          'Authorization': `Bearer ${WHAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Webhook configured successfully!');
    console.log('   Response:', JSON.stringify(response.data, null, 2));

    // 3. Test webhook
    console.log('\n3️⃣  Testing webhook endpoint...');
    try {
      const testResponse = await axios.get(WEBHOOK_URL);
      console.log('✅ Webhook endpoint is accessible');
      console.log('   Response:', testResponse.data);
    } catch (error: any) {
      console.log('⚠️  Could not access webhook endpoint publicly');
      console.log('   This is normal for local development');
      console.log('   Make sure your webhook is accessible from the internet in production');
    }

    // 4. Verify configuration
    console.log('\n4️⃣  Verifying webhook configuration...');
    const verifyConfig = await axios.get(`${WHAPI_URL}/settings/webhook`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook verification complete');
    console.log('   Current configuration:', JSON.stringify(verifyConfig.data, null, 2));

    // 5. Print next steps
    console.log('\n📋 Next Steps:');
    console.log('   1. Send a test message to one of your WhatsApp groups');
    console.log('   2. Check your application logs for webhook events');
    console.log('   3. Monitor the validation queue at /admin/validation-queue');
    console.log('   4. Disable the 4-hour polling in background-service.ts (optional)');
    
    if (!WEBHOOK_SECRET) {
      console.log('\n⚠️  Security Recommendation:');
      console.log('   Add WHAPI_WEBHOOK_SECRET to your .env file for signature verification');
      console.log('   Generate a secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    }

    console.log('\n✨ Webhook setup complete! Messages will now be processed in real-time.');

  } catch (error: any) {
    console.error('❌ Failed to configure webhook:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Run configuration
configureWebhook().catch(console.error);

