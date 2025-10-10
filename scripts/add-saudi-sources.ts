#!/usr/bin/env tsx

/**
 * Add Saudi Casting Sources
 * Run this script after providing your sources list
 */

import { prisma } from '../packages/core-db/src/client';
import * as fs from 'fs';
import * as path from 'path';

// Example sources - replace with your actual list
const saudiSources = [
  // Instagram Accounts
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@saudicasting',
    sourceName: 'Saudi Casting Agency - Instagram',
    isActive: true,
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@mbc_casting',
    sourceName: 'MBC Casting - Instagram',
    isActive: true,
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@rotanacasting',
    sourceName: 'Rotana Media Casting - Instagram',
    isActive: true,
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@telfaz11',
    sourceName: 'Telfaz11 Productions - Instagram',
    isActive: true,
  },
  {
    sourceType: 'INSTAGRAM',
    sourceIdentifier: '@gea_casting',
    sourceName: 'General Entertainment Authority - Instagram',
    isActive: true,
  },

  // Websites
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.mbcgroup.sa/careers',
    sourceName: 'MBC Group - Careers Page',
    isActive: true,
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.rotana.net/jobs',
    sourceName: 'Rotana Media - Jobs Page',
    isActive: true,
  },
  {
    sourceType: 'WEB',
    sourceIdentifier: 'https://www.telfaz11.com/casting',
    sourceName: 'Telfaz11 - Casting Page',
    isActive: false, // Start as inactive (enable manually)
  },
];

async function addSaudiSources() {
  console.log('🇸🇦 Adding Saudi Casting Sources...\n');

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const source of saudiSources) {
      // Check if source already exists
      const existing = await prisma.ingestionSource.findFirst({
        where: {
          sourceIdentifier: source.sourceIdentifier,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${source.sourceName} (already exists)`);
        skippedCount++;
        continue;
      }

      await prisma.ingestionSource.create({
        data: source,
      });

      const icon = source.isActive ? '✅' : '⏸️ ';
      console.log(`${icon} Added: ${source.sourceName}`);
      console.log(`   Type: ${source.sourceType}`);
      console.log(`   Identifier: ${source.sourceIdentifier}\n`);
      addedCount++;
    }

    // Summary
    const totalSources = await prisma.ingestionSource.count();
    const activeSources = await prisma.ingestionSource.count({
      where: { isActive: true },
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   ✅ Added: ${addedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📁 Total sources in DB: ${totalSources}`);
    console.log(`   🟢 Active sources: ${activeSources}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Source breakdown
    const sourcesByType = await prisma.ingestionSource.groupBy({
      by: ['sourceType'],
      _count: true,
    });

    console.log('📈 By Source Type:');
    sourcesByType.forEach((type) => {
      const icon = type.sourceType === 'INSTAGRAM' ? '📸' : 
                   type.sourceType === 'WEB' ? '🌐' : 
                   type.sourceType === 'WHATSAPP' ? '💬' : '📱';
      console.log(`   ${icon} ${type.sourceType}: ${type._count}`);
    });

    console.log('\n🎉 Saudi sources added successfully!\n');
    console.log('📖 Next steps:');
    console.log('   1. Make sure API keys are in .env:');
    console.log('      - FIRE_CRAWL_API_KEY (for websites)');
    console.log('      - APIFY_API_KEY (for Instagram)');
    console.log('   2. Restart the server to enable Digital Twin');
    console.log('   3. Check status: GET /api/digital-twin/status');
    console.log('   4. View sources: GET /api/digital-twin/sources\n');

  } catch (error) {
    console.error('❌ Failed to add sources:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if JSON file exists
const jsonPath = path.join(process.cwd(), 'saudi-sources.json');
if (fs.existsSync(jsonPath)) {
  console.log('📄 Found saudi-sources.json, loading...\n');
  const jsonSources = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  saudiSources.push(...jsonSources);
}

addSaudiSources();

