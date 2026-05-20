import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

/**
 * Generates a title from a message (takes first 50 chars)
 */
const generateTitle = (message: string): string => {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= 50) {
    return cleanMessage;
  }
  return cleanMessage.substring(0, 47) + "...";
};

/**
 * Creates a new conversation for the current user
 */
export const createConversation = async (title?: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const conversation = await prismadb.conversation.create({
    data: {
      userId,
      title: title || "New Conversation",
    },
  });

  return conversation;
};

/**
 * Adds a message to a conversation
 */
export const addMessage = async (
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the conversation belongs to the user
  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = await prismadb.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });

  // Auto-generate title from first user message
  const shouldUpdateTitle =
    conversation.title === "New Conversation" &&
    conversation._count.messages === 0 &&
    role === "user";

  if (shouldUpdateTitle) {
    await prismadb.conversation.update({
      where: { id: conversationId },
      data: {
        title: generateTitle(content),
        updatedAt: new Date(),
      },
    });
  } else {
    // Update conversation timestamp
    await prismadb.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  return message;
};

/**
 * Gets all conversations for the current user with cursor-based pagination
 */
export const getUserConversations = async (limit = 20, cursor?: string) => {
  const { userId } = auth();

  if (!userId) {
    return { conversations: [], nextCursor: null };
  }

  // Fetch one extra to determine if there are more results
  const conversations = await prismadb.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // Get first message for preview
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  let nextCursor: string | null = null;

  if (conversations.length > limit) {
    const nextItem = conversations.pop(); // Remove the extra item
    nextCursor = nextItem!.id;
  }

  return { conversations, nextCursor };
};

/**
 * Gets a specific conversation with all messages
 */
export const getConversation = async (conversationId: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return conversation;
};

/**
 * Deletes a conversation and all its messages
 */
export const deleteConversation = async (conversationId: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership before deleting
  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await prismadb.conversation.delete({
    where: { id: conversationId },
  });

  return { success: true };
};

/**
 * Updates conversation title
 */
export const updateConversationTitle = async (
  conversationId: string,
  title: string
) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const conversation = await prismadb.conversation.updateMany({
    where: {
      id: conversationId,
      userId,
    },
    data: { title },
  });

  if (conversation.count === 0) {
    throw new Error("Conversation not found");
  }

  return { success: true };
};
