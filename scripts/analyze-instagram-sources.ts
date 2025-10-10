/**
 * Analyzes Instagram sources to identify which accounts post genuine casting calls
 * Run: pnpm tsx scripts/analyze-instagram-sources.ts
 */

import { prisma } from '../packages/core-db/src/client';

const CASTING_KEYWORDS = [
  // English
  'casting call', 'casting now', 'now casting', 'open audition', 'seeking actors',
  'talent needed', 'role available', 'apply now', 'deadline',
  // Arabic
  'كاستنج', 'اختيار ممثلين', 'مطلوب ممثل', 'مطلوب ممثلة', 'تقديم على الدور'
];

const REJECT_KEYWORDS = [
  'screening', 'premiere', 'workshop', 'course', 'behind the scenes', 'wrapped',
  'ورشة', 'دورة', 'عرض', 'مهرجان'
];

async function analyzeSource(sourceId: string, sourceName: string) {
  // Get all casting calls from this source
  const calls = await prisma.castingCall.findMany({
    where: { 
      sourceUrl: { contains: sourceId }
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Last 50 calls
  });

  let castingCount = 0;
  let falsePositiveCount = 0;

  for (const call of calls) {
    const content = `${call.title} ${call.description || ''}`.toLowerCase();
    const hasCasting = CASTING_KEYWORDS.some(kw => content.includes(kw));
    const hasReject = REJECT_KEYWORDS.some(kw => content.includes(kw));

    if (hasCasting && !hasReject) {
      castingCount++;
    } else {
      falsePositiveCount++;
    }
  }

  const accuracy = calls.length > 0 ? (castingCount / calls.length) * 100 : 0;
  
  return {
    sourceName,
    totalCalls: calls.length,
    castingCount,
    falsePositiveCount,
    accuracy: accuracy.toFixed(1),
    recommendation: accuracy >= 30 ? 'KEEP' : accuracy >= 10 ? 'REVIEW' : 'DEACTIVATE'
  };
}

async function main() {
  console.log('🔍 Analyzing Instagram sources for casting call quality...\n');

  const instagramSources = await prisma.ingestionSource.findMany({
    where: { sourceType: 'INSTAGRAM' },
  });

  const results = [];

  for (const source of instagramSources) {
    const username = source.sourceIdentifier.split('/').filter(Boolean).pop()?.replace('@', '');
    const analysis = await analyzeSource(username || '', source.sourceName);
    results.push(analysis);
  }

  // Sort by accuracy (worst first)
  results.sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));

  console.log('📊 ANALYSIS RESULTS\n');
  console.log('Source Name | Total | Real | False | Accuracy | Action');
  console.log(''.padEnd(80, '-'));

  const keep = results.filter(r => r.recommendation === 'KEEP');
  const review = results.filter(r => r.recommendation === 'REVIEW');
  const deactivate = results.filter(r => r.recommendation === 'DEACTIVATE');

  console.log('\n❌ DEACTIVATE (Low quality):');
  deactivate.forEach(r => {
    console.log(`${r.sourceName.padEnd(40)} | ${r.totalCalls} | ${r.castingCount} | ${r.falsePositiveCount} | ${r.accuracy}% | ${r.recommendation}`);
  });

  console.log('\n⚠️  REVIEW (Mixed quality):');
  review.forEach(r => {
    console.log(`${r.sourceName.padEnd(40)} | ${r.totalCalls} | ${r.castingCount} | ${r.falsePositiveCount} | ${r.accuracy}% | ${r.recommendation}`);
  });

  console.log('\n✅ KEEP (High quality):');
  keep.forEach(r => {
    console.log(`${r.sourceName.padEnd(40)} | ${r.totalCalls} | ${r.castingCount} | ${r.falsePositiveCount} | ${r.accuracy}% | ${r.recommendation}`);
  });

  console.log(`\n📈 SUMMARY:`);
  console.log(`   Keep: ${keep.length} sources`);
  console.log(`   Review: ${review.length} sources`);
  console.log(`   Deactivate: ${deactivate.length} sources`);
  console.log('\n💡 TIP: Run scripts/deactivate-low-quality-sources.ts to auto-deactivate\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

