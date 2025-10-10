/**
 * Extract REAL keywords from actual Instagram casting call posts
 * Analyzes the validation queue to find patterns in legitimate vs false positive posts
 */

import { prisma } from '../packages/core-db/src/client';

interface KeywordAnalysis {
  castingKeywords: Map<string, number>;
  rejectionKeywords: Map<string, number>;
  legitimatePosts: string[];
  falsePositivePosts: string[];
}

async function analyzePosts() {
  console.log('🔍 Analyzing actual Instagram posts to extract real keywords...\n');

  const allPosts = await prisma.castingCall.findMany({
    where: {
      sourceUrl: { contains: 'instagram' },
      status: 'pending_review'
    },
    select: {
      id: true,
      title: true,
      description: true,
      sourceUrl: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Analyze last 100 Instagram posts
  });

  console.log(`📊 Found ${allPosts.length} Instagram posts to analyze\n`);

  const analysis: KeywordAnalysis = {
    castingKeywords: new Map(),
    rejectionKeywords: new Map(),
    legitimatePosts: [],
    falsePositivePosts: []
  };

  // Manual classification based on title patterns
  const falsePositivePatterns = [
    'Instagram Post from',
    'Screening',
    'Workshop',
    'ورشة',
    'عرض',
    'خلف الكواليس',
    'مهرجان',
    'تهنئة',
    'مبروك',
    'انتهى',
    'اكتمل'
  ];

  for (const post of allPosts) {
    const content = `${post.title} ${post.description || ''}`.toLowerCase();
    
    // Check if it's a false positive
    const isFalsePositive = falsePositivePatterns.some(pattern => 
      post.title.includes(pattern)
    );

    if (isFalsePositive) {
      analysis.falsePositivePosts.push(post.title);
      
      // Extract words from false positives as rejection keywords
      const arabicWords = (post.title + ' ' + (post.description || '')).match(/[\u0600-\u06FF]+/g) || [];
      arabicWords.forEach(word => {
        if (word.length > 2) { // Skip very short words
          const count = analysis.rejectionKeywords.get(word) || 0;
          analysis.rejectionKeywords.set(word, count + 1);
        }
      });
    } else {
      analysis.legitimatePosts.push(post.title);
      
      // Extract words from legitimate posts as casting keywords
      const arabicWords = (post.title + ' ' + (post.description || '')).match(/[\u0600-\u06FF]+/g) || [];
      arabicWords.forEach(word => {
        if (word.length > 2) {
          const count = analysis.castingKeywords.get(word) || 0;
          analysis.castingKeywords.set(word, count + 1);
        }
      });
    }
  }

  return analysis;
}

async function main() {
  const analysis = await analyzePosts();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 SAMPLE POSTS ANALYSIS\n');

  console.log('❌ FALSE POSITIVE EXAMPLES (First 10):');
  analysis.falsePositivePosts.slice(0, 10).forEach((title, i) => {
    console.log(`${i + 1}. ${title}`);
  });

  console.log('\n✅ LEGITIMATE POST EXAMPLES (First 10):');
  analysis.legitimatePosts.slice(0, 10).forEach((title, i) => {
    console.log(`${i + 1}. ${title}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 TOP ARABIC KEYWORDS FOUND IN POSTS\n');

  console.log('🔴 REJECTION KEYWORDS (from false positives):');
  const topRejection = Array.from(analysis.rejectionKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  topRejection.forEach(([keyword, count], i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${keyword.padEnd(20)} (${count} occurrences)`);
  });

  console.log('\n🟢 CASTING KEYWORDS (from legitimate posts):');
  const topCasting = Array.from(analysis.castingKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  topCasting.forEach(([keyword, count], i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${keyword.padEnd(20)} (${count} occurrences)`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📈 STATISTICS\n');
  console.log(`Total posts analyzed: ${analysis.legitimatePosts.length + analysis.falsePositivePosts.length}`);
  console.log(`Legitimate posts: ${analysis.legitimatePosts.length} (${((analysis.legitimatePosts.length / (analysis.legitimatePosts.length + analysis.falsePositivePosts.length)) * 100).toFixed(1)}%)`);
  console.log(`False positives: ${analysis.falsePositivePosts.length} (${((analysis.falsePositivePosts.length / (analysis.legitimatePosts.length + analysis.falsePositivePosts.length)) * 100).toFixed(1)}%)`);
  console.log(`Unique rejection keywords found: ${analysis.rejectionKeywords.size}`);
  console.log(`Unique casting keywords found: ${analysis.castingKeywords.size}`);

  console.log('\n💡 RECOMMENDATIONS:\n');
  console.log('1. Add top rejection keywords to workers-init.ts rejectKeywords array');
  console.log('2. Add top casting keywords to workers-init.ts castingKeywords array');
  console.log('3. Review keywords with high occurrence counts first');
  console.log('4. Cross-reference with LLM prompt to ensure alignment\n');

  // Export to JSON for further analysis
  const exportData = {
    statistics: {
      totalPosts: analysis.legitimatePosts.length + analysis.falsePositivePosts.length,
      legitimate: analysis.legitimatePosts.length,
      falsePositives: analysis.falsePositivePosts.length
    },
    topRejectionKeywords: topRejection.map(([word, count]) => ({ word, count })),
    topCastingKeywords: topCasting.map(([word, count]) => ({ word, count })),
    sampleLegitimate: analysis.legitimatePosts.slice(0, 20),
    sampleFalsePositives: analysis.falsePositivePosts.slice(0, 20)
  };

  const fs = require('fs');
  fs.writeFileSync(
    'instagram-keyword-analysis.json',
    JSON.stringify(exportData, null, 2)
  );

  console.log('✅ Detailed analysis saved to: instagram-keyword-analysis.json\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

