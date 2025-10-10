#!/usr/bin/env tsx

/**
 * Activate only first 10 Instagram sources for testing
 */

import { prisma } from '../packages/core-db/src/client';

async function activateTestSources() {
  console.log('🧪 Setting up test sources (10 Instagram accounts)...\n');

  try {
    // Deactivate ALL Instagram sources first
    await prisma.ingestionSource.updateMany({
      where: {
        sourceType: 'INSTAGRAM',
      },
      data: {
        isActive: false,
      },
    });

    console.log('✅ Deactivated all Instagram sources');

    // Get first 10 Instagram sources
    const instagramSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'INSTAGRAM',
      },
      take: 10,
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`📋 Found ${instagramSources.length} Instagram sources to activate\n`);

    // Activate them
    for (const source of instagramSources) {
      await prisma.ingestionSource.update({
        where: { id: source.id },
        data: { isActive: true },
      });

      console.log(`✅ Activated: ${source.sourceName}`);
      console.log(`   ${source.sourceIdentifier}\n`);
    }

    // Get stats
    const stats = {
      total: await prisma.ingestionSource.count(),
      active: await prisma.ingestionSource.count({ where: { isActive: true } }),
      instagramActive: await prisma.ingestionSource.count({
        where: { sourceType: 'INSTAGRAM', isActive: true },
      }),
      webActive: await prisma.ingestionSource.count({
        where: { sourceType: 'WEB', isActive: true },
      }),
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Configuration:');
    console.log(`   📸 Active Instagram: ${stats.instagramActive}`);
    console.log(`   🌐 Active Websites: ${stats.webActive}`);
    console.log(`   🟢 Total Active: ${stats.active}`);
    console.log(`   📁 Total Sources: ${stats.total}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Test sources configured!');
    console.log('📖 Next steps:');
    console.log('   1. Restart the server: pnpm dev');
    console.log('   2. Wait 30 seconds for first crawl');
    console.log('   3. Check terminal for Digital Twin logs\n');

  } catch (error) {
    console.error('❌ Failed to configure test sources:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

activateTestSources();

