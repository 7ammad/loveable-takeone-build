#!/usr/bin/env tsx

/**
 * Digital Twin WhatsApp Orchestrator
 * Scheduled job that runs every 15 minutes to check active WhatsApp groups
 * and push new messages to the whatsapp-messages queue for processing.
 */

import { prisma } from '../packages/core-db/src/client';
import { whatsappMessagesQueue } from '../packages/core-queue/src/queues';
import { WhapiService } from './services/whapi-service';

class WhatsAppOrchestrator {
  private whapiService: WhapiService;

  constructor() {
    this.whapiService = new WhapiService();
  }

  async run(): Promise<void> {
    console.log('📱 Starting WhatsApp Orchestrator...');

    try {
      // Get all active WHATSAPP sources
      const whatsappSources = await prisma.ingestionSource.findMany({
        where: {
          sourceType: 'WHATSAPP',
          isActive: true,
        },
      });

      console.log(`📋 Found ${whatsappSources.length} active WhatsApp sources to process`);

      if (whatsappSources.length === 0) {
        console.log('✅ No active WhatsApp sources to process');
        return;
      }

      let processedCount = 0;
      let messageCount = 0;
      let errorCount = 0;

      for (const source of whatsappSources) {
        try {
          console.log(`📱 Processing WhatsApp source: ${source.sourceName} (${source.sourceIdentifier})`);

          // Get recent messages from the WhatsApp group
          const messages = await this.whapiService.getRecentMessages(source.sourceIdentifier);

          if (!messages || messages.length === 0) {
            console.log(`📭 No new messages in ${source.sourceName}`);
            continue;
          }

          console.log(`💬 Found ${messages.length} messages in ${source.sourceName}`);

          // Process each message
          for (const message of messages) {
            try {
              // Push raw message to the whatsapp-messages queue
              await whatsappMessagesQueue.add('process-whatsapp-message', {
                sourceId: source.id,
                messageId: message.id,
                messageText: message.text,
                senderId: message.from,
                timestamp: message.timestamp,
                receivedAt: new Date().toISOString(),
              });

              messageCount++;

            } catch (messageError) {
              console.error(`❌ Failed to queue message from ${source.sourceName}:`, messageError);
            }
          }

          // Update last processed timestamp
          await prisma.ingestionSource.update({
            where: { id: source.id },
            data: { lastProcessedAt: new Date() },
          });

          processedCount++;
          console.log(`✅ Successfully processed ${source.sourceName}`);

        } catch (error) {
          console.error(`❌ Failed to process WhatsApp source ${source.sourceName}:`, error);
          errorCount++;

          // Log error but continue processing other sources
          await prisma.auditEvent.create({
            data: {
              eventType: 'WhatsAppOrchestratorError',
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

      console.log(`🎉 WhatsApp Orchestrator completed: ${processedCount} sources processed, ${messageCount} messages queued, ${errorCount} errors`);

    } catch (error) {
      console.error('💥 WhatsApp Orchestrator failed:', error);
      throw error;
    }
  }
}

// For manual execution
async function main() {
  const orchestrator = new WhatsAppOrchestrator();
  await orchestrator.run();
}

// For cron job execution
export { WhatsAppOrchestrator };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
