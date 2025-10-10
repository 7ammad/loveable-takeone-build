/**
 * Import WhatsApp groups into TakeOne database as ingestion sources
 * Only imports groups marked as potentially casting-related
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';
import * as fs from 'fs';

interface WhatsAppGroup {
  groupId: string;
  groupName: string;
  members: number;
  createdAt: string | null;
  isPotentiallyCasting: boolean;
}

async function importGroups() {
  console.log('📥 Importing WhatsApp Groups to TakeOne Database...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Read the groups file
  if (!fs.existsSync('./whatsapp-groups.json')) {
    console.error('❌ Error: whatsapp-groups.json not found');
    console.log('\n💡 Please run: npx tsx scripts/whapi-list-groups.ts first\n');
    process.exit(1);
  }

  const groupsData: WhatsAppGroup[] = JSON.parse(
    fs.readFileSync('./whatsapp-groups.json', 'utf-8')
  );

  // Filter for casting groups
  const castingGroups = groupsData.filter(g => g.isPotentiallyCasting);

  console.log(`📊 Statistics:`);
  console.log(`   Total groups: ${groupsData.length}`);
  console.log(`   Casting-related: ${castingGroups.length}`);
  console.log(`   Non-casting: ${groupsData.length - castingGroups.length}\n`);

  if (castingGroups.length === 0) {
    console.log('⚠️  No casting-related groups found to import\n');
    process.exit(0);
  }

  console.log('🎯 Casting Groups to Import:\n');
  castingGroups.forEach((group, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${group.groupName}`);
  });
  console.log('');

  // Import groups
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const group of castingGroups) {
    try {
      // Check if group already exists
      const existing = await prisma.ingestionSource.findFirst({
        where: {
          sourceType: 'WHATSAPP',
          sourceIdentifier: group.groupId
        }
      });

      if (existing) {
        // Update existing
        await prisma.ingestionSource.update({
          where: { id: existing.id },
          data: {
            sourceName: group.groupName,
            isActive: true,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Updated: ${group.groupName}`);
        updated++;
      } else {
        // Create new
        await prisma.ingestionSource.create({
          data: {
            sourceType: 'WHATSAPP',
            sourceIdentifier: group.groupId,
            sourceName: group.groupName,
            isActive: true
          }
        });
        console.log(`✅ Created: ${group.groupName}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Failed to import ${group.groupName}:`, error);
      skipped++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Import Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${created + updated} groups now active\n`);

  console.log('✅ WhatsApp groups successfully imported!\n');
  console.log('🚀 Next Steps:');
  console.log('1. Create WhatsApp orchestrator (lib/digital-twin/orchestrators/whatsapp-orchestrator.ts)');
  console.log('2. Test by fetching messages from these groups');
  console.log('3. Run orchestration cycle to start finding casting calls!\n');
}

importGroups()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

