/**
 * Delete all non-WhatsApp ingestion sources
 * Keeps only the 10 casting-related WhatsApp groups
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';

async function cleanup() {
  console.log('🧹 Cleaning up non-WhatsApp sources...\n');

  // Delete Instagram and Web sources
  const deleted = await prisma.ingestionSource.deleteMany({
    where: {
      sourceType: {
        in: ['INSTAGRAM', 'WEB']
      }
    }
  });

  console.log(`✅ Deleted ${deleted.count} Instagram and Web sources`);
  
  // Show remaining WhatsApp sources
  const remaining = await prisma.ingestionSource.findMany({
    where: { sourceType: 'WHATSAPP', isActive: true },
    select: { sourceName: true }
  });

  console.log(`\n📊 Remaining WhatsApp groups: ${remaining.length}\n`);
  remaining.forEach((s, i) => {
    console.log(`${i + 1}. ${s.sourceName}`);
  });
  console.log('');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

