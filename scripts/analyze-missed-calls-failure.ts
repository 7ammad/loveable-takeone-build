/**
 * Analyze Why the 6 Missed Calls Failed the Original Filter
 * Break down exactly what each call had and what it was missing
 */

function analyzeMissedCalls() {
  console.log('🔍 Analyzing why the 6 missed calls failed the original filter...\n');

  const missedCalls = [
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

  // Original filter criteria (what the LLM was looking for)
  const originalCriteria = {
    talentKeywords: ['ممثلين', 'ممثل', 'ممثلة', 'actors'],
    needKeywords: ['مطلوب', 'نحتاج', 'نبحث عن', 'ونحتاج فيه'],
    contactKeywords: ['للتواصل', 'تابعو', 'أرسل', 'راسلنا', 'Snapchat', 'WhatsApp']
  };

  console.log('📋 ORIGINAL FILTER CRITERIA:');
  console.log('   Required ALL THREE:');
  console.log('   1. Call for actors/talent (ممثلين, ممثل, ممثلة, actors)');
  console.log('   2. Indicates need for talent (مطلوب, نحتاج, نبحث عن, ونحتاج فيه)');
  console.log('   3. Contact/application method (للتواصل, تابعو, أرسل, راسلنا, Snapchat, WhatsApp)');
  console.log('');

  missedCalls.forEach((call, index) => {
    console.log(`\n${index + 1}. 🎯 ${call.name}`);
    console.log('─'.repeat(80));

    // Analyze what the call HAS
    const has = [];
    const missing = [];

    // Check for talent keywords
    const hasTalentKeywords = originalCriteria.talentKeywords.some(keyword => 
      call.text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasTalentKeywords) {
      has.push('✅ Talent keywords (ممثلين/ممثل/ممثلة)');
    } else {
      missing.push('❌ Talent keywords (ممثلين/ممثل/ممثلة)');
    }

    // Check for need keywords
    const hasNeedKeywords = originalCriteria.needKeywords.some(keyword => 
      call.text.includes(keyword)
    );
    
    if (hasNeedKeywords) {
      has.push('✅ Need keywords (مطلوب/نحتاج/نبحث)');
    } else {
      missing.push('❌ Need keywords (مطلوب/نحتاج/نبحث)');
    }

    // Check for contact keywords
    const hasContactKeywords = originalCriteria.contactKeywords.some(keyword => 
      call.text.includes(keyword)
    );
    
    if (hasContactKeywords) {
      has.push('✅ Contact keywords (للتواصل/واتساب/ارسل)');
    } else {
      missing.push('❌ Contact keywords (للتواصل/واتساب/ارسل)');
    }

    console.log('   WHAT IT HAS:');
    has.forEach(item => console.log(`     ${item}`));

    console.log('\n   WHAT IT MISSED:');
    missing.forEach(item => console.log(`     ${item}`));

    // Show what it actually contains that should have been caught
    console.log('\n   🎯 ACTUAL CONTENT ANALYSIS:');
    
    // Check for alternative talent terms
    const alternativeTalentTerms = ['بنات', 'رجال', 'شباب', 'فتيات', 'اكسترا', 'مودل', 'شاب', 'بنت'];
    const foundAlternativeTerms = alternativeTalentTerms.filter(term => 
      call.text.includes(term)
    );
    
    if (foundAlternativeTerms.length > 0) {
      console.log(`     ✅ Has alternative talent terms: ${foundAlternativeTerms.join(', ')}`);
    }

    // Check for project terms
    const projectTerms = ['تصوير', 'فيلم', 'مسلسل', 'إعلان', 'فيديو', 'استوديو', 'براند'];
    const foundProjectTerms = projectTerms.filter(term => 
      call.text.includes(term)
    );
    
    if (foundProjectTerms.length > 0) {
      console.log(`     ✅ Has project terms: ${foundProjectTerms.join(', ')}`);
    }

    // Check for payment terms
    const paymentTerms = ['الأجر', 'المبلغ', 'ريال', 'مدفوع', '200', '500', '1500'];
    const foundPaymentTerms = paymentTerms.filter(term => 
      call.text.includes(term)
    );
    
    if (foundPaymentTerms.length > 0) {
      console.log(`     ✅ Has payment terms: ${foundPaymentTerms.join(', ')}`);
    }

    // Check for phone numbers
    const hasPhoneNumber = call.text.includes('+966') || /\d{10,}/.test(call.text);
    if (hasPhoneNumber) {
      console.log('     ✅ Has contact phone number');
    }

    // Check for dates
    const hasDates = call.text.includes('تاريخ') || call.text.includes('يوم') || 
                    call.text.includes('أكتوبر') || call.text.includes('نوفمبر');
    if (hasDates) {
      console.log('     ✅ Has dates/timing');
    }

    console.log('\n   🚨 WHY IT FAILED:');
    if (missing.length > 0) {
      console.log(`     Original filter required ALL 3 criteria, but missing: ${missing.length}`);
      console.log(`     Specifically missing: ${missing.join(', ')}`);
    }
    
    console.log('     The original filter was TOO RESTRICTIVE - it only looked for');
    console.log('     explicit "ممثلين" (actors) terms, but these calls used informal');
    console.log('     language like "بنات اكسترا", "مودل", "شاب وبنت"');

    console.log('─'.repeat(80));
  });

  console.log('\n🎯 SUMMARY OF FAILURES:');
  console.log('');
  console.log('❌ COMMON FAILURE PATTERNS:');
  console.log('   1. Used informal terms (بنات, رجال, مودل) instead of formal "ممثلين"');
  console.log('   2. Used "احتاج" instead of formal "نحتاج" or "مطلوب"');
  console.log('   3. Had WhatsApp numbers but not explicit "للتواصل" text');
  console.log('   4. Original filter was too rigid - required ALL 3 formal criteria');
  console.log('');
  console.log('✅ WHAT SHOULD HAVE CAUGHT THEM:');
  console.log('   - Alternative talent terms (اكسترا, مودل, بنات, رجال)');
  console.log('   - Project indicators (تصوير, فيديو, إعلان, استوديو)');
  console.log('   - Payment info (ريال, 200, 500, 1500)');
  console.log('   - Contact info (phone numbers, واتس)');
  console.log('   - Location info (الرياض, جدة)');
  console.log('');
  console.log('🔧 SOLUTION: Make filter INCLUSIVE instead of RESTRICTIVE');
  console.log('   - Accept ANY talent-seeking pattern, not just formal "ممثلين"');
  console.log('   - Accept project + payment + contact combinations');
  console.log('   - Prioritize catching real opportunities over perfect classification');
}

analyzeMissedCalls();
