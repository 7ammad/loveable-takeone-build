/**
 * Manually Queue Found Casting Calls
 * Queue the 2 perfect Saudi casting calls we found for LLM processing
 */

import 'dotenv/config';
import { scrapedRolesQueue } from '@packages/core-queue';
import { prisma } from '@packages/core-db';

async function queueFoundCastingCalls() {
  console.log('📤 Manually queuing found casting calls...\n');

  try {
    // Get the source IDs for WhatsApp groups
    const whatsappSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    const sourceMap = new Map();
    whatsappSources.forEach(source => {
      sourceMap.set(source.sourceIdentifier, source.id);
    });

    // The 2 perfect casting calls we found
    const castingCalls = [
      {
        groupId: '120363321492808704@g.us', // Actors & Actresses
        messageId: 'P5V4dT2B_XFOXA-gvABq53NnZCkAA',
        text: `السلام عليكم جميعاً

التصوير في الرياض 🔴

عندنا تصوير في تاريخ 13  او 14 او 15 اكتوبر 🔴

احتاج بنات اكسترا من عمر 20-40 🔴

المبلغ  200 🔴


رقم التواصل
+966 58 188 3051`,
        timestamp: '2025-10-09T17:33:27.000Z'
      },
      {
        groupId: '120363321492808704@g.us', // Actors & Actresses  
        messageId: 'OtwBFKDsNMvAgw-gggBq53guz9QKA',
        text: `📣 فرصة تصوير في جدة! 🎬

نبحث عن بنات للمشاركة في تصوير إعلان في مدينة جدة نهاية شهر أكتوبر (الموعد الدقيق سيتم تأكيده لاحقًا).                                 

💰 الأجر: 1500 ريال
🕒 مدة العمل: 12 ساعة
⚽️ الشرط الأساسي: معرفة بأساسيات كرة القدم فقط (ليس لعبًا احترافيً  ا)                                                                 
وفتاه سعوديه

إذا كنتِ مهتمة، أرسلي لنا صورك الحديثة + معلوماتك الشخصية على الواتساب`,
        timestamp: '2025-10-09T17:14:33.000Z'
      }
    ];

    let queued = 0;

    for (const call of castingCalls) {
      const sourceId = sourceMap.get(call.groupId);
      if (!sourceId) {
        console.log(`❌ No source ID found for group ${call.groupId}`);
        continue;
      }

      try {
        // Queue for LLM processing
        await scrapedRolesQueue.add('whatsapp-message', {
          sourceId: sourceId,
          sourceUrl: `whatsapp://group/${call.groupId}/message/${call.messageId}`,
          rawMarkdown: call.text,
          scrapedAt: call.timestamp
        });

        console.log(`✅ Queued casting call ${call.messageId}`);
        console.log(`   Preview: ${call.text.substring(0, 100)}...`);
        console.log(`   Source: ${call.groupId}`);
        console.log('');

        queued++;

      } catch (error) {
        console.error(`❌ Failed to queue ${call.messageId}:`, error);
      }
    }

    console.log(`🎯 Successfully queued ${queued}/${castingCalls.length} casting calls for LLM processing!`);

    // Check queue status
    const waiting = await scrapedRolesQueue.getWaiting();
    const active = await scrapedRolesQueue.getActive();
    
    console.log(`\n📊 Queue Status:`);
    console.log(`   Waiting: ${waiting.length}`);
    console.log(`   Active: ${active.length}`);

    if (waiting.length > 0) {
      console.log(`\n💡 The Digital Twin workers will process these automatically.`);
      console.log(`   Check the admin dashboard or queue status to see progress.`);
    }

  } catch (error) {
    console.error('❌ Error queuing casting calls:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queueFoundCastingCalls();

