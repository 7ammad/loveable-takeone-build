/**
 * Direct Webhook Configuration
 * Uses the correct Whapi.Cloud API endpoints
 */

import 'dotenv/config';
import axios from 'axios';

async function configureWebhook() {
  console.log('🎣 Configuring WhatsApp Webhook\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const WHAPI_URL = process.env.WHAPI_CLOUD_URL;
    const WHAPI_TOKEN = process.env.WHAPI_CLOUD_TOKEN;
    const WEBHOOK_URL = 'https://requestbin.whapi.cloud/16n587e1';

    if (!WHAPI_URL || !WHAPI_TOKEN) {
      console.error('❌ Missing WHAPI_CLOUD_URL or WHAPI_CLOUD_TOKEN in .env');
      process.exit(1);
    }

    console.log('✅ Whapi credentials found');
    console.log(`✅ Webhook URL: ${WEBHOOK_URL}\n`);

    // Try different webhook configuration endpoints
    const endpoints = [
      '/settings/webhook',
      '/webhook',
      '/channel/webhook',
      '/settings',
      '/webhooks'
    ];

    console.log('🔍 Testing webhook endpoints...\n');

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        
        // Try GET first to see if endpoint exists
        const getResponse = await axios.get(`${WHAPI_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${WHAPI_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ GET ${endpoint} - Success!`);
        console.log('   Response:', JSON.stringify(getResponse.data, null, 2));
        
        // Try POST/PATCH to configure webhook
        const webhookConfig = {
          url: WEBHOOK_URL,
          events: ['message', 'messages.upsert'],
          mode: 'body'
        };

        try {
          const postResponse = await axios.post(`${WHAPI_URL}${endpoint}`, webhookConfig, {
            headers: {
              'Authorization': `Bearer ${WHAPI_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ POST ${endpoint} - Webhook configured!`);
          console.log('   Response:', JSON.stringify(postResponse.data, null, 2));
          break;
        } catch (postError: any) {
          console.log(`⚠️  POST ${endpoint} - ${postError.response?.status || postError.message}`);
        }

        try {
          const patchResponse = await axios.patch(`${WHAPI_URL}${endpoint}`, webhookConfig, {
            headers: {
              'Authorization': `Bearer ${WHAPI_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ PATCH ${endpoint} - Webhook configured!`);
          console.log('   Response:', JSON.stringify(patchResponse.data, null, 2));
          break;
        } catch (patchError: any) {
          console.log(`⚠️  PATCH ${endpoint} - ${patchError.response?.status || patchError.message}`);
        }

      } catch (error: any) {
        console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
      }
      
      console.log('');
    }

    // Try alternative approach - check channel settings
    console.log('🔍 Checking channel settings...\n');
    
    try {
      const channelResponse = await axios.get(`${WHAPI_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${WHAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Channel settings found:');
      console.log(JSON.stringify(channelResponse.data, null, 2));
      
      // Look for webhook configuration in settings
      if (channelResponse.data.webhook) {
        console.log('\n🎯 Found existing webhook config!');
        console.log('   Current:', JSON.stringify(channelResponse.data.webhook, null, 2));
      }
      
    } catch (error: any) {
      console.log('❌ Could not fetch channel settings:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Next Steps:\n');
    console.log('1. Check the Whapi dashboard for webhook configuration');
    console.log('2. Look for "Webhook" or "Settings" section');
    console.log('3. Manually set webhook URL to:', WEBHOOK_URL);
    console.log('4. Test by sending a message to one of your groups');
    console.log('5. Check the debugger URL for incoming data\n');

    console.log('🎯 Your webhook URL is ready:');
    console.log(`   ${WEBHOOK_URL}\n`);

    console.log('💡 Alternative: Use the Whapi dashboard to configure webhook manually');

  } catch (error: any) {
    console.error('\n❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

configureWebhook();
