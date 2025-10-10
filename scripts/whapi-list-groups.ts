/**
 * Fetch all WhatsApp groups from Whapi.Cloud
 * This script will list all groups the connected WhatsApp number is a member of
 */

import 'dotenv/config';
import axios from 'axios';

interface WhapiGroup {
  id: string;
  name: string;
  size: number;
  creation: number;
  subject: string;
  subjectTime: number;
  subjectOwner: string;
}

async function listWhapiGroups() {
  console.log('📱 Fetching WhatsApp Groups from Whapi.Cloud...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get credentials from .env
  const whapiToken = process.env.WHAPI_CLOUD_TOKEN || process.env.WHAPI_API_TOKEN;
  const whapiUrl = (process.env.WHAPI_CLOUD_URL || process.env.WHAPI_API_URL || 'https://gate.whapi.cloud').replace(/\/$/, ''); // Remove trailing slash

  if (!whapiToken) {
    console.error('❌ Error: WHAPI_CLOUD_TOKEN not found in .env file');
    console.log('\n💡 Please add to your .env file:');
    console.log('   WHAPI_CLOUD_TOKEN=your_token_here');
    console.log('   WHAPI_CLOUD_URL=https://gate.whapi.cloud (optional)\n');
    process.exit(1);
  }

  console.log('✅ Credentials found');
  console.log(`   API URL: ${whapiUrl}`);
  console.log(`   Token: ${whapiToken.substring(0, 20)}...\n`);

  try {
    // Fetch groups from Whapi.Cloud
    console.log('🔄 Fetching groups...\n');
    
    const response = await axios.get(`${whapiUrl}/groups`, {
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const groups: WhapiGroup[] = response.data.groups || [];

    if (groups.length === 0) {
      console.log('⚠️  No groups found!');
      console.log('\nPossible reasons:');
      console.log('1. WhatsApp number is not in any groups');
      console.log('2. Invalid API token');
      console.log('3. WhatsApp connection not active\n');
      return;
    }

    console.log(`✅ Found ${groups.length} group(s)!\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display groups
    groups.forEach((group, index) => {
      const creationDate = group.creation ? new Date(group.creation * 1000).toLocaleDateString() : 'Unknown';
      
      console.log(`${(index + 1).toString().padStart(2)}. ${group.name || group.subject || 'Unnamed Group'}`);
      console.log(`    Group ID: ${group.id}`);
      console.log(`    Members: ${group.size || 'Unknown'}`);
      console.log(`    Created: ${creationDate}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Suggest which groups might be casting-related
    console.log('🎯 CASTING-RELATED GROUPS (Detected by keywords):\n');
    
    const castingKeywords = [
      'cast', 'casting', 'كاست', 'كاستنج', 'كاستينج',
      'talent', 'actor', 'actress', 'model',
      'فرص', 'تمثيل', 'ممثل', 'ممثلين', 'ممثلات',
      'تصوير', 'إعلان', 'دراما', 'مسلسل', 'فيلم'
    ];

    const castingGroups = groups.filter(group => {
      const name = (group.name || group.subject || '').toLowerCase();
      return castingKeywords.some(keyword => name.includes(keyword.toLowerCase()));
    });

    if (castingGroups.length > 0) {
      castingGroups.forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.name || group.subject}`);
        console.log(`      ID: ${group.id} | Members: ${group.size}`);
      });
      console.log(`\n   Total: ${castingGroups.length} potential casting group(s) ✅\n`);
    } else {
      console.log('   No groups with casting keywords found\n');
      console.log('   💡 You may need to manually review the full list above\n');
    }

    // Export to JSON for easy import
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📄 NEXT STEPS:\n');
    console.log('1. Review the list above');
    console.log('2. Identify which groups post casting calls');
    console.log('3. Run the import script to add them to TakeOne database\n');
    
    // Save to file
    const fs = require('fs');
    const outputPath = './whatsapp-groups.json';
    
    const groupsData = groups.map(g => ({
      groupId: g.id,
      groupName: g.name || g.subject || 'Unnamed Group',
      members: g.size || 0,
      createdAt: g.creation ? new Date(g.creation * 1000).toISOString() : null,
      isPotentiallyCasting: castingKeywords.some(kw => 
        (g.name || g.subject || '').toLowerCase().includes(kw.toLowerCase())
      )
    }));

    fs.writeFileSync(outputPath, JSON.stringify(groupsData, null, 2));
    console.log(`✅ Groups saved to: ${outputPath}`);
    console.log('   You can review and edit this file before importing\n');

  } catch (error: any) {
    console.error('\n❌ Error fetching groups:\n');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.error('\n💡 Authentication failed. Please check:');
        console.error('   1. WHAPI_API_TOKEN is correct');
        console.error('   2. Token has not expired');
        console.error('   3. WhatsApp connection is active in Whapi.Cloud dashboard\n');
      } else if (error.response.status === 404) {
        console.error('\n💡 Endpoint not found. Please check:');
        console.error('   1. WHAPI_API_URL is correct (should be https://gate.whapi.cloud)');
        console.error('   2. Your Whapi.Cloud plan supports group APIs\n');
      }
    } else if (error.request) {
      console.error('   Network error - could not reach Whapi.Cloud');
      console.error('   Please check your internet connection\n');
    } else {
      console.error(`   ${error.message}\n`);
    }
    
    process.exit(1);
  }
}

listWhapiGroups()
  .catch(console.error)
  .finally(() => {
    console.log('Done.\n');
  });

