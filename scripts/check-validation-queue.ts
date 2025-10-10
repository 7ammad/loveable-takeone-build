/**
 * Check recent casting calls in validation queue
 */

import { prisma } from '../packages/core-db/src/client';

async function main() {
  console.log('🔍 Checking Validation Queue...\n');

  const calls = await prisma.castingCall.findMany({
    where: { status: 'pending_review' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      title: true,
      createdAt: true,
      sourceUrl: true,
    },
  });

  console.log(`📊 Total Pending: ${calls.length}\n`);
  console.log('Recent Casting Calls:');
  console.log(''.padEnd(80, '-'));

  calls.forEach((call, i) => {
    const date = call.createdAt.toISOString().split('T')[0];
    const source = call.sourceUrl?.includes('instagram') ? '📸 IG' : '🌐 Web';
    console.log(`${(i + 1).toString().padStart(2)}. ${source} ${call.title.substring(0, 60)} (${date})`);
  });

  console.log('\n💡 Look for false positives:');
  console.log('   - "Instagram Post from..." (generic)');
  console.log('   - "Screening", "Workshop", "ورشة"');
  console.log('   - Personal project announcements\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

