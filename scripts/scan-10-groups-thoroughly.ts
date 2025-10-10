/**
 * Thoroughly Scan the 10 Active WhatsApp Groups
 * Find every potential casting call we might have missed
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '@packages/core-db';

async function scanTenGroupsThoroughly() {
  console.log('🔍 Thoroughly scanning the 10 active WhatsApp groups...\n');

  try {
    const whapiService = new WhapiService();

    // Get the 10 active groups from database
    const sources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      },
      orderBy: {
        sourceName: 'asc'
      }
    });

    console.log(`📱 Scanning ${sources.length} active groups\n`);
    console.log('─'.repeat(80));

    const allPotentialCalls: Array<{
      groupName: string;
      groupId: string;
      messageId: string;
      text: string;
      timestamp: Date;
      confidence: 'HIGH' | 'MEDIUM';
      reasons: string[];
    }> = [];

    let totalMessages = 0;

    // Scan each group
    for (const source of sources) {
      console.log(`\n📱 ${source.sourceName}`);
      console.log(`   ID: ${source.sourceIdentifier}`);
      
      try {
        // Fetch last 100 messages (increased from default)
        const messages = await whapiService.getGroupMessages(source.sourceIdentifier, 100);
        console.log(`   Messages: ${messages.length}`);
        
        totalMessages += messages.length;

        let foundInGroup = 0;

        // Check each message
        for (const message of messages) {
          const text = whapiService.extractTextFromMessage(message);
          
          if (text && text.length > 50) {
            const analysis = analyzeCastingPotential(text);
            
            if (analysis.confidence !== 'LOW') {
              allPotentialCalls.push({
                groupName: source.sourceName,
                groupId: source.sourceIdentifier,
                messageId: message.id,
                text: text,
                timestamp: new Date(message.timestamp * 1000),
                confidence: analysis.confidence,
                reasons: analysis.reasons
              });
              foundInGroup++;
            }
          }
        }

        console.log(`   Found: ${foundInGroup} potential casting call(s)`);
        
      } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      console.log('─'.repeat(80));
    }

    // Sort by confidence and date
    const sortedCalls = allPotentialCalls.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return a.confidence === 'HIGH' ? -1 : 1;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    const highConfidence = sortedCalls.filter(c => c.confidence === 'HIGH');
    const mediumConfidence = sortedCalls.filter(c => c.confidence === 'MEDIUM');

    console.log(`\n\n📊 SCAN RESULTS:`);
    console.log(`   Total messages scanned: ${totalMessages}`);
    console.log(`   High confidence: ${highConfidence.length}`);
    console.log(`   Medium confidence: ${mediumConfidence.length}\n`);

    // Display HIGH confidence calls
    console.log('🎯 HIGH CONFIDENCE CASTING CALLS:\n');
    console.log('='.repeat(80));

    if (highConfidence.length === 0) {
      console.log('   No high confidence casting calls found.\n');
    } else {
      highConfidence.forEach((call, index) => {
        console.log(`\n${index + 1}. 📱 ${call.groupName}`);
        console.log(`   Message ID: ${call.messageId}`);
        console.log(`   Time: ${call.timestamp.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}`);
        console.log(`   Confidence: ${call.confidence}`);
        console.log(`   Reasons: ${call.reasons.join(', ')}`);
        console.log(`\n   📝 Full Text:`);
        console.log(`   ${call.text}`);
        console.log('\n' + '─'.repeat(80));
      });
    }

    // Display MEDIUM confidence calls
    if (mediumConfidence.length > 0) {
      console.log(`\n\n⚠️  MEDIUM CONFIDENCE POTENTIAL CALLS:\n`);
      console.log('='.repeat(80));
      
      mediumConfidence.slice(0, 10).forEach((call, index) => {
        console.log(`\n${index + 1}. 📱 ${call.groupName}`);
        console.log(`   Time: ${call.timestamp.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}`);
        console.log(`   Reasons: ${call.reasons.join(', ')}`);
        console.log(`\n   📝 Text Preview:`);
        console.log(`   ${call.text.substring(0, 300)}${call.text.length > 300 ? '...' : ''}`);
        console.log('\n' + '─'.repeat(80));
      });
    }

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('scan-10-groups-results.json', JSON.stringify({
      scanDate: new Date().toISOString(),
      totalGroups: sources.length,
      totalMessages: totalMessages,
      results: sortedCalls
    }, null, 2));

    console.log(`\n💾 Full results saved to: scan-10-groups-results.json`);

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Analyze text for casting call potential with Saudi-specific patterns
 */
function analyzeCastingPotential(text: string): { confidence: 'HIGH' | 'MEDIUM' | 'LOW', reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // HIGH confidence - explicit casting indicators
  const castingKeywords = [
    'مطلوب ممثل', 'مطلوب ممثلة', 'نحتاج ممثل', 'نحتاج ممثلة',
    'كاستنج', 'كاستينج', 'احتاج بنات', 'احتاج رجال',
    'نبحث عن بنات', 'نبحث عن ممثل',
    'بنات اكسترا', 'رجال اكسترا', 'extras',
    'تقديم على الدور', 'اختبار أداء',
  ];

  // Location + timing (strong signals)
  const contextKeywords = [
    'التصوير في الرياض', 'تصوير في جدة', 'تصوير في',
    'مواعيد التيست', 'مواعيد', 'تاريخ',
  ];

  // Payment indicators (very strong for casting)
  const paymentKeywords = [
    'الأجر', 'المبلغ', 'ريال', 'مدفوع',
  ];

  // Contact/application
  const contactKeywords = [
    'للتواصل', 'رقم التواصل', '+966', '05',
    'راسلنا', 'أرسلي', 'واتساب'
  ];

  // Check casting keywords
  for (const keyword of castingKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Casting term: "${keyword}"`);
      score += 5;
    }
  }

  // Check context
  for (const keyword of contextKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Context: "${keyword}"`);
      score += 3;
    }
  }

  // Check payment
  for (const keyword of paymentKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Payment info: "${keyword}"`);
      score += 3;
    }
  }

  // Check contact
  for (const keyword of contactKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Contact info: "${keyword}"`);
      score += 2;
    }
  }

  // Age/gender requirements
  if (text.match(/عمر|من \d+|age/i)) {
    reasons.push('Age requirements');
    score += 1;
  }

  // Date patterns
  if (text.match(/\d{1,2}\/\d{1,2}/) || text.match(/تاريخ \d+/) || text.match(/\d+ أكتوبر|\d+ نوفمبر/)) {
    reasons.push('Has dates');
    score += 2;
  }

  // Determine confidence
  if (score >= 8) {
    return { confidence: 'HIGH', reasons };
  } else if (score >= 3) {
    return { confidence: 'MEDIUM', reasons };
  } else {
    return { confidence: 'LOW', reasons };
  }
}

scanTenGroupsThoroughly();
