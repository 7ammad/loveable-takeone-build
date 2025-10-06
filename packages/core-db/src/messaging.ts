import { prisma } from './client';
import type { Conversation, Message } from '@prisma/client';

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
  // Ensure consistent ordering for uniqueness
  const [participant1Id, participant2Id] = [userId1, userId2].sort();

  // Try to find existing conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      participant1Id_participant2Id: {
        participant1Id,
        participant2Id,
      },
    },
  });

  // Create if doesn't exist
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id,
        participant2Id,
      },
    });
  }

  return conversation;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<any[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get last message
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  // Count unread messages for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          receiverId: userId,
          readAt: null,
        },
      });

      return {
        ...conv,
        unreadCount,
      };
    })
  );

  return conversationsWithUnread;
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  return prisma.$transaction(async (tx) => {
    // Create message
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
      },
    });

    // Update conversation's lastMessageAt
    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  });
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  before?: Date
): Promise<Message[]> {
  return prisma.message.findMany({
    where: {
      conversationId,
      ...(before && { createdAt: { lt: before } }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      receiverId: userId,
      readAt: null,
    },
  });
}

