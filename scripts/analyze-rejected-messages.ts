/**
 * Analyze Rejected Messages
 * Check what messages were processed but didn't make it to validation queue
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';

// Same pre-filter function from workers
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
  const hasMomathel = lowerContent.includes('ممثل');
  
  return hasStrongCasting || (hasMatlub && hasApplication) || (hasNahtaj && hasMomathel && hasApplication);
}

async function analyzeRejectedMessages() {
  try {
    const whapiService = new WhapiService();

    // Get all active sources
    const sources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    console.log(`📊 Analyzing messages from ${sources.length} groups\n`);

    let totalMessages = 0;
    let passedPreFilter = 0;
    let failedPreFilter = 0;
    let alreadyProcessed = 0;
    let tooOld = 0;

    const passedMessages: any[] = [];

    for (const source of sources) {
      console.log(`\n📱 ${source.sourceName}`);
      
      const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 20);
      console.log(`   Fetched: ${messages.length} messages`);

      let passed = 0;
      let failed = 0;

      for (const message of messages) {
        totalMessages++;

        // Check if recent
        if (!whapiService.isMessageRecent(message, 7)) {
          tooOld++;
          continue;
        }

        // Check if already processed
        const existing = await prisma.processedMessage.findUnique({
          where: { whatsappMessageId: message.id }
        });

        if (existing) {
          alreadyProcessed++;
          continue;
        }

        // Extract text
        const text = whapiService.extractTextFromMessage(message);
        if (!text || text.length < 30) continue;

        // Test pre-filter
        const passesFilter = isPotentiallyCastingCall(text);

        if (passesFilter) {
          passed++;
          passedPreFilter++;
          passedMessages.push({
            group: source.sourceName,
            text: text.substring(0, 150),
            messageId: message.id
          });
        } else {
          failed++;
          failedPreFilter++;
        }
      }

      console.log(`   Passed pre-filter: ${passed}`);
      console.log(`   Failed pre-filter: ${failed}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Overall Statistics:\n');
    console.log(`   Total messages checked: ${totalMessages}`);
    console.log(`   Already processed: ${alreadyProcessed}`);
    console.log(`   Too old (>7 days): ${tooOld}`);
    console.log(`   Passed pre-filter: ${passedPreFilter}`);
    console.log(`   Failed pre-filter: ${failedPreFilter}\n`);

    if (passedMessages.length > 0) {
      console.log(`✅ Messages that PASSED pre-filter (${passedMessages.length}):\n`);
      passedMessages.forEach((msg, i) => {
        console.log(`${i + 1}. [${msg.group}]`);
        console.log(`   "${msg.text}..."`);
        console.log(`   Message ID: ${msg.messageId}\n`);
      });

      console.log('💡 These messages should be queued for LLM processing!');
      console.log('   Run: npx tsx scripts/test-fresh-batch.ts to queue them\n');
    } else {
      console.log('⚠️  NO messages passed pre-filter!\n');
      console.log('This means either:');
      console.log('1. All messages are already processed');
      console.log('2. Pre-filter is too strict');
      console.log('3. No new casting calls in recent messages\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

analyzeRejectedMessages();

