/**
 * Setup Webhook - Complete Configuration
 * Configures Whapi.Cloud webhook for real-time message processing
 */

import 'dotenv/config';
import axios from 'axios';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupWebhook() {
  console.log('🎣 WhatsApp Webhook Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const WHAPI_URL = process.env.WHAPI_CLOUD_URL;
    const WHAPI_TOKEN = process.env.WHAPI_CLOUD_TOKEN;

    if (!WHAPI_URL || !WHAPI_TOKEN) {
      console.error('❌ Missing WHAPI_CLOUD_URL or WHAPI_CLOUD_TOKEN in .env');
      process.exit(1);
    }

    console.log('✅ Whapi credentials found\n');

    // Step 1: Choose webhook URL
    console.log('1️⃣  Webhook URL Configuration\n');
    console.log('For local testing with ngrok:');
    console.log('   a) Install ngrok: npm install -g ngrok');
    console.log('   b) Run: ngrok http 3000');
    console.log('   c) Copy the https URL (e.g., https://abc123.ngrok.io)');
    console.log('   d) Webhook URL: https://abc123.ngrok.io/api/v1/webhooks/whapi\n');
    
    console.log('For production (recommended):');
    console.log('   a) Deploy to Vercel: vercel --prod');
    console.log('   b) Get your domain (e.g., takeone.vercel.app)');
    console.log('   c) Webhook URL: https://takeone.vercel.app/api/v1/webhooks/whapi\n');

    const webhookUrl = await question('Enter your webhook URL (or press Enter to skip for now): ');

    if (!webhookUrl || webhookUrl.trim() === '') {
      console.log('\n⏭️  Skipping webhook configuration');
      console.log('   Run this script again when you have a public URL\n');
      console.log('📋 To get a public URL:\n');
      console.log('   Option 1 (Local testing):');
      console.log('     npx ngrok http 3000\n');
      console.log('   Option 2 (Production):');
      console.log('     vercel --prod\n');
      rl.close();
      process.exit(0);
    }

    // Validate URL
    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      console.error('\n❌ Invalid URL. Must start with http:// or https://');
      rl.close();
      process.exit(1);
    }

    console.log(`\n✅ Webhook URL: ${webhookUrl}\n`);

    // Step 2: Check current webhook
    console.log('2️⃣  Checking current webhook configuration...\n');

    try {
      const currentConfig = await axios.get(`${WHAPI_URL}/settings/webhook`, {
        headers: {
          'Authorization': `Bearer ${WHAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('   Current webhook:', JSON.stringify(currentConfig.data, null, 2));
      console.log('');
    } catch (error: any) {
      console.log('   No webhook configured yet\n');
    }

    // Step 3: Configure webhook
    console.log('3️⃣  Configuring webhook...\n');

    const webhookConfig = {
      url: webhookUrl,
      events: ['message', 'messages.upsert'],
      mode: 'body'
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

    console.log('✅ Webhook configured successfully!\n');
    console.log('   Response:', JSON.stringify(response.data, null, 2));

    // Step 4: Verify
    console.log('\n4️⃣  Verifying configuration...\n');

    const verifyConfig = await axios.get(`${WHAPI_URL}/settings/webhook`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Verification complete:', JSON.stringify(verifyConfig.data, null, 2));

    // Step 5: Test endpoint
    console.log('\n5️⃣  Testing webhook endpoint...\n');

    try {
      const testResponse = await axios.get(webhookUrl, {
        timeout: 5000
      });
      console.log('✅ Webhook endpoint is accessible!');
      console.log('   Response:', testResponse.data);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️  Webhook endpoint not accessible (server not running)');
        console.log('   Make sure your server is running: npm run dev');
      } else {
        console.log('⚠️  Could not test endpoint:', error.message);
        console.log('   This is normal for production URLs');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Webhook Setup Complete!\n');
    console.log('📋 What happens now:\n');
    console.log('   1. Whapi will send messages to your webhook in real-time');
    console.log('   2. No more polling API calls (saves SAR 37.50/month)');
    console.log('   3. Messages processed in < 30 seconds');
    console.log('   4. Casting calls appear instantly in admin portal\n');

    console.log('🧪 Test it:\n');
    console.log('   1. Send a casting call message to one of your WhatsApp groups');
    console.log('   2. Watch your server logs for: "📱 Webhook received"');
    console.log('   3. Check validation queue: http://localhost:3000/admin/validation-queue');
    console.log('   4. Should appear in < 30 seconds!\n');

    console.log('📊 Monitor:\n');
    console.log('   - Webhook logs: Check your server console');
    console.log('   - Validation queue: /admin/validation-queue');
    console.log('   - Queue status: npx tsx scripts/check-queues-simple.ts\n');

    console.log('💡 Optional: Disable polling to save costs\n');
    console.log('   After 1 week of stable webhook operation, you can disable');
    console.log('   the 4-hour polling in lib/digital-twin/background-service.ts\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    rl.close();
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

setupWebhook();

