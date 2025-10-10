/**
 * Instagram Orchestrator
 * Scrapes Saudi casting-related Instagram accounts
 * 
 * Note: Instagram scraping requires special handling:
 * - Option 1: Use Apify Instagram scraper (recommended)
 * - Option 2: Use Instagram Basic Display API (requires approval)
 * - Option 3: Manual feed monitoring (webhook-based)
 */

import { prisma } from '@packages/core-db';
import { scrapedRolesQueue } from '@packages/core-queue';
import { InstagramScraperService } from '../services/instagram-scraper-service';
import { logger } from '@packages/core-observability';

export class InstagramOrchestrator {
  private instagramService: InstagramScraperService;

  constructor() {
    this.instagramService = new InstagramScraperService();
  }

  async run(): Promise<void> {
    try {
      // Get all active INSTAGRAM sources
      const instagramSources = await prisma.ingestionSource.findMany({
        where: {
          sourceType: 'INSTAGRAM',
          isActive: true,
        },
        take: 10, // Cap to 10 active sources per run
      });

      logger.info(`📋 Found ${instagramSources.length} active Instagram source(s)`);

      if (instagramSources.length === 0) {
        logger.info('   No active Instagram sources to process');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;

      for (const source of instagramSources) {
        const sourceLogger = logger.child({ 
          sourceId: source.id, 
          sourceName: source.sourceName 
        });

        try {
          sourceLogger.info(`📸 Processing Instagram source`);
          console.log(`      Account: ${source.sourceIdentifier}`);

          // Extract username from URL or handle
          const username = this.extractUsername(source.sourceIdentifier);

          // Scrape recent posts
          const posts = await this.instagramService.scrapeRecentPosts(username);

          if (!posts || posts.length === 0) {
            sourceLogger.warn(`⚠️  No new posts found`);
            continue;
          }

          sourceLogger.info(`      Found ${posts.length} post(s)`);

          // Process each post
          let queuedCount = 0;
          for (const post of posts) {
            // Check if we've already processed this post
            const existingCall = await prisma.castingCall.findFirst({
              where: {
                sourceUrl: post.url,
              },
            });

            if (existingCall) {
              sourceLogger.info(`⏭️  Skipped (already processed): ${post.shortcode}`);
              continue;
            }

            // Queue for LLM processing
            await scrapedRolesQueue.add('process-scraped-role', {
              sourceId: source.id,
              sourceUrl: post.url,
              rawMarkdown: `# Instagram Post from ${username}\n\n${post.caption}\n\n[View Post](${post.url})`,
              scrapedAt: new Date().toISOString(),
            });

            queuedCount++;
            sourceLogger.info(`✅ Queued post: ${post.shortcode}`);
          }

          // Update last processed
          await prisma.ingestionSource.update({
            where: { id: source.id },
            data: { lastProcessedAt: new Date() },
          });

          processedCount++;
          sourceLogger.info(`📦 Queued ${queuedCount}/${posts.length} new post(s)`);

        } catch (error) {
          sourceLogger.error(`❌ Instagram source processing failed`, {
            error: error instanceof Error ? error.message : String(error),
          });
          errorCount++;
        }
      }

      logger.info(`📊 Instagram Summary: ${processedCount} processed, ${errorCount} errors`);

    } catch (error) {
      logger.error('❌ Instagram Orchestrator failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private extractUsername(sourceIdentifier: string): string {
    // Handle different formats:
    // - @username
    // - username
    // - https://instagram.com/username
    // - https://www.instagram.com/username/
    
    let username = sourceIdentifier;
    
    if (username.includes('instagram.com/')) {
      const match = username.match(/instagram\.com\/([^/?]+)/);
      if (match) username = match[1];
    }
    
    username = username.replace('@', '').trim();
    
    return username;
  }
}

