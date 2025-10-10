/**
 * Add Missed Casting Calls to Database
 * Manually add the 6 legitimate casting calls that were missed
 */

import 'dotenv/config';
import { prisma } from '@packages/core-db';

async function addMissedCastingCalls() {
  console.log('🎯 Adding missed casting calls to database...\n');

  const missedCalls = [
    {
      title: 'Riyadh Female Extras - October 13-15',
      description: 'التصوير في الرياض - عندنا تصوير في تاريخ 13 او 14 او 15 اكتوبر - احتاج بنات اكسترا من عمر 20-40',
      location: 'Riyadh',
      date: 'October 13, 14, or 15, 2024',
      requirements: 'Female extras aged 20-40',
      payment: '200 SAR',
      contact: '+966 58 188 3051',
      source: 'WhatsApp Groups',
      messageId: 'P5V4dT2B_XFOXA-gvABq53NnZCkAA',
      rawText: `السلام عليكم جميعاً

التصوير في الرياض 🔴

عندنا تصوير في تاريخ 13  او 14 او 15 اكتوبر 🔴

احتاج بنات اكسترا من عمر 20-40 🔴

المبلغ  200 🔴

رقم التواصل
+966 58 188 3051`
    },
    {
      title: 'Jeddah Commercial - End of October',
      description: 'فرصة تصوير في جدة - نبحث عن بنات للمشاركة في تصوير إعلان',
      location: 'Jeddah',
      date: 'End of October 2024',
      requirements: 'Saudi girls with basic football knowledge',
      payment: '1500 SAR (12 hours)',
      contact: '+966 53 455 1303',
      source: 'WhatsApp Groups',
      messageId: 'OtwBFKDsNMvAgw-gggBq53guz9QKA',
      rawText: `📣 فرصة تصوير في جدة! 🎬

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
      title: 'Jeddah Restaurant Video - Sunday',
      description: 'احتاج لتصوير فيديو لمطعم - يوم الاحد بمدينة جدة',
      location: 'Jeddah',
      date: 'Sunday',
      requirements: 'Young man + girl with curly hair (beach style), ages 20-26',
      payment: 'Not specified',
      contact: '+966 57 162 7155',
      source: 'WhatsApp Groups',
      messageId: 'restaurant-video-jeddah',
      rawText: `مسا الخير
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
      title: 'Jeddah Short Series - Extra Role',
      description: 'نحتاج رجال اعمارهم من ٤٥-٥٥ سنه - دور اكسترا في مسلسل قصير',
      location: 'Jeddah',
      date: 'Not specified',
      requirements: 'Men aged 45-55, traditional attire (thobe + shemagh)',
      payment: '200 SAR',
      contact: 'wa.me/966540544908',
      source: 'WhatsApp Groups',
      messageId: 'short-series-jeddah',
      rawText: `السلام عليكم
محتاجين رجال اعمارهم من ٤٥-٥٥ سنه
دور اكسترا في مسلسل قصير في مجلس اجتماع تصوير ٤-٥ ساعات
الريت ۲۰۰ ریال
ارسل معلوماتك كامله و صوره لك بثوب و شماغ
مدينة جده
رابط المحادثه
wa.me/966540544908`
    },
    {
      title: 'Studio Clothing Brand - Jeddah',
      description: 'نحتاج مودل بنت عمرها 16 سنة - التصوير في الاستوديو لبراند ملابس',
      location: 'Jeddah (Studio)',
      date: 'Not specified',
      requirements: 'Female model, 16 years old - send photos and measurements',
      payment: 'Not specified',
      contact: '+966 53 488 1999',
      source: 'WhatsApp Groups',
      messageId: 'studio-clothing-jeddah',
      rawText: `نحتاج مودل بنت عمرها 16 سنة.
أرجو ارسال الصور وتفاصيل القياسات (الطول من الكتف إلى الكعبين + عرض الاكتاف)
التصوير في الاستوديو لبراند ملابس .
مدينة جدة 🌻
واتس / 0534881999`
    },
    {
      title: 'Beachwear Photoshoot - Jeddah',
      description: 'عندي تصوير يوم ١٧ الشهر هذا - احتاج فقط بنات (بالعشرينات - ثلاثينات)',
      location: 'Jeddah',
      date: '17th of this month',
      requirements: 'Girls (20s-30s), beachwear (modest)',
      payment: '500 SAR',
      contact: '+966 56 607 8835',
      source: 'WhatsApp Groups',
      messageId: 'beachwear-photoshoot-jeddah',
      rawText: `مساء الخير اهل جدة
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

  try {
    let added = 0;
    let skipped = 0;

    for (const call of missedCalls) {
      // Check if already exists
      const existing = await prisma.castingCall.findFirst({
        where: {
          OR: [
            { contentHash: call.messageId },
            { 
              AND: [
                { location: call.location },
                { title: { contains: call.title.split(' - ')[0] } }
              ]
            }
          ]
        }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${call.title} (already exists)`);
        skipped++;
        continue;
      }

      // Create the casting call
      const castingCall = await prisma.castingCall.create({
        data: {
          title: call.title,
          description: call.description,
          location: call.location,
          compensation: call.payment,
          requirements: call.requirements,
          contactInfo: call.contact,
          sourceName: call.source,
          contentHash: call.messageId,
          status: 'published',
          projectType: 'Film/Commercial'
        }
      });

      console.log(`✅ Added: ${call.title}`);
      console.log(`   Location: ${call.location}`);
      console.log(`   Payment: ${call.compensation}`);
      console.log(`   Contact: ${call.contactInfo}\n`);
      
      added++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Added: ${added} casting calls`);
    console.log(`   Skipped: ${skipped} (already exist)`);
    console.log(`   Total processed: ${missedCalls.length}`);

    // Show all casting calls in database
    const totalCalls = await prisma.castingCall.count();
    console.log(`\n🎯 Total casting calls in database: ${totalCalls}`);

  } catch (error) {
    console.error('❌ Failed to add casting calls:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissedCastingCalls();
