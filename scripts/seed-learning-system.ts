/**
 * Seed Learning System with Missed Calls
 * Initialize the LLM learning system with patterns from the 6 missed calls
 */

import 'dotenv/config';
import { llmLearningService } from '@packages/core-lib';

async function seedLearningSystem() {
  console.log('🌱 Seeding LLM learning system with missed call patterns...\n');

  const missedCalls = [
    {
      name: 'Riyadh Female Extras',
      text: `السلام عليكم جميعاً

التصوير في الرياض 🔴

عندنا تصوير في تاريخ 13  او 14 او 15 اكتوبر 🔴

احتاج بنات اكسترا من عمر 20-40 🔴

المبلغ  200 🔴

رقم التواصل
+966 58 188 3051`,
      shouldBeCaught: true
    },
    {
      name: 'Jeddah Commercial',
      text: `📣 فرصة تصوير في جدة! 🎬

نبحث عن بنات للمشاركة في تصوير إعلان في مدينة جدة نهاية شهر أكتوبر (الموعد الدقيق سيتم تأكيده لاحقًا).

💰 الأجر: 1500 ريال
🕒 مدة العمل: 12 ساعة
⚽️ الشرط الأساسي: معرفة بأساسيات كرة القدم فقط (ليس لعبًا احترافيًا)
وفتاه سعوديه

إذا كنتِ مهتمة، أرسلي لنا صورك الحديثة + معلومات التواصل 💬
+966 53 455 1303
للمهتمات، الرجاء كتابة "تم" للمتابعة.`,
      shouldBeCaught: true
    },
    {
      name: 'Jeddah Restaurant Video',
      text: `مسا الخير
احتاج لتصوير فيديو لمطعم
يوم الاحد بمدينة :
( جدة )
. احتاج شاب وبنت
بنت شعرها كيرلي
وشاب ستايل بحر
الوقت: 12 الظهر
العمر : من 20 - 26
مدة التصوير : من ٥ ل ٦ ساعات
للمشاركة الرجاء ارسال صورة والاسم
ولعمر ولمدينة واتس فقط :
+966 57 162 7155`,
      shouldBeCaught: true
    },
    {
      name: 'Jeddah Short Series',
      text: `السلام عليكم
محتاجين رجال اعمارهم من ٤٥-٥٥ سنه
دور اكسترا في مسلسل قصير في مجلس اجتماع تصوير ٤-٥ ساعات
الريت ۲۰۰ ریال
ارسل معلوماتك كامله و صوره لك بثوب و شماغ
مدينة جده
رابط المحادثه
wa.me/966540544908`,
      shouldBeCaught: true
    },
    {
      name: 'Studio Clothing Brand',
      text: `نحتاج مودل بنت عمرها 16 سنة.
أرجو ارسال الصور وتفاصيل القياسات (الطول من الكتف إلى الكعبين + عرض الاكتاف)
التصوير في الاستوديو لبراند ملابس .
مدينة جدة 🌻
واتس / 0534881999`,
      shouldBeCaught: true
    },
    {
      name: 'Beachwear Photoshoot',
      text: `مساء الخير اهل جدة
عندي تصوير يوم ١٧ الشهر هذا
احتاج فقط بنات (بالعشرينات - ثلاثينات)
ما عندهم مشكلة يلبسوا ملابس بحر
بس طبعا حتكون محتشمة
بس انه فساتين مثلا نص كم كدا اشيا اليومية ٥٠٠ ريال
٦-٨ ساعات
للتواصل
+966566078835
جدة
التواصل مع الرقم مو انا ☝️`,
      shouldBeCaught: true
    }
  ];

  console.log(`📚 Teaching system about ${missedCalls.length} missed calls...\n`);

  for (const call of missedCalls) {
    console.log(`🧠 Learning from: ${call.name}`);
    
    try {
      await llmLearningService.learnFromMissedCall(
        call.text,
        true, // wasMissed
        call.shouldBeCaught, // correctClassification
        'correct' // userFeedback - these should have been caught
      );
      
      console.log(`   ✅ Patterns extracted and learned`);
    } catch (error) {
      console.error(`   ❌ Failed to learn from ${call.name}:`, error);
    }
  }

  // Show learning statistics
  console.log('\n📊 Learning System Statistics:');
  try {
    const stats = await llmLearningService.getLearningStats();
    console.log(`   Total patterns learned: ${stats.totalPatterns}`);
    console.log(`   Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Recent activity (7 days): ${stats.recentActivity}`);
    
    if (stats.topPatterns.length > 0) {
      console.log('\n   🏆 Top Learned Patterns:');
      stats.topPatterns.slice(0, 10).forEach((pattern, index) => {
        console.log(`      ${index + 1}. "${pattern.pattern}" (${(pattern.confidence * 100).toFixed(1)}% confidence, ${pattern.occurrences} occurrences)`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to get learning stats:', error);
  }

  console.log('\n🎯 Learning system seeded successfully!');
  console.log('   The LLM will now prioritize these patterns in future extractions.');
}

seedLearningSystem();
