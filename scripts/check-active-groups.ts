/**
 * Check Active WhatsApp Groups
 * Shows all active ingestion sources
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';

async function checkActiveGroups() {
  console.log('📱 Checking Active WhatsApp Groups\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const activeGroups = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      },
      orderBy: {
        sourceName: 'asc'
      }
    });

    const inactiveGroups = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: false
      },
      orderBy: {
        sourceName: 'asc'
      }
    });

    console.log(`✅ Active Groups: ${activeGroups.length}`);
    console.log(`⏸️  Inactive Groups: ${inactiveGroups.length}\n`);

    if (activeGroups.length > 0) {
      console.log('Active WhatsApp Groups:\n');
      activeGroups.forEach((group, i) => {
        console.log(`${i + 1}. ${group.sourceName}`);
        console.log(`   ID: ${group.sourceIdentifier}`);
        console.log(`   Created: ${new Date(group.createdAt).toLocaleDateString()}`);
        if (group.lastProcessedAt) {
          console.log(`   Last Processed: ${new Date(group.lastProcessedAt).toLocaleString()}`);
        }
        console.log('');
      });
    }

    if (inactiveGroups.length > 0) {
      console.log('\n⏸️  Inactive Groups:\n');
      inactiveGroups.forEach((group, i) => {
        console.log(`${i + 1}. ${group.sourceName}`);
        console.log(`   ID: ${group.sourceIdentifier}`);
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 To activate/deactivate groups, use the admin portal:');
    console.log('   http://localhost:3000/admin/sources\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkActiveGroups();

