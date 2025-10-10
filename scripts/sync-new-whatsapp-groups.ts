/**
 * Auto-detect and import new WhatsApp groups
 * Runs periodically to check for new groups user has joined
 * Automatically imports casting-related groups
 */

import 'dotenv/config';
import axios from 'axios';
import { prisma } from '../packages/core-db/src/client';

// Expanded keywords for auto-detection
const CASTING_KEYWORDS = [
  // English
  'cast', 'casting', 'actor', 'actress', 'talent', 'audition',
  'role', 'film', 'movie', 'series', 'commercial', 'ad', 'tv',
  'production', 'performer', 'acting', 'theater', 'theatre',
  
  // Arabic
  'كاست', 'كاستنج', 'كاستينج', 'ممثل', 'ممثلة', 'ممثلين', 'ممثلات',
  'تمثيل', 'دور', 'أدوار', 'فيلم', 'مسلسل', 'إعلان', 'إعلانات',
  'تصوير', 'بطولة', 'بطل', 'بطلة', 'فرص', 'تجارب', 'أداء',
  'إنتاج', 'مسرح', 'مسرحية', 'دراما', 'درامي', 'فني', 'فنان'
];

interface WhapiGroup {
  id: string;
  name?: string;
  subject?: string;
  size?: number;
}

async function syncNewGroups() {
  console.log('🔄 Syncing New WhatsApp Groups...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const whapiToken = process.env.WHAPI_CLOUD_TOKEN;
  const whapiUrl = (process.env.WHAPI_CLOUD_URL || 'https://gate.whapi.cloud').replace(/\/$/, '');

  if (!whapiToken) {
    console.error('❌ WHAPI_CLOUD_TOKEN not found in .env');
    process.exit(1);
  }

  try {
    // 1. Fetch all groups from Whapi
    console.log('1️⃣  Fetching groups from Whapi.Cloud...');
    const response = await axios.get(`${whapiUrl}/groups`, {
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const allGroups: WhapiGroup[] = response.data.groups || [];
    console.log(`   ✅ Found ${allGroups.length} total groups\n`);

    // 2. Get existing groups from database
    console.log('2️⃣  Checking database for existing groups...');
    const existingSources = await prisma.ingestionSource.findMany({
      where: { sourceType: 'WHATSAPP' },
      select: { sourceIdentifier: true, sourceName: true }
    });

    const existingIds = new Set(existingSources.map(s => s.sourceIdentifier));
    console.log(`   ✅ ${existingSources.length} groups already in database\n`);

    // 3. Find NEW groups
    const newGroups = allGroups.filter(g => !existingIds.has(g.id));
    console.log(`3️⃣  Found ${newGroups.length} NEW groups\n`);

    if (newGroups.length === 0) {
      console.log('✅ No new groups to sync. All groups are up to date!\n');
      return;
    }

    // 4. Auto-detect casting-related groups
    console.log('4️⃣  Auto-detecting casting-related groups...\n');
    
    const newCastingGroups: WhapiGroup[] = [];
    const otherGroups: WhapiGroup[] = [];

    for (const group of newGroups) {
      const groupName = (group.name || group.subject || '').toLowerCase();
      const isCastingRelated = CASTING_KEYWORDS.some(keyword => 
        groupName.includes(keyword.toLowerCase())
      );

      if (isCastingRelated) {
        newCastingGroups.push(group);
      } else {
        otherGroups.push(group);
      }
    }

    console.log(`   ✅ Casting-related: ${newCastingGroups.length}`);
    console.log(`   ⏭️  Other groups: ${otherGroups.length}\n`);

    // 5. Display new casting groups
    if (newCastingGroups.length > 0) {
      console.log('🎯 NEW CASTING GROUPS DETECTED:\n');
      newCastingGroups.forEach((group, index) => {
        const name = group.name || group.subject || 'Unnamed Group';
        console.log(`   ${index + 1}. ${name}`);
        console.log(`      ID: ${group.id} | Members: ${group.size || 'Unknown'}`);
      });
      console.log('');
    }

    // 6. Auto-import new casting groups
    if (newCastingGroups.length > 0) {
      console.log('5️⃣  Auto-importing new casting groups...\n');
      
      let imported = 0;
      for (const group of newCastingGroups) {
        try {
          await prisma.ingestionSource.create({
            data: {
              sourceType: 'WHATSAPP',
              sourceIdentifier: group.id,
              sourceName: group.name || group.subject || 'Unnamed Group',
              isActive: true
            }
          });
          console.log(`   ✅ Imported: ${group.name || group.subject}`);
          imported++;
        } catch (error) {
          console.error(`   ❌ Failed to import: ${group.name}`, error);
        }
      }

      console.log(`\n   📊 Imported ${imported}/${newCastingGroups.length} groups\n`);
    }

    // 7. Display other new groups for manual review
    if (otherGroups.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📋 OTHER NEW GROUPS (Not auto-imported):\n');
      
      otherGroups.slice(0, 10).forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.name || group.subject || 'Unnamed'}`);
      });
      
      if (otherGroups.length > 10) {
        console.log(`   ... and ${otherGroups.length - 10} more`);
      }
      
      console.log('\n   💡 If any of these are casting-related, you can manually import them');
      console.log('      by editing whatsapp-groups.json and running import script.\n');
    }

    // 8. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 SYNC SUMMARY:\n');
    console.log(`   Total groups found: ${allGroups.length}`);
    console.log(`   Already in database: ${existingSources.length}`);
    console.log(`   New groups: ${newGroups.length}`);
    console.log(`   Auto-imported (casting): ${newCastingGroups.length}`);
    console.log(`   Skipped (non-casting): ${otherGroups.length}\n`);

    // Get updated count
    const totalActive = await prisma.ingestionSource.count({
      where: { sourceType: 'WHATSAPP', isActive: true }
    });

    console.log(`✅ Total active WhatsApp sources: ${totalActive}\n`);
    console.log('🚀 Digital Twin will process these groups in the next orchestration cycle!\n');

  } catch (error: any) {
    console.error('\n❌ Error during sync:\n');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.statusText}\n`);
    } else {
      console.error(`   ${error.message}\n`);
    }
    
    process.exit(1);
  }
}

syncNewGroups()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

