/**
 * ADD verified Saudi casting platforms WITHOUT removing existing sources
 * We keep all sources and improve detection instead
 */

import { prisma } from '../packages/core-db/src/client';

const additionalVerifiedSources = [
  // Major Casting Websites (add if not exist)
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
  
  // Instagram Casting Agencies (add if not exist)
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
  console.log('➕ Adding verified Saudi casting sources (keeping all existing)...\n');

  // Step 1: Re-activate ALL existing sources that were deactivated
  console.log('1. Re-activating all previously deactivated sources...');
  const reactivated = await prisma.ingestionSource.updateMany({
    where: { isActive: false },
    data: { isActive: true }
  });
  console.log(`   ✅ Re-activated ${reactivated.count} source(s)\n`);

  // Step 2: Add new verified sources (only if they don't exist)
  console.log('2. Adding additional verified casting sources...');
  let created = 0;
  let skipped = 0;

  for (const source of additionalVerifiedSources) {
    const existing = await prisma.ingestionSource.findFirst({
      where: { sourceIdentifier: source.sourceIdentifier }
    });

    if (!existing) {
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
    } else {
      skipped++;
      console.log(`   ⏭️  Exists: ${source.sourceName}`);
    }
  }

  // Step 3: Get final count
  const totalActive = await prisma.ingestionSource.count({
    where: { isActive: true }
  });

  const instagramCount = await prisma.ingestionSource.count({
    where: { isActive: true, sourceType: 'INSTAGRAM' }
  });

  const webCount = await prisma.ingestionSource.count({
    where: { isActive: true, sourceType: 'WEB' }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   - Re-activated sources: ${reactivated.count}`);
  console.log(`   - Created new sources: ${created}`);
  console.log(`   - Already existed: ${skipped}`);
  console.log(`   - Total active sources: ${totalActive}`);
  console.log(`     • ${webCount} Web platforms`);
  console.log(`     • ${instagramCount} Instagram accounts`);

  console.log('\n✅ Done! All sources are now active.');
  console.log('   The enhanced filtering system will separate real casting calls from other content.\n');
  console.log('💡 Focus: Improved Arabic keyword detection and strict validation criteria\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

