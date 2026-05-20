import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {
  getConversation,
  deleteConversation,
  updateConversationTitle,
} from "@/lib/conversation";

/**
 * GET /api/conversations/[conversationId]
 * Get a specific conversation with all messages
 */
export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await getConversation(params.conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.log("[CONVERSATION_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[conversationId]
 * Update conversation title
 */
export async function PATCH(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await updateConversationTitle(params.conversationId, title);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("[CONVERSATION_UPDATE_ERROR]", error);

    if (error.message === "Conversation not found") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update conversation." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[conversationId]
 * Delete a conversation and all its messages
 */
export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteConversation(params.conversationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("[CONVERSATION_DELETE_ERROR]", error);

    if (error.message === "Conversation not found") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete conversation." },
      { status: 500 }
    );
  }
}
