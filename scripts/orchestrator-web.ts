#!/usr/bin/env tsx

/**
 * Digital Twin Web Orchestrator
 * Scheduled job that runs every 4 hours to scrape active web sources
 * and push raw content to the scraped-roles queue for processing.
 */

import { prisma } from '../packages/core-db/src/client';
import { scrapedRolesQueue } from '../packages/core-queue/src/queues';
import { FireCrawlService } from './services/firecrawl-service';

class WebOrchestrator {
  private firecrawlService: FireCrawlService;

  constructor() {
    this.firecrawlService = new FireCrawlService();
  }

  async run(): Promise<void> {
    console.log('🌐 Starting Web Orchestrator...');

    try {
      // Get all active WEB sources
      const webSources = await prisma.ingestionSource.findMany({
        where: {
          sourceType: 'WEB',
          isActive: true,
        },
      });

      console.log(`📋 Found ${webSources.length} active web sources to process`);

      if (webSources.length === 0) {
        console.log('✅ No active web sources to process');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;

      for (const source of webSources) {
        try {
          console.log(`🔍 Processing source: ${source.sourceName} (${source.sourceIdentifier})`);

          // Scrape the website using FireCrawl
          const scrapedContent = await this.firecrawlService.scrapeUrl(source.sourceIdentifier);

          if (!scrapedContent || !scrapedContent.markdown) {
            console.warn(`⚠️ No content scraped from ${source.sourceIdentifier}`);
            continue;
          }

          // Push raw markdown to the scraped-roles queue
          await scrapedRolesQueue.add('process-scraped-role', {
            sourceId: source.id,
            sourceUrl: source.sourceIdentifier,
            rawMarkdown: scrapedContent.markdown,
            scrapedAt: new Date().toISOString(),
          });

          // Update last processed timestamp
          await prisma.ingestionSource.update({
            where: { id: source.id },
            data: { lastProcessedAt: new Date() },
          });

          processedCount++;
          console.log(`✅ Successfully queued content from ${source.sourceName}`);

        } catch (error) {
          console.error(`❌ Failed to process source ${source.sourceName}:`, error);
          errorCount++;

          // Log error but continue processing other sources
          await prisma.auditEvent.create({
            data: {
              eventType: 'WebOrchestratorError',
              targetId: source.id,
              metadata: {
                error: (error as Error).message,
                sourceType: source.sourceType,
                sourceIdentifier: source.sourceIdentifier,
              },
            },
          });
        }
      }

      console.log(`🎉 Web Orchestrator completed: ${processedCount} processed, ${errorCount} errors`);

    } catch (error) {
      console.error('💥 Web Orchestrator failed:', error);
      throw error;
    }
  }
}

// For manual execution
async function main() {
  const orchestrator = new WebOrchestrator();
  await orchestrator.run();
}

// For cron job execution (e.g., via node-cron or similar)
export { WebOrchestrator };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
