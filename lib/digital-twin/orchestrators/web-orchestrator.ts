/**
 * Web Orchestrator
 * Crawls web sources (Saudi company websites, job boards, etc.)
 */

import { prisma } from '@packages/core-db';
import { scrapedRolesQueue } from '@packages/core-queue';
import { FireCrawlService } from '../services/firecrawl-service';
import { logger } from '@packages/core-observability';

export class WebOrchestrator {
  private firecrawlService: FireCrawlService;

  constructor() {
    this.firecrawlService = new FireCrawlService();
  }

  async run(): Promise<void> {
    try {
      // Get all active WEB sources
      const webSources = await prisma.ingestionSource.findMany({
        where: {
          sourceType: 'WEB',
          isActive: true,
        },
      });

      logger.info(`📋 Found ${webSources.length} active web source(s)`);

      if (webSources.length === 0) {
        logger.info('   No active web sources to process');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;

      for (const source of webSources) {
        const sourceLogger = logger.child({
          sourceId: source.id,
          sourceName: source.sourceName
        });

        try {
          sourceLogger.info(`🔍 Processing web source`);

          // Scrape the website
          const scrapedContent = await this.firecrawlService.scrapeUrl(source.sourceIdentifier);

          if (!scrapedContent || !scrapedContent.markdown) {
            sourceLogger.warn(`⚠️  No content scraped`);
            continue;
          }

          // Push to queue
          await scrapedRolesQueue.add('process-scraped-role', {
            sourceId: source.id,
            sourceUrl: source.sourceIdentifier,
            rawMarkdown: scrapedContent.markdown,
            scrapedAt: new Date().toISOString(),
          });

          // Update last processed
          await prisma.ingestionSource.update({
            where: { id: source.id },
            data: { lastProcessedAt: new Date() },
          });

          processedCount++;
          sourceLogger.info(`✅ Queued for processing`);

        } catch (error) {
          sourceLogger.error(`❌ Web source processing failed`, {
            error: error instanceof Error ? error.message : String(error),
          });
          errorCount++;
        }
      }

      logger.info(`📊 Web Summary: ${processedCount} processed, ${errorCount} errors`);

    } catch (error) {
      logger.error('❌ Web Orchestrator failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
}

