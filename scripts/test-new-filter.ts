/**
 * Test the new pre-filter logic on recent posts
 */

const testPosts = [
  {
    title: "AlGaid - Film Release",
    content: "It's here! AlGaid just hit every cinema in the Gulf! #alghaid #movie",
  },
  {
    title: "Palestine 36 - Festival Announcement",
    content: "أعلن مهرجان تورنتو السينمائي الدولي عن أول الأفلام المشاركة في نسخته لعام 2025",
  },
  {
    title: "القيد - Film in Cinemas",
    content: "القيد في جميع دول الخليج الآن 🐪",
  },
  {
    title: "الزرفة - Release Date",
    content: "سجل عندك ✍️ ٣ يوليو بينزل فيلمنا الزرفة: الهروب من جحيم هنهونيا في جميع صالات السينما",
  },
  {
    title: "Partnership Announcement",
    content: "فخورين بهذه الشراكة 🤝 وإن شاء الله إنها بداية خير",
  },
  {
    title: "That Studio - Past Casting",
    content: "سعدنا باختيار مواهب سعودية رائعة لمشروعنا الأخير مع Apple. Casting incredible Saudi talents for our latest project with Apple.",
  },
  {
    title: "ACTUAL CASTING CALL (Example)",
    content: "مطلوب ممثلين للتقديم على دور بطولة في مسلسل درامي جديد. للتواصل وإرسال السيرة الذاتية آخر موعد 15 نوفمبر",
  },
  {
    title: "ACTUAL CASTING CALL (English)",
    content: "Casting call for lead role in upcoming film. Seeking actors age 25-35. Submit headshots and resume by December 1st.",
  }
];

// Copy the filter function
function isPotentiallyCastingCall(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // STRONG indicators - these alone are enough
  const strongCastingKeywords = [
    // English
    'casting call', 'casting now', 'now casting', 'open audition', 'open call',
    'seeking actors', 'seeking talent', 'talent needed', 'role available',
    'looking for actors', 'looking for talent', 'audition', 
    'actor needed', 'actress needed', 'talent search',
    
    // Arabic - Strong indicators
    'كاستنج', 'كاستينج', 'اختيار ممثلين', 'تجارب أداء',
    'مطلوب ممثل', 'مطلوب ممثلة', 'مطلوب ممثلين', 'مطلوب ممثلات',
    'نبحث عن ممثل', 'نبحث عن ممثلة', 'نبحث عن ممثلين',
    'فرصة تمثيل', 'اختبار أداء',
  ];
  
  // Application/Submission indicators
  const applicationKeywords = [
    // English
    'submit', 'apply now', 'send materials', 'submit resume', 'apply by',
    'deadline', 'closes on', 'application',
    
    // Arabic
    'تقديم', 'للتقديم', 'التقديم مفتوح', 'قدم', 'تقدم',
    'أرسل', 'إرسال', 'سيرة ذاتية', 'بورتفوليو',
    'للتواصل', 'تواصل معنا', 'راسلنا',
    'آخر موعد', 'الموعد النهائي',
  ];
  
  // Reject if has these keywords
  const rejectKeywords = [
    // English rejection keywords
    'screening', 'premiere', 'just finished', 'wrapped', 'congratulations',
    'workshop', 'course', 'training', 'film festival', 'won', 'award',
    'behind the scenes', 'bts', 'throwback', 'tbt', 'currently filming',
    'released', 'premiere night', 'red carpet', 'now in cinemas', 'in theaters',
    'hit every cinema', 'coming soon', 'available now',
    
    // Arabic rejection keywords - EXPANDED
    // Release/availability
    'الآن في', 'في جميع', 'في صالات', 'بينزل', 'انطلق', 'قريباً',
    
    // Workshops/Training
    'ورشة', 'ورش', 'دورة', 'دورات', 'تدريب', 'تدريبية', 'كورس',
    
    // Screenings/Events
    'عرض', 'عروض', 'مهرجان', 'مهرجانات', 'حفل', 'احتفال',
    'افتتاح', 'ختام', 'عرض خاص', 'عرض أول',
    
    // Past tense/Completed
    'انتهى', 'انتهى التصوير', 'اكتمل', 'تم', 'تم التصوير',
    'أنهينا', 'خلصنا', 'انتهينا', 'سعدنا باختيار', 'اخترنا',
    
    // Behind the scenes
    'خلف الكواليس', 'كواليس', 'بالكواليس', 'التحضير لشخصية',
    
    // Congratulations/Awards
    'مبروك', 'تهانينا', 'تهنئة', 'جائزة', 'جوائز', 'فوز', 'فاز', 'فخورين',
    
    // Personal updates/announcements
    'مشروعي', 'فيلمي', 'مسلسلي', 'عملي الجديد', 'أعلن', 'نفخر', 'سجل عندك'
  ];
  
  // Check for rejection keywords first
  const hasReject = rejectKeywords.some(kw => lowerContent.includes(kw));
  if (hasReject) {
    return false; // Immediate rejection
  }
  
  // Check for strong casting keywords
  const hasStrongCasting = strongCastingKeywords.some(kw => lowerContent.includes(kw));
  
  // Check for application keywords
  const hasApplication = applicationKeywords.some(kw => lowerContent.includes(kw));
  
  // PASS if: (strong casting keyword) OR (has both مطلوب AND application keyword)
  const hasMatlub = lowerContent.includes('مطلوب');
  
  return hasStrongCasting || (hasMatlub && hasApplication);
}

console.log('🧪 Testing New Pre-Filter Logic\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passed = 0;
let rejected = 0;

testPosts.forEach((post, i) => {
  const result = isPotentiallyCastingCall(post.content);
  const icon = result ? '✅ PASS' : '❌ REJECT';
  const expected = i >= 6 ? '✅' : '❌'; // Last 2 should pass
  const correct = (result && i >= 6) || (!result && i < 6);
  
  console.log(`${i + 1}. ${post.title}`);
  console.log(`   Result: ${icon}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   ${correct ? '✅ CORRECT' : '⚠️  INCORRECT'}\n`);
  
  if (result) passed++;
  else rejected++;
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 RESULTS:`);
console.log(`   Passed: ${passed}/8`);
console.log(`   Rejected: ${rejected}/8`);
console.log(`\n   Expected: 2 pass (actual casting calls), 6 reject (false positives)`);

