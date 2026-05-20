import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getUserConversations } from "@/lib/conversation";

/**
 * GET /api/conversations
 * List all conversations for the current user with cursor-based pagination
 * Query params:
 *   - limit: number of items to return (default: 20)
 *   - cursor: conversation ID to start from (optional)
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor") || undefined;

    const result = await getUserConversations(limit, cursor);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log("[CONVERSATIONS_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations." },
      { status: 500 }
    );
  }
}
