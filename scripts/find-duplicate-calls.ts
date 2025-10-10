#!/usr/bin/env tsx

/**
 * Find duplicate aggregated casting calls by contentHash
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicateCastingCalls() {
  console.log('🔍 Searching for duplicate casting calls based on contentHash...');

  try {
    const duplicates = await prisma.castingCall.groupBy({
      by: ['contentHash'],
      _count: {
        contentHash: true,
      },
      having: {
        contentHash: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (duplicates.length === 0) {
      console.log('✅ No duplicate casting calls found.');
      return;
    }

    console.log(`🚨 Found ${duplicates.length} sets of duplicate casting calls:`);
    for (const group of duplicates) {
      console.log(
        `- Hash: ${group.contentHash}, Count: ${group._count.contentHash}`
      );
      // Optionally, retrieve the actual records
      const calls = await prisma.castingCall.findMany({
        where: { contentHash: group.contentHash },
        select: { id: true, title: true, createdAt: true, sourceName: true },
      });
      console.table(calls);
    }
  } catch (error) {
    console.error('❌ An error occurred while searching for duplicates:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  }
}

findDuplicateCastingCalls();


