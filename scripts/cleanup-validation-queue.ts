/**
 * Clean up validation queue - remove all non-WhatsApp entries
 */

import 'dotenv/config';
import { prisma } from '../packages/core-db/src/client';

async function cleanupValidationQueue() {
  console.log('🧹 Cleaning up validation queue...');
  console.log('Removing all non-WhatsApp entries...\n');

  try {
    // Delete all casting calls that are NOT from WhatsApp sources
    const result = await prisma.castingCall.deleteMany({
      where: {
        AND: [
          { status: 'pending_review' },
          {
            sourceUrl: {
              not: {
                contains: 'whatsapp'
              }
            }
          }
        ]
      }
    });

    console.log(`✅ Deleted ${result.count} non-WhatsApp casting calls`);
    
    // Check remaining entries
    const remaining = await prisma.castingCall.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        title: true,
        createdAt: true,
        sourceUrl: true
      }
    });

    console.log(`📊 Remaining entries: ${remaining.length}`);
    
    if (remaining.length > 0) {
      console.log('\nRecent WhatsApp entries:');
      remaining.forEach((entry, i) => {
        const source = entry.sourceUrl?.includes('whatsapp') ? '📱 WhatsApp' : '🌐 Other';
        console.log(`${i + 1}. ${source} ${entry.title} (${entry.createdAt.toISOString().split('T')[0]})`);
      });
    } else {
      console.log('\n✅ Validation queue is now clean - only WhatsApp entries will be processed');
    }

  } catch (error) {
    console.error('❌ Error cleaning up validation queue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupValidationQueue();
