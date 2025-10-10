/**
 * WhatsApp Orchestrator
 * Fetches messages from WhatsApp groups and queues them for processing
 */

import { WhapiService } from '../services/whapi-service';
import { prisma } from '@packages/core-db';
import { scrapedRolesQueue } from '@packages/core-queue';
import { logger } from '@packages/core-observability';

export class WhatsAppOrchestrator {
  private whapiService: WhapiService;

  constructor() {
    this.whapiService = new WhapiService();
  }

  async run(): Promise<void> {
    logger.info('📱 Starting WhatsApp orchestration cycle...');

    try {
      // 1. Get all active WhatsApp sources from database
      const sources = await prisma.ingestionSource.findMany({
        where: {
          sourceType: 'WHATSAPP',
          isActive: true
        }
      });

      logger.info(`📋 Found ${sources.length} active WhatsApp group(s)`);

      if (sources.length === 0) {
        logger.warn('⚠️  No active WhatsApp sources configured');
        return;
      }

      // Check for trial/sandbox limitations
      // Whapi trial/sandbox accounts are limited to 5 chats
      const maxGroups = parseInt(process.env.WHATSAPP_MAX_GROUPS || '5', 10);
      if (sources.length > maxGroups) {
        logger.warn(`⚠️  Found ${sources.length} groups, but limiting to ${maxGroups} (Whapi trial/sandbox limit)`);
        logger.warn(`⚠️  Upgrade your Whapi plan to process more groups: https://whapi.cloud/pricing`);
      }

      // Limit to maxGroups (default 5 for trial accounts)
      const sourcesToProcess = sources.slice(0, maxGroups);

      let totalProcessed = 0;
      let totalQueued = 0;
      let errors = 0;

      // 2. Process each group
      for (const source of sourcesToProcess) {
        try {
          const result = await this.processGroup(source);
          totalProcessed++;
          totalQueued += result.queued;
        } catch (error) {
          logger.error(`Failed to process group ${source.sourceName}`, { 
            error: error instanceof Error ? error.message : String(error) 
          });
          errors++;
        }
      }

      // 3. Update last processed timestamp for successful sources
      await prisma.ingestionSource.updateMany({
        where: {
          sourceType: 'WHATSAPP',
          isActive: true
        },
        data: {
          lastProcessedAt: new Date()
        }
      });

      logger.info(`📊 WhatsApp Summary: ${totalProcessed} processed, ${errors} errors, ${totalQueued} messages queued`);

    } catch (error) {
      logger.error('WhatsApp orchestration failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Process a single WhatsApp group
   */
  private async processGroup(source: any): Promise<{ queued: number }> {
    const groupId = source.sourceIdentifier;
    const groupLogger = logger.child({ groupId, sourceName: source.sourceName });

    groupLogger.info(`📱 Processing WhatsApp group`);

    try {
      // Fetch last 100 messages from the group
      const messages = await this.whapiService.getGroupMessages(groupId, 100);
      
      if (messages.length === 0) {
        groupLogger.debug(`No messages found in group`);
        return { queued: 0 };
      }

      groupLogger.info(`   Found ${messages.length} message(s)`);

      let queued = 0;
      let skipped = 0;

      // Process messages in chronological order (oldest first)
      const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);

      for (const message of sortedMessages) {
        try {
          // Skip old messages (> 7 days)
          if (!this.whapiService.isMessageRecent(message, 7)) {
            continue;
          }

          // Check if already processed
          const existing = await prisma.processedMessage.findUnique({
            where: { whatsappMessageId: message.id }
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Extract text content
          const text = this.whapiService.extractTextFromMessage(message);

          // Skip if no text or too short
          if (!text || text.length < 30) {
            // Mark as processed to avoid re-checking
            await prisma.processedMessage.create({
              data: {
                whatsappMessageId: message.id,
                sourceId: source.id,
                processedAt: new Date()
              }
            });
            continue;
          }

          // Mark as processed
          await prisma.processedMessage.create({
            data: {
              whatsappMessageId: message.id,
              sourceId: source.id,
              processedAt: new Date()
            }
          });

          // Queue for LLM processing
          await scrapedRolesQueue.add('whatsapp-message', {
            sourceId: source.id,
            sourceUrl: `whatsapp://group/${groupId}/message/${message.id}`,
            rawMarkdown: text,
            scrapedAt: new Date(message.timestamp * 1000).toISOString()
          });

          groupLogger.info(`📤 Queued message for processing`, {
            messageId: message.id,
            textLength: text.length,
            sourceUrl: `whatsapp://group/${groupId}/message/${message.id}`
          });

          queued++;

        } catch (error) {
          groupLogger.error(`Failed to process message ${message.id}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      groupLogger.info(`📦 Queued ${queued}/${messages.length} message(s) (${skipped} already processed)`);

      return { queued };

    } catch (error) {
      groupLogger.error(`Failed to process group`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}

