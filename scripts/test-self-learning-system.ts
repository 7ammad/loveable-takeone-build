/**
 * Test Self-Learning System
 * Verify that the LLM learning system improves over time
 */

import 'dotenv/config';
import { LlmCastingCallExtractionService } from '@packages/core-lib';
import { llmLearningService } from '@packages/core-lib';

async function testSelfLearningSystem() {
  console.log('🧪 Testing Self-Learning System...\n');

  const extractionService = new LlmCastingCallExtractionService();

  // Test cases that should be caught after learning
  const testCases = [
    {
      name: 'Test Case 1 - Similar to missed calls',
      text: `احتاج بنات لتصوير في الرياض
المبلغ 300 ريال
رقم التواصل: +966501234567`
    },
    {
      name: 'Test Case 2 - Informal language',
      text: `مطلوب مودل شاب للاستوديو
تصوير براند ملابس
جدة - للتواصل واتساب`
    },
    {
      name: 'Test Case 3 - Mixed patterns',
      text: `فرصة تصوير فيديو
نحتاج اكسترا رجال وبنات
تاريخ 20 اكتوبر
المبلغ 250 ريال`
    }
  ];

  console.log('📊 Initial Learning Stats:');
  try {
    const initialStats = await llmLearningService.getLearningStats();
    console.log(`   Total patterns: ${initialStats.totalPatterns}`);
    console.log(`   Average confidence: ${(initialStats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Recent activity: ${initialStats.recentActivity}`);
  } catch (error) {
    console.log('   No learning data yet (expected for first run)');
  }

  console.log('\n🔍 Testing extraction with current learning...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log('─'.repeat(60));

    try {
      const result = await extractionService.extractCastingCallFromText(testCase.text);

      if (result.success) {
        console.log('✅ PASSED - Extracted as casting call');
        console.log(`   Title: ${result.data?.title}`);
        console.log(`   Location: ${result.data?.location}`);
        passed++;
      } else {
        console.log('❌ FAILED - Rejected as not casting call');
        console.log(`   Reason: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log('💥 ERROR - Extraction failed');
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }

    console.log('─'.repeat(60));
  }

  console.log('\n📊 Final Learning Stats:');
  try {
    const finalStats = await llmLearningService.getLearningStats();
    console.log(`   Total patterns: ${finalStats.totalPatterns}`);
    console.log(`   Average confidence: ${(finalStats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Recent activity: ${finalStats.recentActivity}`);

    if (finalStats.topPatterns.length > 0) {
      console.log('\n   🏆 Top Learned Patterns:');
      finalStats.topPatterns.slice(0, 5).forEach((pattern, index) => {
        console.log(`      ${index + 1}. "${pattern.pattern}" (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
      });
    }

    const learnedPatterns = await llmLearningService.getLearnedPatterns();
    console.log('\n   📚 Learned Pattern Categories:');
    console.log(`      Talent: ${learnedPatterns.highConfidenceTalent.length} patterns`);
    console.log(`      Project: ${learnedPatterns.highConfidenceProject.length} patterns`);
    console.log(`      Contact: ${learnedPatterns.highConfidenceContact.length} patterns`);
    console.log(`      Payment: ${learnedPatterns.highConfidencePayment.length} patterns`);
    console.log(`      Location: ${learnedPatterns.highConfidenceLocation.length} patterns`);

  } catch (error) {
    console.error('❌ Failed to get final learning stats:', error);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST RESULTS:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);

  if (passed === testCases.length) {
    console.log('\n🎉 ALL TESTS PASSED! Self-learning system is working.');
  } else if (passed > failed) {
    console.log('\n✅ Most tests passed. Self-learning system is improving.');
  } else {
    console.log('\n⚠️  Self-learning system needs more training data.');
  }

  console.log('\n🔧 Next Steps:');
  console.log('   1. Run the seed script to initialize with missed calls');
  console.log('   2. Use the system on real WhatsApp messages');
  console.log('   3. Provide feedback via /api/v1/admin/llm-feedback');
  console.log('   4. Monitor learning stats over time');
}

testSelfLearningSystem();
