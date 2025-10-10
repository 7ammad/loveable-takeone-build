/**
 * Comprehensive WhatsApp Groups Scan
 * Thoroughly scan ALL WhatsApp groups to find every potential casting call
 */

import 'dotenv/config';
import { WhapiService } from '../lib/digital-twin/services/whapi-service';
import { prisma } from '@packages/core-db';

async function comprehensiveWhatsAppScan() {
  console.log('🔍 Starting Comprehensive WhatsApp Groups Scan...\n');

  try {
    const whapiService = new WhapiService();

    // Get ALL WhatsApp groups from Whapi (not just database ones)
    console.log('📱 Step 1: Fetching all available WhatsApp groups...');
    const whapiGroups = await whapiService.getGroups();
    
    console.log(`✅ Found ${whapiGroups.length} WhatsApp groups from Whapi API\n`);

    // Get database sources for comparison
    const dbSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true
      }
    });

    console.log(`📊 Database has ${dbSources.length} active WhatsApp sources\n`);

    const allCastingCalls: Array<{
      groupName: string;
      groupId: string;
      messageId: string;
      text: string;
      timestamp: Date;
      from: string;
      length: number;
      confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      reasons: string[];
    }> = [];

    let totalMessages = 0;
    let totalGroups = 0;

    // Scan each group thoroughly
    for (const group of whapiGroups) {
      try {
        console.log(`\n📱 Scanning: ${group.name || group.subject || 'Unknown Group'}`);
        console.log(`   ID: ${group.id}`);
        
        // Fetch more messages per group (200 instead of 50)
        const messages = await whapiService.getGroupMessages(group.id, 200);
        
        console.log(`   Found ${messages.length} message(s)`);
        totalMessages += messages.length;
        totalGroups++;

        // Analyze each message for casting potential
        for (const message of messages) {
          const text = whapiService.extractTextFromMessage(message);
          
          if (text && text.length > 50) { // Lower threshold to catch more
            const analysis = analyzeCastingPotential(text);
            
            if (analysis.confidence !== 'LOW') {
              allCastingCalls.push({
                groupName: group.name || group.subject || 'Unknown',
                groupId: group.id,
                messageId: message.id,
                text: text,
                timestamp: new Date(message.timestamp * 1000),
                from: message.from,
                length: text.length,
                confidence: analysis.confidence,
                reasons: analysis.reasons
              });
            }
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Error scanning group ${group.id}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`\n📊 SCAN COMPLETE:`);
    console.log(`   Groups scanned: ${totalGroups}/${whapiGroups.length}`);
    console.log(`   Total messages: ${totalMessages}`);
    console.log(`   Potential casting calls: ${allCastingCalls.length}\n`);

    // Sort by confidence and date
    const sortedCalls = allCastingCalls.sort((a, b) => {
      const confidenceOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Display results by confidence level
    const highConfidence = sortedCalls.filter(c => c.confidence === 'HIGH');
    const mediumConfidence = sortedCalls.filter(c => c.confidence === 'MEDIUM');

    console.log('🎯 HIGH CONFIDENCE CASTING CALLS:\n');
    console.log('─'.repeat(80));
    
    if (highConfidence.length === 0) {
      console.log('   No high confidence casting calls found.');
    } else {
      highConfidence.slice(0, 10).forEach((call, index) => {
        console.log(`\n${index + 1}. 📱 ${call.groupName}`);
        console.log(`   Time: ${call.timestamp.toISOString()}`);
        console.log(`   Length: ${call.length} characters`);
        console.log(`   Reasons: ${call.reasons.join(', ')}`);
        console.log(`\n   📝 Text:`);
        console.log(`   ${call.text}`);
        console.log('─'.repeat(80));
      });
    }

    console.log(`\n⚠️  MEDIUM CONFIDENCE POTENTIAL CALLS (${mediumConfidence.length}):\n`);
    console.log('─'.repeat(80));
    
    if (mediumConfidence.length === 0) {
      console.log('   No medium confidence potential calls found.');
    } else {
      mediumConfidence.slice(0, 5).forEach((call, index) => {
        console.log(`\n${index + 1}. 📱 ${call.groupName}`);
        console.log(`   Time: ${call.timestamp.toISOString()}`);
        console.log(`   Reasons: ${call.reasons.join(', ')}`);
        console.log(`\n   📝 Text Preview:`);
        console.log(`   ${call.text.substring(0, 200)}${call.text.length > 200 ? '...' : ''}`);
        console.log('─'.repeat(80));
      });
    }

    // Save complete results to file
    const fs = await import('fs');
    const outputPath = 'comprehensive-whatsapp-scan-results.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      scanDate: new Date().toISOString(),
      totalGroups: totalGroups,
      totalMessages: totalMessages,
      highConfidence: highConfidence.length,
      mediumConfidence: mediumConfidence.length,
      allCalls: sortedCalls
    }, null, 2));
    
    console.log(`\n💾 Complete results saved to: ${outputPath}`);
    console.log(`\n🎯 SUMMARY:`);
    console.log(`   High Confidence: ${highConfidence.length} casting calls`);
    console.log(`   Medium Confidence: ${mediumConfidence.length} potential calls`);
    console.log(`   Total Analyzed: ${sortedCalls.length} messages`);

    return sortedCalls;

  } catch (error) {
    console.error('❌ Comprehensive scan failed:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Analyze text for casting call potential
 */
function analyzeCastingPotential(text: string): { confidence: 'HIGH' | 'MEDIUM' | 'LOW', reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // High confidence indicators
  const highConfidenceKeywords = [
    // Arabic casting terms
    'مطلوب ممثل', 'مطلوب ممثلة', 'نحتاج ممثل', 'نحتاج ممثلة',
    'كاستنج', 'كاستينج', 'اختيار ممثل', 'اختيار ممثلة',
    'تقديم على الدور', 'أوديشن', 'اختبار أداء',
    'بنات اكسترا', 'رجال اكسترا', 'أطفال اكسترا',
    
    // Location + casting
    'التصوير في', 'تصوير في الرياض', 'تصوير في جدة',
    'تصوير في الدمام', 'تصوير في الخبر',
    
    // Payment indicators
    'الأجر', 'المبلغ', 'ريال', 'مدفوع',
    
    // Contact info
    'للتواصل', 'رقم التواصل', 'واتساب', 'اتصال'
  ];

  // Medium confidence indicators  
  const mediumConfidenceKeywords = [
    'نبحث عن', 'نحتاج', 'مطلوب', 'فرصة تصوير',
    'مشاركة في', 'المشاركة في تصوير',
    'عمر', 'سن', 'فتاة', 'شاب', 'طفل'
  ];

  // Check for high confidence indicators
  for (const keyword of highConfidenceKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Contains "${keyword}"`);
      score += 3;
    }
  }

  // Check for medium confidence indicators
  for (const keyword of mediumConfidenceKeywords) {
    if (text.includes(keyword)) {
      reasons.push(`Contains "${keyword}"`);
      score += 1;
    }
  }

  // Length bonus (longer messages more likely to be detailed casting calls)
  if (text.length > 200) score += 1;
  if (text.length > 500) score += 1;

  // Date/time indicators
  if (text.match(/\d{1,2}\/\d{1,2}/) || text.match(/\d{1,2} أكتوبر/) || text.match(/\d{1,2} نوفمبر/)) {
    reasons.push('Contains dates');
    score += 1;
  }

  // Phone number indicators
  if (text.match(/\+966/) || text.match(/05\d{8}/)) {
    reasons.push('Contains contact info');
    score += 2;
  }

  // Determine confidence level
  if (score >= 5) {
    return { confidence: 'HIGH', reasons };
  } else if (score >= 2) {
    return { confidence: 'MEDIUM', reasons };
  } else {
    return { confidence: 'LOW', reasons };
  }
}

comprehensiveWhatsAppScan();

