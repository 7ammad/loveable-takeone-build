/**
 * Test processing a single WhatsApp message through the full pipeline
 * Tests: Pre-filter → LLM → Validation Queue
 */

import 'dotenv/config';
import { LlmCastingCallExtractionService } from '../packages/core-lib/src/llm-casting-call-extraction-service';

// Real casting call from WhatsApp
const realCastingCall = `هلا وسهلاً 

معاكم حنان الحربي 

من شركة Artdetails 

شركة انتاج سعوديه 

عندنا عمل سعودي 

ونحتاج فيه :

1- ممثلين سعودين جميع الأعمار وأطفال 
2- مخرجين سعودين 
3- مساعدين مخرجين سعودين 
4- كلاكيت سعودين 
5- ملابس سعودين 
6- ميك اب سعودين 
7- سواقين سعودين 
8- رنر سعودين 
….


تابعو كل جديدنا واعلانات على السناب 

https://snapchat.com/t/xe84Mhlt`;

// Pre-filter function (copy from workers-init.ts)
function isPotentiallyCastingCall(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  const strongCastingKeywords = [
    'casting call', 'casting now', 'now casting', 'open audition', 'open call',
    'seeking actors', 'seeking talent', 'talent needed', 'role available',
    'looking for actors', 'looking for talent', 'audition', 
    'actor needed', 'actress needed', 'talent search',
    'كاستنج', 'كاستينج', 'اختيار ممثلين', 'تجارب أداء',
    'مطلوب ممثل', 'مطلوب ممثلة', 'مطلوب ممثلين', 'مطلوب ممثلات',
    'نبحث عن ممثل', 'نبحث عن ممثلة', 'نبحث عن ممثلين',
    'فرصة تمثيل', 'اختبار أداء',
  ];
  
  const applicationKeywords = [
    'submit', 'apply now', 'send materials', 'submit resume', 'apply by',
    'deadline', 'closes on', 'application',
    'تقديم', 'للتقديم', 'التقديم مفتوح', 'قدم', 'تقدم',
    'أرسل', 'إرسال', 'سيرة ذاتية', 'بورتفوليو',
    'للتواصل', 'تواصل معنا', 'راسلنا',
    'آخر موعد', 'الموعد النهائي',
  ];
  
  const rejectKeywords = [
    'screening', 'premiere', 'just finished', 'wrapped', 'congratulations',
    'workshop', 'course', 'training', 'film festival', 'won', 'award',
    'behind the scenes', 'bts', 'throwback', 'tbt', 'currently filming',
    'released', 'premiere night', 'red carpet', 'now in cinemas', 'in theaters',
    'hit every cinema', 'coming soon', 'available now',
    'الآن في', 'في جميع', 'في صالات', 'بينزل', 'انطلق', 'قريباً',
    'ورشة', 'ورش', 'دورة', 'دورات', 'تدريب', 'تدريبية', 'كورس',
    'عرض', 'عروض', 'مهرجان', 'مهرجانات', 'حفل', 'احتفال',
    'افتتاح', 'ختام', 'عرض خاص', 'عرض أول',
    'انتهى', 'انتهى التصوير', 'اكتمل', 'تم', 'تم التصوير',
    'أنهينا', 'خلصنا', 'انتهينا', 'سعدنا باختيار', 'اخترنا',
    'خلف الكواليس', 'كواليس', 'بالكواليس', 'التحضير لشخصية',
    'مبروك', 'تهانينا', 'تهنئة', 'جائزة', 'جوائز', 'فوز', 'فاز', 'فخورين',
    'مشروعي', 'فيلمي', 'مسلسلي', 'عملي الجديد', 'أعلن', 'نفخر', 'سجل عندك'
  ];
  
  const hasReject = rejectKeywords.some(kw => lowerContent.includes(kw));
  if (hasReject) {
    return false;
  }
  
  const hasStrongCasting = strongCastingKeywords.some(kw => lowerContent.includes(kw));
  const hasApplication = applicationKeywords.some(kw => lowerContent.includes(kw));
  const hasMatlub = lowerContent.includes('مطلوب');
  const hasNahtaj = lowerContent.includes('نحتاج') || lowerContent.includes('ونحتاج');
  
  return hasStrongCasting || (hasMatlub && hasApplication) || (hasNahtaj && lowerContent.includes('ممثل'));
}

async function testPipeline() {
  console.log('🧪 Testing WhatsApp Message Processing Pipeline\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // STEP 1: Pre-Filter
  console.log('1️⃣  PRE-FILTER TEST\n');
  console.log('Message content:');
  console.log(realCastingCall);
  console.log('\n' + '-'.repeat(50) + '\n');

  const passesPreFilter = isPotentiallyCastingCall(realCastingCall);
  console.log(`Result: ${passesPreFilter ? '✅ PASS' : '❌ REJECT'}`);
  
  if (!passesPreFilter) {
    console.log('\n❌ Pre-filter rejected this message!');
    console.log('   This is a FALSE NEGATIVE - the filter is too strict\n');
    process.exit(1);
  }

  console.log('✅ Pre-filter correctly identified as potential casting call\n');

  // STEP 2: LLM Extraction
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('2️⃣  LLM EXTRACTION TEST\n');
  console.log('Sending to GPT-4o-mini for extraction...\n');

  const llmService = new LlmCastingCallExtractionService();
  
  try {
    const result = await llmService.extractCastingCallFromText(realCastingCall);

    if (!result.success || !result.data) {
      console.log('❌ LLM REJECTED this message!');
      console.log(`   Reason: ${result.error}\n`);
      console.log('   This is likely a FALSE NEGATIVE if the message is legitimate\n');
      process.exit(1);
    }

    console.log('✅ LLM successfully extracted casting call data!\n');
    console.log('Extracted Data:');
    console.log(JSON.stringify(result.data, null, 2));
    console.log('');

    // STEP 3: Validation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('3️⃣  DATA QUALITY CHECK\n');

    const data = result.data;
    const checks = {
      hasTitle: !!data.title && data.title.length > 0,
      hasDescription: !!data.description && data.description.length > 0,
      hasCompany: !!data.company && data.company.length > 0,
      hasLocation: !!data.location && data.location.length > 0,
      hasContact: !!data.contactInfo && data.contactInfo.length > 0,
    };

    console.log(`Title: ${checks.hasTitle ? '✅' : '❌'} "${data.title}"`);
    console.log(`Description: ${checks.hasDescription ? '✅' : '❌'} (${data.description?.length || 0} chars)`);
    console.log(`Company: ${checks.hasCompany ? '✅' : '❌'} "${data.company}"`);
    console.log(`Location: ${checks.hasLocation ? '✅' : '❌'} "${data.location}"`);
    console.log(`Contact: ${checks.hasContact ? '✅' : '❌'} "${data.contactInfo}"`);
    console.log(`Requirements: ${data.requirements ? '✅' : '⏭️ '} (${data.requirements?.length || 0} chars)`);
    console.log(`Deadline: ${data.deadline ? '✅' : '⏭️ '} "${data.deadline}"`);
    console.log('');

    const allRequired = checks.hasTitle && checks.hasDescription && checks.hasCompany;
    
    if (!allRequired) {
      console.log('⚠️  Missing required fields! This might fail validation\n');
    } else {
      console.log('✅ All required fields present!\n');
    }

    // SUMMARY
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 PIPELINE TEST SUMMARY:\n');
    console.log('   1. Pre-Filter: ✅ PASS');
    console.log('   2. LLM Extraction: ✅ SUCCESS');
    console.log('   3. Data Quality: ' + (allRequired ? '✅ GOOD' : '⚠️  INCOMPLETE'));
    console.log('');
    console.log('🎯 VERDICT: This message would create a casting call in the validation queue!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ LLM extraction failed:', error.message);
    process.exit(1);
  }
}

testPipeline()
  .catch(console.error);

