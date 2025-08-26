import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ChatController } from "@/lib/controllers/chat-controller";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, tripId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const result = tripId
      ? await ChatController.handleExistingChat(
          session.user.id,
          tripId,
          message
        )
      : await ChatController.handleNewChat(session.user.id, message);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
