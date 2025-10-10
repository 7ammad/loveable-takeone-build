/**
 * Test Updated LLM Filtering Logic
 * Test the improved filtering on the missed casting calls
 */

import 'dotenv/config';
import { LlmCastingCallExtractionService } from '@packages/core-lib';

async function testUpdatedFiltering() {
  console.log('🧪 Testing updated LLM filtering logic...\n');

  const extractionService = new LlmCastingCallExtractionService();

  // The missed casting calls we want to test
  const testCases = [
    {
      name: 'Riyadh Female Extras',
      text: `السلام عليكم جميعاً

التصوير في الرياض 🔴

عندنا تصوير في تاريخ 13  او 14 او 15 اكتوبر 🔴

احتاج بنات اكسترا من عمر 20-40 🔴

المبلغ  200 🔴

رقم التواصل
+966 58 188 3051`
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
للمهتمات، الرجاء كتابة "تم" للمتابعة.`
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
+966 57 162 7155`
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
wa.me/966540544908`
    },
    {
      name: 'Studio Clothing Brand',
      text: `نحتاج مودل بنت عمرها 16 سنة.
أرجو ارسال الصور وتفاصيل القياسات (الطول من الكتف إلى الكعبين + عرض الاكتاف)
التصوير في الاستوديو لبراند ملابس .
مدينة جدة 🌻
واتس / 0534881999`
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
التواصل مع الرقم مو انا ☝️`
    }
  ];

  let passed = 0;
  let failed = 0;

  console.log('='.repeat(80));

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('─'.repeat(60));

    try {
      const result = await extractionService.extractCastingCallFromText(testCase.text);

      if (result.success) {
        console.log('✅ PASSED - Extracted as casting call');
        console.log(`   Title: ${result.data?.title}`);
        console.log(`   Location: ${result.data?.location}`);
        console.log(`   Payment: ${result.data?.compensation}`);
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

  console.log('\n' + '='.repeat(80));
  console.log(`📊 RESULTS:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);

  if (passed === testCases.length) {
    console.log('\n🎉 ALL TESTS PASSED! LLM filtering is now more inclusive.');
  } else if (passed > failed) {
    console.log('\n✅ Most tests passed. LLM filtering has improved significantly.');
  } else {
    console.log('\n⚠️  LLM filtering still needs more work.');
  }
}

testUpdatedFiltering();
