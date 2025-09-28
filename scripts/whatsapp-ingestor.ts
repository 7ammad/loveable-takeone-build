#!/usr/bin/env tsx

/**
 * TakeOne Digital Twin - WhatsApp Ingestion Service
 *
 * This isolated service connects to Whapi.cloud (unofficial WhatsApp API) to fetch messages
 * from specified group chats and queue them for processing.
 *
 * ⚠️  RISK MITIGATION: This service is completely isolated and uses an unofficial API.
 * If the API changes or access is revoked, it won't affect the core platform.
 */

import { PrismaClient } from '@prisma/client';
import { processWhatsappMessageQueue } from '../packages/core-queue/src/queues.js';

const prisma = new PrismaClient();

// Environment variables
const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud';

interface WhapiMessage {
  id: string;
  from: string;
  from_me: boolean;
  type: string;
  timestamp: number;
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
  };
}

interface WhapiMessagesResponse {
  messages: WhapiMessage[];
  cursor?: {
    last_message_time: number;
  };
}

async function fetchGroupMessages(groupChatId: string, since?: number): Promise<WhapiMessage[]> {
  try {
    const url = new URL(`${WHAPI_BASE_URL}/messages/list/${groupChatId}`);

    if (since) {
      // Convert timestamp to the format Whapi expects
      const sinceDate = new Date(since * 1000);
      url.searchParams.set('from', sinceDate.toISOString());
    }

    // Limit to recent messages to avoid processing old content
    url.searchParams.set('limit', '50');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Whapi API error: ${response.status} ${response.statusText}`);
    }

    const data: WhapiMessagesResponse = await response.json();

    // Filter for text messages only (ignore images, videos, etc.)
    return data.messages.filter(msg =>
      msg.type === 'text' &&
      msg.text?.body &&
      !msg.from_me // Only messages from others
    );

  } catch (error) {
    console.error(`Failed to fetch messages for group ${groupChatId}:`, error);
    return [];
  }
}

async function processGroup(source: { id: string; sourceIdentifier: string; sourceName: string; lastProcessedAt?: Date }) {
  console.log(`📱 Processing WhatsApp group: ${source.sourceName}`);

  const since = source.lastProcessedAt ? Math.floor(source.lastProcessedAt.getTime() / 1000) : undefined;

  const messages = await fetchGroupMessages(source.sourceIdentifier, since);

  console.log(`📨 Found ${messages.length} new messages from ${source.sourceName}`);

  let processedCount = 0;

  for (const message of messages) {
    try {
      // Extract message content
      let content = message.text?.body || '';

      // Some groups might have image captions too
      if (message.image?.caption) {
        content += '\n\n' + message.image.caption;
      }

      if (!content.trim()) {
        continue; // Skip empty messages
      }

      // Queue for processing
      await processWhatsappMessageQueue.add('process-whatsapp-message', {
        messageId: message.id,
        content: content.trim(),
        sourceName: source.sourceName,
        groupChatId: source.sourceIdentifier,
        timestamp: message.timestamp,
        ingestedAt: new Date().toISOString(),
      });

      processedCount++;
      console.log(`📨 Queued message from ${source.sourceName}: "${content.substring(0, 50)}..."`);

    } catch (error) {
      console.error(`Failed to queue message ${message.id}:`, error);
    }
  }

  // Update last processed timestamp
  const latestTimestamp = Math.max(...messages.map(m => m.timestamp));
  if (latestTimestamp > 0) {
    await prisma.ingestionSource.update({
      where: { id: source.id },
      data: {
        lastProcessedAt: new Date(latestTimestamp * 1000)
      },
    });
  }

  console.log(`✅ Processed ${processedCount} messages from ${source.sourceName}`);
}

async function main() {
  console.log('📱 Starting TakeOne WhatsApp Ingestor');

  // Validate environment variables
  if (!WHAPI_TOKEN) {
    console.warn('⚠️  WHAPI_TOKEN not configured - WhatsApp ingestion will be skipped');
    console.log('💡 To enable WhatsApp ingestion, set WHAPI_TOKEN and WHAPI_BASE_URL environment variables');
    return;
  }

  try {
    // Fetch all active WhatsApp sources
    const whatsappSources = await prisma.ingestionSource.findMany({
      where: {
        sourceType: 'WHATSAPP',
        isActive: true,
      },
    });

    if (whatsappSources.length === 0) {
      console.log('📱 No active WhatsApp sources configured. Add some in the admin panel to get started.');
      return;
    }

    console.log(`📱 Found ${whatsappSources.length} active WhatsApp groups to process`);

    // Process each group
    for (const source of whatsappSources) {
      try {
        await processGroup(source);

        // Small delay between groups to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`Failed to process WhatsApp group ${source.sourceName}:`, error);
        // Continue with other groups
      }
    }

    console.log('✅ WhatsApp ingestion run completed successfully');

  } catch (error) {
    console.error('❌ WhatsApp ingestion run failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the ingestor
main().catch(console.error);
