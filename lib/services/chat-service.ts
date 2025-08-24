import { db } from "@/database";
import * as schema from "@/database/db/schema";
import { ChatRole } from "@/types/chat";

export class ChatService {
  static async addMessage(tripId: string, role: ChatRole, content: string) {
    const [message] = await db
      .insert(schema.chatMessages)
      .values({
        tripId,
        role,
        content,
      })
      .returning();

    return message;
  }

  static async addUserMessage(tripId: string, content: string) {
    return this.addMessage(tripId, "user", content);
  }

  static async addAiMessage(tripId: string, content: string) {
    return this.addMessage(tripId, "ai", content);
  }
}
