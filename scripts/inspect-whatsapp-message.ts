/**
 * Inspect a single WhatsApp message to see full structure
 */

import 'dotenv/config';
import axios from 'axios';

async function inspectMessage() {
  const whapiToken = process.env.WHAPI_CLOUD_TOKEN;
  const whapiUrl = (process.env.WHAPI_CLOUD_URL || 'https://gate.whapi.cloud').replace(/\/$/, '');

  const groupId = '120363321492808704@g.us'; // Actors & Actresses

  try {
    console.log('🔍 Fetching messages from Actors & Actresses group...\n');

    const response = await axios.get(`${whapiUrl}/messages/list`, {
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        chat_id: groupId,
        count: 5
      }
    });

    console.log('📊 API Response Structure:\n');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

inspectMessage();

