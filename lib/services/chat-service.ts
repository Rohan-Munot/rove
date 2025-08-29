import { db } from "@/database";
import * as schema from "@/database/db/schema";
import { ChatRole } from "@/types/chat";

export const addMessage = async (
  tripId: string,
  role: ChatRole,
  content: string
) => {
  const [message] = await db
    .insert(schema.chatMessages)
    .values({
      tripId,
      role,
      content,
    })
    .returning();

  return message;
};

export const addUserMessage = async (tripId: string, content: string) => {
  return addMessage(tripId, "user", content);
};

export const addAiMessage = async (tripId: string, content: string) => {
  return addMessage(tripId, "ai", content);
};
