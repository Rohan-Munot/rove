import { generateId, UIMessage } from "ai";
import { db } from "@/database";
import * as schema from "@/database/db/schema";
import { eq } from "drizzle-orm";

export async function createChat({
  userId,
}: {
  userId: string;
}): Promise<string> {
  const id = generateId();
  await db.insert(schema.chatSessions).values({
    id,
    userId,
    messages: [] as UIMessage[],
  });
  return id;
}
export async function loadChat(id: string): Promise<UIMessage[]> {
  const [chat] = await db
    .select()
    .from(schema.chatSessions)
    .where(eq(schema.chatSessions.id, id));
  return (chat?.messages as UIMessage[] | undefined) || [];
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  await db
    .insert(schema.chatSessions)
    .values({
      id: chatId,
      messages,
    })
    .onConflictDoUpdate({
      target: schema.chatSessions.id,
      set: { messages },
    });
}
