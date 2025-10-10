/**
 * Test with Real Casting Call Message
 * Bypasses WhatsApp and directly tests the pipeline with a known casting call
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';
import { scrapedRolesQueue } from '@packages/core-queue';

// Real casting call from Saudi WhatsApp groups (known to work)
const realCastingCall = `🎬 كاستنج مفتوح - مسلسل رمضاني

نحتاج فيه:
1- ممثلين سعوديين (ذكور)
   العمر: 25-35 سنة
   الطول: 175 سم وأكثر
   الخبرة: سنتين على الأقل

2- ممثلات سعوديات
   العمر: 22-30 سنة
   الخبرة: مطلوبة

📍 الموقع: الرياض - استوديوهات MBC
💰 التصوير مدفوع (حسب الخبرة)
📅 آخر موعد للتقديم: ٢٥ ديسمبر ٢٠٢٤
🎥 نوع المشروع: مسلسل درامي (30 حلقة)

للتواصل والتقديم:
تابعونا على السناب: castingriyadh
او راسلونا واتساب: 0505551234

#كاستنج #ممثلين #الرياض #مسلسل_رمضان`;

async function testRealCastingCall() {
  console.log('🎬 Testing with REAL Casting Call Message\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get first active source
    const source = await prisma.ingestionSource.findFirst({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    if (!source) {
      console.log('❌ No active WhatsApp sources');
      process.exit(1);
    }

    console.log(`📱 Using source: ${source.sourceName}\n`);

    // Create unique message ID
    const testMessageId = `test-casting-${Date.now()}`;

    // Check if already processed (shouldn't be)
    const existing = await prisma.processedMessage.findUnique({
      where: { whatsappMessageId: testMessageId }
    });

    if (existing) {
      console.log('⚠️  Message already exists, using new ID');
    }

    // Mark as processed
    await prisma.processedMessage.create({
      data: {
        whatsappMessageId: testMessageId,
        sourceId: source.id
      }
    });

    console.log('1️⃣  Message Details:\n');
    console.log(`   Message ID: ${testMessageId}`);
    console.log(`   Source: ${source.sourceName}`);
    console.log(`   Text Length: ${realCastingCall.length} characters`);
    console.log(`   Content Preview: "${realCastingCall.substring(0, 80)}..."\n`);

    // Queue for processing
    console.log('2️⃣  Adding to scraped-roles queue...\n');
    
    await scrapedRolesQueue.add('test-real-casting-call', {
      sourceId: source.id,
      sourceUrl: `whatsapp://group/${source.sourceIdentifier}/message/${testMessageId}`,
      rawMarkdown: realCastingCall,
      scrapedAt: new Date().toISOString()
    });

    console.log('✅ Message queued successfully!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Next Steps:\n');
    console.log('   1. Make sure workers are running (they should be)');
    console.log('   2. Wait 30-60 seconds for processing');
    console.log('   3. Run: npx tsx scripts/quick-test-portal.ts');
    console.log('   4. You should see 1 casting call in validation queue!\n');

    console.log('💡 Expected Result:\n');
    console.log('   Title: كاستنج مفتوح - مسلسل رمضاني');
    console.log('   Company: MBC (extracted)');
    console.log('   Location: الرياض');
    console.log('   Status: pending_review\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 1000);
  }
}

testRealCastingCall();

