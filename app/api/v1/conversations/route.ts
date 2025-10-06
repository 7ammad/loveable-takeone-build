import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { getUserConversations, getOrCreateConversation } from '@packages/core-db/src/messaging';
import { prisma } from '@packages/core-db';
import { z } from 'zod';

const createConversationSchema = z.object({
  otherUserId: z.string(),
});

/**
 * GET /api/v1/conversations
 * Get all conversations for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Get conversations
    const conversations = await getUserConversations(payload.userId);

    // 3. Enrich with user details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.participant1Id === payload.userId
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
}

/**
 * POST /api/v1/conversations
 * Create or get a conversation with another user
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
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
    const conversation = await getOrCreateConversation(payload.userId, otherUserId);

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
}

