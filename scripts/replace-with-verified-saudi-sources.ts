/**
 * Replace existing sources with verified Saudi casting platforms
 * Based on user-provided list of legitimate casting sources
 */

import { prisma } from '../packages/core-db/src/client';

const verifiedSources = [
  // Major Casting Websites
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://mixfame.com',
    sourceName: 'Mixfame - Casting Platform',
    isActive: true
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://dashboard.castingarabia.com',
    sourceName: 'Casting Arabia - Platform',
    isActive: true
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.gulfcasting.com',
    sourceName: 'Gulf Casting Agency - Website',
    isActive: true
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://mrcastingksa.com',
    sourceName: 'Mr. Casting KSA - Website',
    isActive: true
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.thatstudioksa.com',
    sourceName: 'That Studio - Website',
    isActive: true
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://persona17.com',
    sourceName: 'Persona17 - Website',
    isActive: true
  },
  
  // Instagram Casting Agencies (verified accounts that post casting calls)
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/gulfcasting/',
    sourceName: 'Gulf Casting Agency - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/mr.castingksa/',
    sourceName: 'Mr.Casting Agency - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/persona17.sa/',
    sourceName: 'Persona17 Casting Agency - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/castingarabia/',
    sourceName: 'Casting Arabia - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/mbctalent/',
    sourceName: 'MBC Talent - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/thatstudioksa/',
    sourceName: 'That Studio - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/auroracasting.sa/',
    sourceName: 'Aurora Casting Studio - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/thecastingco/',
    sourceName: 'The Casting Studio - Instagram',
    isActive: true
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: 'https://www.instagram.com/castingsecret/',
    sourceName: 'Casting Secret - Instagram',
    isActive: true
  }
];

async function main() {
  console.log('🔄 Replacing sources with verified Saudi casting platforms...\n');

  // Step 1: Deactivate ALL existing sources
  console.log('1. Deactivating all existing sources...');
  const deactivated = await prisma.ingestionSource.updateMany({
    data: { isActive: false }
  });
  console.log(`   ✅ Deactivated ${deactivated.count} source(s)\n`);

  // Step 2: Add or update verified sources
  console.log('2. Adding verified Saudi casting sources...');
  let created = 0;
  let updated = 0;

  for (const source of verifiedSources) {
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
  console.log(`     • ${verifiedSources.filter(s => s.sourceType === 'WEB').length} Web platforms`);
  console.log(`     • ${verifiedSources.filter(s => s.sourceType === 'INSTAGRAM').length} Instagram agencies`);

  console.log('\n✅ Done! Digital Twin will now use verified Saudi casting sources.');
  console.log('   Next orchestration cycle will process these sources.\n');
  console.log('💡 TIP: The new filtering system will ensure only legitimate casting calls are extracted.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error replacing sources:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

