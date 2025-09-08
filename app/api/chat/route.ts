import { model } from "@/lib/ai/client";
import { loadChat, saveChat } from "@/utils/store/chat-store";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  smoothStream,
  createIdGenerator,
} from "ai";

export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response("No id provided", { status: 400 });
  }
  const messages = await loadChat(id);
  return new Response(JSON.stringify(messages), { status: 200 });
}

export async function POST(req: Request) {
  const { message, id }: { message: UIMessage[]; id: string } =
    await req.json();
  const previousMessages = await loadChat(id);
  const allMessages = [...previousMessages, message];
  const result = streamText({
    model: model,
    messages: convertToModelMessages(allMessages as UIMessage[]),
    experimental_transform: smoothStream(),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: allMessages as UIMessage[],
    generateMessageId: createIdGenerator({ prefix: "rove-msg", size: 16 }),
    onFinish: ({ messages }) => {
      saveChat({ chatId: id, messages });
    },
  });
}
