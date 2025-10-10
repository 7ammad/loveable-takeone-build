#!/usr/bin/env ts-node
/**
 * Replace existing sources with proper Saudi casting sources
 */

import { prisma } from '@packages/core-db';
import saudiSources from '../saudi-sources.json';

async function main() {
  console.log('🔄 Replacing sources with Saudi-specific casting sources...\n');

  // Deactivate all existing sources
  console.log('1. Deactivating all existing sources...');
  const deactivated = await prisma.ingestionSource.updateMany({
    data: { isActive: false }
  });
  console.log(`   ✅ Deactivated ${deactivated.count} source(s)\n`);

  // Add or update Saudi sources
  console.log('2. Adding Saudi casting sources...');
  let created = 0;
  let updated = 0;

  for (const source of saudiSources) {
    const existing = await prisma.ingestionSource.findFirst({
      where: { sourceIdentifier: source.sourceIdentifier }
    });

    if (existing) {
      await prisma.ingestionSource.update({
        where: { id: existing.id },
        data: {
          sourceName: source.sourceName,
          sourceType: source.sourceType,
          isActive: true,
          updatedAt: new Date()
        }
      });
      updated++;
      console.log(`   ✅ Updated: ${source.sourceName}`);
    } else {
      await prisma.ingestionSource.create({
        data: {
          sourceType: source.sourceType,
          sourceIdentifier: source.sourceIdentifier,
          sourceName: source.sourceName,
          isActive: true
        }
      });
      created++;
      console.log(`   ✅ Created: ${source.sourceName}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Deactivated old sources: ${deactivated.count}`);
  console.log(`   - Created new sources: ${created}`);
  console.log(`   - Updated existing sources: ${updated}`);
  console.log(`   - Total active sources: ${created + updated}`);

  console.log('\n✅ Done! Digital Twin will now use Saudi-specific sources.');
  console.log('   Next orchestration cycle will process these sources.\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

