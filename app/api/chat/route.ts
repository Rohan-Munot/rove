import { model } from "@/lib/ai/client";
import { SYSTEM_IDENTITY } from "@/lib/ai/prompts/base";
import { loadChat, saveChat } from "@/utils/store/chat-store";
import { generateChatResponse } from "@/lib/services/ai-service";
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
  const modelMessages = convertToModelMessages(allMessages as UIMessage[]);
  try {
    const result = await generateChatResponse(modelMessages);
    return result.toUIMessageStreamResponse({
      originalMessages: allMessages as UIMessage[],
      generateMessageId: createIdGenerator({ prefix: "rove-msg", size: 16 }),
      onFinish: ({ messages }) => {
        saveChat({ chatId: id, messages });
      },
    });
  } catch (err) {
    console.log(err);
    const result = streamText({
      model: model,
      messages: modelMessages,
      experimental_transform: smoothStream(),
      system: SYSTEM_IDENTITY,
    });
    return result.toUIMessageStreamResponse({
      originalMessages: allMessages as UIMessage[],
      generateMessageId: createIdGenerator({ prefix: "rove-msg", size: 16 }),
      onFinish: ({ messages }) => {
        saveChat({ chatId: id, messages });
      },
    });
  }
}
