import { prisma } from '../packages/core-db/src/client';

async function main() {
  const posts = await prisma.castingCall.findMany({
    where: { status: 'pending_validation' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      description: true,
      sourceUrl: true,
      sourceName: true,
      createdAt: true,
    }
  });

  console.log('📋 Recent Posts Detailed Analysis:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  posts.forEach((p, i) => {
    console.log(`${i+1}. ${p.title}`);
    console.log(`   Created: ${p.createdAt.toISOString()}`);
    console.log(`   Description: ${p.description?.substring(0, 300) || 'N/A'}`);
    console.log(`   Source URL: ${p.sourceUrl || 'N/A'}`);
    console.log(`   Source Name: ${p.sourceName || 'N/A'}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 ANALYSIS:\n');
  console.log('Look for patterns in false positives:');
  console.log('- Do they contain casting keywords (مطلوب, للتقديم)?');
  console.log('- Are they film titles vs actual calls?');
  console.log('- Are they from "That Studio" or "Telfaz11"?\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

