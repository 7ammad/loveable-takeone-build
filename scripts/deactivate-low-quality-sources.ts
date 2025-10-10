/**
 * Deactivates Instagram sources that produce mostly false positives
 * Run: pnpm tsx scripts/deactivate-low-quality-sources.ts
 */

import { prisma } from '../packages/core-db/src/client';

async function main() {
  console.log('🧹 Deactivating low-quality Instagram sources...\n');

  // Get Instagram sources that have produced calls
  const instagramSources = await prisma.ingestionSource.findMany({
    where: { sourceType: 'INSTAGRAM', isActive: true },
  });

  let deactivatedCount = 0;

  for (const source of instagramSources) {
    const username = source.sourceIdentifier.split('/').filter(Boolean).pop()?.replace('@', '');
    
    // Count casting calls from this source
    const calls = await prisma.castingCall.findMany({
      where: { 
        sourceUrl: { contains: username || '' }
      },
      select: {
        title: true,
        description: true,
      },
      take: 20, // Check last 20
    });

    if (calls.length === 0) continue;

    // Simple check: how many have "Instagram Post from" (generic title = false positive)
    const falsePositives = calls.filter(c => 
      c.title.includes('Instagram Post from') || 
      c.title.includes('Screening') ||
      c.title.includes('Workshop') ||
      c.title.includes('ورشة')
    ).length;

    const falsePositiveRate = (falsePositives / calls.length) * 100;

    if (falsePositiveRate > 70) {
      await prisma.ingestionSource.update({
        where: { id: source.id },
        data: { isActive: false }
      });
      console.log(`❌ Deactivated: ${source.sourceName} (${falsePositiveRate.toFixed(0)}% false positives)`);
      deactivatedCount++;
    }
  }

  console.log(`\n✅ Deactivated ${deactivatedCount} low-quality sources`);
  console.log('   These sources will not be processed in future orchestration cycles\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

