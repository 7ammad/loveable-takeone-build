/**
 * Cleanup WhatsApp Sources
 * Keep only the 10 accessible groups, deactivate the rest
 */

import 'dotenv/config';
import { prisma } from '@packages/core-db';

async function cleanupWhatsAppSources() {
  console.log('🧹 Cleaning up WhatsApp sources...\n');

  try {
    // The 10 accessible groups from our diagnostic
    const activeGroupIds = [
      '120363316435315571@g.us', // 🎭 Talents & Auditions
      '120363323432567187@g.us', // Actors and Actresses
      '120363307107855762@g.us', // Actors and Actresses
      '120363399387693071@g.us', // Cast - فيلم الرجل الذي تعثر بكلماته
      '120363416705627048@g.us', // Cast | Jareesh Salam
      '120363388927258756@g.us', // تصوير نايس ون ٢٥
      '120363338478038459@g.us', // ممثلين | شرهبان
      '120363306716220000@g.us', // فيلم توف
      '120363333666991126@g.us', // The Actors Club - نادي الممثلين
      '120363321492808704@g.us'  // Actors & Actresses
    ];

    // Get all WhatsApp sources
    const allSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP'
      }
    });

    console.log(`📊 Total WhatsApp sources in database: ${allSources.length}`);
    console.log(`✅ Keeping ${activeGroupIds.length} accessible groups`);
    console.log(`❌ Will deactivate ${allSources.length - activeGroupIds.length} inaccessible groups\n`);

    // Deactivate groups NOT in the active list
    const deactivated = await prisma.ingestionSource.updateMany({
      where: {
        sourceType: 'WHATSAPP',
        sourceIdentifier: {
          notIn: activeGroupIds
        }
      },
      data: {
        isActive: false
      }
    });

    console.log(`✅ Deactivated ${deactivated.count} WhatsApp groups`);

    // Ensure the 10 active ones are actually active
    const activated = await prisma.ingestionSource.updateMany({
      where: {
        sourceType: 'WHATSAPP',
        sourceIdentifier: {
          in: activeGroupIds
        }
      },
      data: {
        isActive: true
      }
    });

    console.log(`✅ Activated ${activated.count} WhatsApp groups\n`);

    // Show final status
    const activeCount = await prisma.ingestionSource.count({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    const inactiveCount = await prisma.ingestionSource.count({
      where: {
        sourceType: 'WHATSAPP',
        isActive: false
      }
    });

    console.log('📊 Final Status:');
    console.log(`   Active WhatsApp groups: ${activeCount}`);
    console.log(`   Inactive WhatsApp groups: ${inactiveCount}`);

    // List the active groups
    const activeSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      },
      orderBy: {
        sourceName: 'asc'
      }
    });

    console.log(`\n✅ Active WhatsApp Groups (${activeSources.length}):`);
    console.log('─'.repeat(80));
    activeSources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.sourceName}`);
      console.log(`   ID: ${source.sourceIdentifier}`);
    });

    console.log(`\n🎯 Digital Twin will now ONLY monitor these ${activeCount} groups!`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupWhatsAppSources();
