#!/usr/bin/env tsx
/**
 * Deactivate all Instagram sources temporarily
 * They produce too many false positives (personal posts, not casting calls)
 */

import { prisma } from '../packages/core-db/src/client';

async function deactivateInstagram() {
  try {
    console.log('🔄 Deactivating Instagram sources...\n');

    const result = await prisma.ingestionSource.updateMany({
      where: {
        sourceType: 'INSTAGRAM',
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    console.log(`✅ Deactivated ${result.count} Instagram source(s)`);

    // Show remaining active sources
    const activeSources = await prisma.ingestionSource.findMany({
      where: { isActive: true },
      select: { sourceName: true, sourceType: true },
    });

    console.log(`\n📋 Remaining active sources (${activeSources.length}):`);
    activeSources.forEach(source => {
      console.log(`   - ${source.sourceName} (${source.sourceType})`);
    });

    console.log('\n💡 Next steps:');
    console.log('   1. Run orchestration manually or wait for next cycle');
    console.log('   2. Review validation queue quality');
    console.log('   3. If better, keep Instagram disabled');
    console.log('   4. To re-enable: npx tsx scripts/activate-all-sources.ts\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deactivateInstagram();

