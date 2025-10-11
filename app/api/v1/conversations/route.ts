import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, getOrCreateConversation } from '@packages/core-db/src/messaging';
import { prisma } from '@packages/core-db';
import { z } from 'zod';
import { requireTalent } from '@/lib/auth-helpers';

const createConversationSchema = z.object({
  otherUserId: z.string(),
});

/**
 * GET /api/v1/conversations
 * Get all conversations for the authenticated user
 */
export const GET = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    // 1. Get conversations
    const conversations = await getUserConversations(user.userId);

    // 3. Enrich with user details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.participant1Id === user.userId
            ? conv.participant2Id
            : conv.participant1Id;

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, name: true, avatar: true, role: true },
        });

        return {
          id: conv.id,
          otherUser,
          lastMessage: conv.messages[0] || null,
          unreadCount: conv.unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedConversations,
    });
  } catch (error) {
    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/conversations
 * Create or get a conversation with another user
 */
export const POST = requireTalent()(async (req: NextRequest, _context, user) => {
  try {
    // 1. Parse and validate request
    const body = await req.json();
    const { otherUserId } = createConversationSchema.parse(body);

    // 3. Validate that the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatar: true, role: true },
    });

    if (!otherUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Get or create conversation
    const conversation = await getOrCreateConversation(user.userId, otherUserId);

    return NextResponse.json({
      success: true,
      data: {
        id: conversation.id,
        otherUser,
        createdAt: conversation.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

