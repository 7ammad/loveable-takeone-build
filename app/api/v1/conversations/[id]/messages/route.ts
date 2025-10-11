import { NextRequest, NextResponse } from 'next/server';
import { 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead 
} from '@packages/core-db/src/messaging';
import { prisma } from '@packages/core-db';
import { z } from 'zod';
import { requireTalent } from '@/lib/auth-helpers';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

/**
 * GET /api/v1/conversations/[id]/messages
 * Get messages for a conversation
 */
export const GET = requireTalent()(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  user,
) => {
  try {
    const { id: conversationId } = await params;
    // 1. Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== user.userId &&
      conversation.participant2Id !== user.userId
    ) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // 3. Get pagination params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before')
      ? new Date(url.searchParams.get('before')!)
      : undefined;

    // 4. Get messages
    const messages = await getConversationMessages(conversationId, limit, before);

    // 5. Mark messages as read
    await markMessagesAsRead(conversationId, user.userId);

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Return in ascending order
    });
  } catch (error) {
    console.error('[Messages API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/conversations/[id]/messages
 * Send a message in a conversation
 */
export const POST = requireTalent()(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  user,
) => {
  try {
    const { id: conversationId } = await params;
    // 1. Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== user.userId &&
      conversation.participant2Id !== user.userId
    ) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request
    const body = await req.json();
    const { content } = sendMessageSchema.parse(body);

    // 4. Determine receiver
    const receiverId =
      conversation.participant1Id === user.userId
        ? conversation.participant2Id
        : conversation.participant1Id;

    // 5. Send message
    const message = await sendMessage(
      conversationId,
      user.userId,
      receiverId,
      content
    );

    return NextResponse.json({
      success: true,
      data: message,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Messages API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

