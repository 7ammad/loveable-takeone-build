import { prisma } from '../packages/core-db/src/client';

async function main() {
  const sources = await prisma.ingestionSource.findMany({
    where: { sourceType: 'INSTAGRAM', isActive: true },
    select: { sourceName: true, sourceIdentifier: true },
    orderBy: { sourceName: 'asc' }
  });

  console.log('📸 Active Instagram Sources:\n');
  
  const agencies = sources.filter(s => 
    s.sourceName.toLowerCase().includes('casting') || 
    s.sourceName.toLowerCase().includes('agency') || 
    s.sourceName.toLowerCase().includes('talent') ||
    s.sourceName.toLowerCase().includes('studio')
  );

  const individuals = sources.filter(s => !agencies.includes(s));

  console.log('✅ CASTING AGENCIES (should post actual calls):');
  agencies.forEach((s, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${s.sourceName}`);
    console.log(`    ${s.sourceIdentifier}\n`);
  });

  console.log(`\n👤 INDIVIDUAL ACCOUNTS (usually post personal content):`);
  individuals.slice(0, 10).forEach((s, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${s.sourceName}`);
  });
  if (individuals.length > 10) {
    console.log(`... and ${individuals.length - 10} more\n`);
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Instagram sources: ${sources.length}`);
  console.log(`   Casting Agencies: ${agencies.length}`);
  console.log(`   Individual Accounts: ${individuals.length}\n`);

  console.log(`💡 RECOMMENDATION:`);
  console.log(`   The next orchestration cycle should focus on the ${agencies.length} agency accounts.`);
  console.log(`   These are most likely to post actual public casting calls.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

