#!/usr/bin/env tsx

/**
 * Test Digital Twin initialization
 */

import { prisma } from '../packages/core-db/src/client';

async function testDigitalTwin() {
  console.log('🧪 Testing Digital Twin Configuration...\n');

  try {
    // Check active sources
    const stats = {
      total: await prisma.ingestionSource.count(),
      active: await prisma.ingestionSource.count({ where: { isActive: true } }),
      instagram: await prisma.ingestionSource.count({
        where: { sourceType: 'INSTAGRAM', isActive: true },
      }),
      web: await prisma.ingestionSource.count({
        where: { sourceType: 'WEB', isActive: true },
      }),
    };

    console.log('📊 Source Configuration:');
    console.log(`   📸 Active Instagram: ${stats.instagram}`);
    console.log(`   🌐 Active Websites: ${stats.web}`);
    console.log(`   🟢 Total Active: ${stats.active}`);
    console.log(`   📁 Total Sources: ${stats.total}\n`);

    // Check environment variables
    console.log('🔑 API Keys:');
    console.log(`   APIFY_API_KEY: ${process.env.APIFY_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FIRE_CRAWL_API_KEY: ${process.env.FIRE_CRAWL_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   REDIS_URL: ${process.env.REDIS_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}\n`);

    // Check Digital Twin setting
    console.log('⚙️  Digital Twin Settings:');
    console.log(`   DIGITAL_TWIN_ENABLED: ${process.env.DIGITAL_TWIN_ENABLED || 'not set (defaults to true)'}\n`);

    // List active Instagram sources
    const instagramSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'INSTAGRAM',
        isActive: true,
      },
      take: 5,
    });

    console.log('📸 First 5 Active Instagram Sources:');
    instagramSources.forEach((source, i) => {
      console.log(`   ${i + 1}. ${source.sourceName}`);
      console.log(`      ${source.sourceIdentifier}`);
    });

    console.log('\n✅ Configuration looks good!');
    console.log('📖 To test the Digital Twin:');
    console.log('   1. Server should show: "🤖 Starting Digital Twin Background Service..."');
    console.log('   2. After 30 seconds: "🤖 Digital Twin Orchestration Cycle Started"');
    console.log('   3. If you don\'t see these logs, check app/layout.tsx import\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDigitalTwin();

