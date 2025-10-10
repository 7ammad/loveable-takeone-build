#!/usr/bin/env tsx

/**
 * Digital Twin Setup Script
 * Adds sample ingestion sources to the database for testing web crawling
 */

import { prisma } from '../packages/core-db/src/client';

const sampleWebSources = [
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.backstage.com/casting/',
    sourceName: 'Backstage - Casting Calls',
    isActive: true,
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.mandy.com/jobs/middle-east',
    sourceName: 'Mandy - Middle East Jobs',
    isActive: true,
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.productionhub.com/casting-calls',
    sourceName: 'Production Hub - Casting',
    isActive: false, // Start as inactive
  },
];

async function setupDigitalTwin() {
  console.log('🎬 Setting up Digital Twin - Web Crawling Sources...\n');

  try {
    // Check if sources already exist
    const existingCount = await prisma.ingestionSource.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing ingestion source(s)`);
      console.log('Do you want to:');
      console.log('  1. Keep existing sources and add new ones');
      console.log('  2. Delete all and start fresh');
      console.log('  3. Cancel\n');
      
      // For now, we'll just add new ones if they don't exist
      console.log('📋 Adding sample sources (skipping duplicates)...\n');
    } else {
      console.log('📋 No existing sources found. Adding sample sources...\n');
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const source of sampleWebSources) {
      // Check if source already exists
      const existing = await prisma.ingestionSource.findFirst({
        where: {
          sourceIdentifier: source.sourceIdentifier,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${source.sourceName}`);
        skippedCount++;
        continue;
      }

      await prisma.ingestionSource.create({
        data: source,
      });

      const statusIcon = source.isActive ? '✅' : '⏸️ ';
      console.log(`${statusIcon} Added: ${source.sourceName}`);
      console.log(`   URL: ${source.sourceIdentifier}`);
      console.log(`   Status: ${source.isActive ? 'Active' : 'Inactive'}\n`);
      addedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${addedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📁 Total sources: ${await prisma.ingestionSource.count()}`);

    console.log('\n🎉 Digital Twin setup complete!\n');
    console.log('📖 Next steps:');
    console.log('   1. Get a FireCrawl API key from https://firecrawl.dev');
    console.log('   2. Add FIRE_CRAWL_API_KEY to your .env file');
    console.log('   3. Start the workers: pnpm run workers');
    console.log('   4. Run the web orchestrator: pnpm run crawl:web\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDigitalTwin();

