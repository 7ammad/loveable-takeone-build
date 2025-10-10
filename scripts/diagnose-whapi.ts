/**
 * Whapi Connection Diagnostic Tool
 * Checks connection status and lists available groups
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '@packages/core-db';

async function diagnoseWhapiConnection() {
  console.log('🔍 Diagnosing Whapi Connection...\n');

  try {
    const whapiService = new WhapiService();

    // Step 1: Test connection by fetching groups
    console.log('📱 Step 1: Fetching groups from Whapi API...');
    const whapiGroups = await whapiService.getGroups();
    
    console.log(`✅ Connected! Found ${whapiGroups.length} accessible group(s)\n`);

    if (whapiGroups.length === 0) {
      console.log('⚠️  No groups found. This could mean:');
      console.log('   1. The WhatsApp number is not in any groups');
      console.log('   2. The Whapi session is disconnected');
      console.log('   3. The API token is invalid\n');
      console.log('👉 Check your Whapi dashboard: https://whapi.cloud/');
      return;
    }

    console.log('📋 Available Groups from Whapi:');
    console.log('─'.repeat(80));
    whapiGroups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name || group.subject || 'Unknown'}`);
      console.log(`   ID: ${group.id}`);
      console.log(`   Members: ${group.size || 'Unknown'}`);
      console.log('');
    });

    // Step 2: Compare with database
    console.log('\n📊 Step 2: Comparing with database...');
    const dbSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    console.log(`Database has ${dbSources.length} active WhatsApp source(s)\n`);

    if (dbSources.length === 0) {
      console.log('⚠️  No WhatsApp sources in database');
      console.log('💡 Run the sync script to add groups to the database');
      return;
    }

    // Check which DB groups are accessible
    const whapiGroupIds = new Set(whapiGroups.map(g => g.id));
    const accessible: any[] = [];
    const notAccessible: any[] = [];

    dbSources.forEach(source => {
      if (whapiGroupIds.has(source.sourceIdentifier)) {
        accessible.push(source);
      } else {
        notAccessible.push(source);
      }
    });

    console.log('✅ Accessible Groups (in both Whapi & DB):');
    console.log('─'.repeat(80));
    if (accessible.length === 0) {
      console.log('   None - No overlap between Whapi groups and database!\n');
    } else {
      accessible.forEach(source => {
        const whapiGroup = whapiGroups.find(g => g.id === source.sourceIdentifier);
        console.log(`   ✓ ${source.sourceName}`);
        console.log(`     ID: ${source.sourceIdentifier}`);
        console.log(`     Members: ${whapiGroup?.size || 'Unknown'}`);
        console.log('');
      });
    }

    console.log('❌ Not Accessible (in DB but not in Whapi):');
    console.log('─'.repeat(80));
    if (notAccessible.length === 0) {
      console.log('   None - All database groups are accessible!\n');
    } else {
      notAccessible.forEach(source => {
        console.log(`   ✗ ${source.sourceName}`);
        console.log(`     ID: ${source.sourceIdentifier}`);
        console.log(`     Reason: Group not found in Whapi (bot removed or deleted)`);
        console.log('');
      });
    }

    // Step 3: Recommendations
    console.log('\n💡 Recommendations:');
    console.log('─'.repeat(80));
    
    if (notAccessible.length > 0) {
      console.log(`1. Remove ${notAccessible.length} stale group(s) from database`);
      console.log('   Command: Run deactivate-stale-groups script (to be created)');
    }

    const newGroups = whapiGroups.filter(g => !dbSources.some(s => s.sourceIdentifier === g.id));
    if (newGroups.length > 0) {
      console.log(`2. Add ${newGroups.length} new group(s) to database`);
      console.log('   Groups:');
      newGroups.forEach(g => {
        console.log(`      - ${g.name || g.subject || 'Unknown'} (${g.id})`);
      });
    }

    if (accessible.length > 0) {
      console.log(`\n✅ ${accessible.length} group(s) are working correctly!`);
    }

  } catch (error) {
    console.error('\n❌ Diagnosis failed:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes('WHAPI_CLOUD_TOKEN')) {
      console.log('\n💡 Fix: Set WHAPI_CLOUD_TOKEN in your .env file');
      console.log('   Get your token from: https://whapi.cloud/');
    } else if (error instanceof Error && error.message.includes('401')) {
      console.log('\n💡 Fix: Your Whapi token is invalid or expired');
      console.log('   1. Go to https://whapi.cloud/');
      console.log('   2. Generate a new API token');
      console.log('   3. Update WHAPI_CLOUD_TOKEN in .env');
    } else if (error instanceof Error && error.message.includes('404')) {
      console.log('\n💡 Possible causes:');
      console.log('   1. Your Whapi channel/session is disconnected');
      console.log('   2. The endpoint URL is incorrect');
      console.log('   3. Check your Whapi dashboard for session status');
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseWhapiConnection();

