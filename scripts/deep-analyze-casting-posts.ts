/**
 * Deep analysis of actual casting call content to understand patterns
 * Looks at full descriptions to find REAL casting keywords
 */

import { prisma } from '../packages/core-db/src/client';

async function main() {
  console.log('🔍 DEEP ANALYSIS: Examining Full Content of Instagram Posts\n');

  // Get posts with full descriptions
  const posts = await prisma.castingCall.findMany({
    where: {
      sourceUrl: { contains: 'instagram' },
      status: 'pending_review'
    },
    select: {
      title: true,
      description: true,
      sourceUrl: true,
      requirements: true,
      contactInfo: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  console.log(`📊 Analyzing ${posts.length} posts with full content\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Look for posts that have actual casting-related terms in description
  const realCastingPosts = posts.filter(post => {
    const content = `${post.title} ${post.description || ''} ${post.requirements || ''}`.toLowerCase();
    return (
      content.includes('مطلوب') || 
      content.includes('كاستنج') || 
      content.includes('كاستينغ') ||
      content.includes('casting') ||
      content.includes('دور') ||
      content.includes('ممثل') ||
      content.includes('actor')
    );
  });

  console.log(`✅ Found ${realCastingPosts.length} posts with ACTUAL casting terminology\n`);

  realCastingPosts.slice(0, 10).forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    if (post.description) {
      console.log(`   Description: ${post.description.substring(0, 200)}...`);
    }
    if (post.requirements) {
      console.log(`   Requirements: ${post.requirements.substring(0, 200)}...`);
    }
    if (post.contactInfo) {
      console.log(`   Contact: ${post.contactInfo}`);
    }
    console.log(`   URL: ${post.sourceUrl}`);
    console.log('');
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔍 ANALYZING FALSE POSITIVES (workshops, screenings, etc.)\n');

  const falsePositives = posts.filter(post => {
    const title = post.title.toLowerCase();
    return (
      title.includes('instagram post from') ||
      title.includes('screening') ||
      title.includes('workshop') ||
      title.includes('ورشة')
    );
  });

  console.log(`❌ Found ${falsePositives.length} clear false positives\n`);

  falsePositives.slice(0, 10).forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    if (post.description) {
      const desc = post.description.substring(0, 300);
      console.log(`   Content: ${desc}...`);
      
      // Extract Arabic words
      const arabicWords = desc.match(/[\u0600-\u06FF]+/g) || [];
      const uniqueWords = [...new Set(arabicWords)].slice(0, 10);
      console.log(`   Arabic terms: ${uniqueWords.join(', ')}`);
    }
    console.log('');
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 KEY INSIGHTS:\n');
  
  // Find common patterns
  const workshopPosts = posts.filter(p => 
    (p.title + ' ' + (p.description || '')).toLowerCase().includes('ورشة')
  );
  
  const screeningPosts = posts.filter(p => 
    (p.title + ' ' + (p.description || '')).toLowerCase().includes('عرض')
  );

  console.log(`Workshop posts (ورشة): ${workshopPosts.length}`);
  console.log(`Screening posts (عرض): ${screeningPosts.length}`);
  console.log(`Actual casting indicators: ${realCastingPosts.length}`);
  
  console.log('\n🎯 RECOMMENDATION:\n');
  console.log('The main issue is that most posts are NOT casting calls at all.');
  console.log('They are:');
  console.log('- Personal project announcements (film titles)');
  console.log('- Workshops/training programs');
  console.log('- Film screenings');
  console.log('- Generic "Instagram Post from..." (caption extraction failed)');
  console.log('\nThe filtering keywords are working, but we need to be MORE STRICT.');
  console.log('Require EXPLICIT casting indicators like:');
  console.log('- "مطلوب ممثل" (actor needed)');
  console.log('- "كاستنج" (casting)');
  console.log('- "للتقديم" (to apply)');
  console.log('- "آخر موعد" (deadline)\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

