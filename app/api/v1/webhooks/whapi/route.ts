/**
 * Whapi.Cloud Webhook Endpoint
 * Receives real-time WhatsApp messages for instant processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { scrapedRolesQueue } from '@packages/core-queue';
import { logger } from '@packages/core-observability';
import crypto from 'crypto';

interface WhapiWebhookPayload {
  event: string;
  instanceId: string;
  data: {
    id: string;
    type: string;
    timestamp: number;
    from: string;
    chatId: string;
    text?: {
      body: string;
    };
    image?: {
      caption?: string;
    };
    video?: {
      caption?: string;
    };
    document?: {
      caption?: string;
      filename?: string;
    };
  };
}

/**
 * Verify webhook signature from Whapi.Cloud
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Extract text content from various message types
 */
function extractTextFromMessage(data: WhapiWebhookPayload['data']): string {
  // Handle text messages
  if (data.text?.body && data.text.body.trim().length > 0) {
    return data.text.body.trim();
  }

  // Handle image with caption
  if (data.image?.caption && data.image.caption.trim().length > 0) {
    return data.image.caption.trim();
  }

  // Handle video with caption
  if (data.video?.caption && data.video.caption.trim().length > 0) {
    return data.video.caption.trim();
  }

  // Handle document with caption
  if (data.document?.caption && data.document.caption.trim().length > 0) {
    return data.document.caption.trim();
  }

  return '';
}

/**
 * Check if message is recent (within last 24 hours)
 * Prevents processing old messages on initial webhook setup
 */
function isMessageRecent(timestamp: number, maxHours = 24): boolean {
  const messageDate = new Date(timestamp * 1000);
  const cutoffDate = new Date(Date.now() - maxHours * 60 * 60 * 1000);
  return messageDate > cutoffDate;
}

/**
 * POST /api/v1/webhooks/whapi
 * Receive WhatsApp messages from Whapi.Cloud webhook
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Verify webhook signature (if enabled)
    const signature = req.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WHAPI_WEBHOOK_SECRET;
    
    const rawBody = await req.text();
    
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        logger.warn('Invalid webhook signature', { signature });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 2. Parse webhook payload
    const payload: WhapiWebhookPayload = JSON.parse(rawBody);
    
    logger.info('📱 Webhook received', {
      event: payload.event,
      messageId: payload.data?.id,
      chatId: payload.data?.chatId,
      type: payload.data?.type
    });

    // 3. Filter for group messages only
    if (!payload.data?.chatId?.includes('@g.us')) {
      logger.info('⏭️  Skipping non-group message');
      return NextResponse.json({ received: true, skipped: 'not_group_message' });
    }

    // 4. Check if this is a message event
    if (payload.event !== 'message' && payload.event !== 'messages.upsert') {
      logger.info('⏭️  Skipping non-message event', { event: payload.event });
      return NextResponse.json({ received: true, skipped: 'not_message_event' });
    }

    // 5. Extract message data
    const messageId = payload.data.id;
    const groupId = payload.data.chatId;
    const timestamp = payload.data.timestamp;

    // 6. Check if message is too old (prevent processing old messages on webhook setup)
    if (!isMessageRecent(timestamp, 24)) {
      logger.info('⏭️  Skipping old message', { messageId, timestamp });
      return NextResponse.json({ received: true, skipped: 'old_message' });
    }

    // 7. Find matching ingestion source
    const source = await prisma.ingestionSource.findFirst({
      where: {
        sourceType: 'WHATSAPP',
        sourceIdentifier: groupId,
        isActive: true
      }
    });

    if (!source) {
      logger.info('⏭️  No active source for this group', { groupId });
      return NextResponse.json({ received: true, skipped: 'no_active_source' });
    }

    // 8. Check if already processed
    const existing = await prisma.processedMessage.findUnique({
      where: { whatsappMessageId: messageId }
    });

    if (existing) {
      logger.info('⏭️  Message already processed', { messageId });
      return NextResponse.json({ received: true, skipped: 'already_processed' });
    }

    // 9. Extract text content
    const text = extractTextFromMessage(payload.data);

    // 10. Skip if no text or too short
    if (!text || text.length < 30) {
      await prisma.processedMessage.create({
        data: {
          whatsappMessageId: messageId,
          sourceId: source.id,
          processedAt: new Date()
        }
      });
      
      logger.info('⏭️  Skipping - no text or too short', { messageId, textLength: text.length });
      return NextResponse.json({ received: true, skipped: 'insufficient_text' });
    }

    // 11. Mark as processed
    await prisma.processedMessage.create({
      data: {
        whatsappMessageId: messageId,
        sourceId: source.id,
        processedAt: new Date()
      }
    });

    // 12. Queue for LLM processing
    await scrapedRolesQueue.add('whatsapp-message-webhook', {
      sourceId: source.id,
      sourceUrl: `whatsapp://group/${groupId}/message/${messageId}`,
      rawMarkdown: text,
      scrapedAt: new Date(timestamp * 1000).toISOString()
    });

    const processingTime = Date.now() - startTime;

    logger.info('✅ Message queued for processing', {
      messageId,
      sourceId: source.id,
      sourceName: source.sourceName,
      textLength: text.length,
      processingTime
    });

    return NextResponse.json({
      received: true,
      queued: true,
      messageId,
      processingTime
    });

  } catch (error) {
    logger.error('❌ Webhook processing failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/webhooks/whapi
 * Webhook health check / verification endpoint
 */
export async function GET(req: NextRequest) {
  // Some webhook services send a verification request
  const verifyToken = req.nextUrl.searchParams.get('verify_token');
  const expectedToken = process.env.WHAPI_WEBHOOK_VERIFY_TOKEN;

  if (verifyToken && expectedToken && verifyToken === expectedToken) {
    return NextResponse.json({ verified: true });
  }

  return NextResponse.json({
    status: 'healthy',
    endpoint: 'whapi-webhook',
    timestamp: new Date().toISOString()
  });
}

