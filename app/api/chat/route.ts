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
  validateUIMessages,
  TypeValidationError,
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
  const { message, id }: { message: UIMessage; id: string } = await req.json();
  let previousMessages: UIMessage[];
  try {
    previousMessages = await loadChat(id);
    previousMessages = await validateUIMessages({
      messages: previousMessages,
    });
  } catch (err) {
    if (err instanceof TypeValidationError) {
      console.log("Invalid messages");
      previousMessages = [];
    } else {
      throw err;
    }
  }
  const allMessages = [...previousMessages, message];
  const modelMessages = convertToModelMessages(allMessages as UIMessage[]);
  const { text, info } = await generateChatResponse(modelMessages);
  const assistantMessage: UIMessage = {
    id: "",
    role: "assistant",
    parts: [{ type: "text", text }],
  };
  const finalMessages = [...allMessages, assistantMessage];
  await saveChat({ chatId: id, messages: finalMessages });

  let itinerary: any = null;
  if (info?.isAllInfoProvided) {
    console.log("All info provided itinerary generation started");
    itinerary = {
      destination: info.destination,
      duration: info.duration,
      travelerType: info.travelerType,
      interests: info.interests,
      budget: info.budget,
    };
  }
  return new Response(
    JSON.stringify({
      messages: finalMessages.map((m, idx) => ({
        ...m,
        id: `rove-msg-${idx.toString(16)}`,
      })),
      itinerary,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
  // try {
  //   const result = streamText({
  //     model: model,
  //     messages: convertToModelMessages(allMessages as UIMessage[]),
  //     experimental_transform: smoothStream(),
  //   });
  //   return result.toUIMessageStreamResponse({
  //     originalMessages: allMessages as UIMessage[],
  //     generateMessageId: createIdGenerator({ prefix: "rove-msg", size: 16 }),
  //     onFinish: ({ messages }) => {
  //       saveChat({ chatId: id, messages });
  //       console.log(
  //         `Chat saved with id ${id} and messages ${messages.length} `
  //       );
  //     },
  //   });
  // } catch (err) {
  //   console.log(err);
  //   const result = streamText({
  //     model: model,
  //     messages: convertToModelMessages(allMessages as UIMessage[]),
  //     experimental_transform: smoothStream(),
  //     system: SYSTEM_IDENTITY,
  //   });
  //   return result.toUIMessageStreamResponse({
  //     originalMessages: allMessages as UIMessage[],
  //     generateMessageId: createIdGenerator({ prefix: "rove-msg", size: 16 }),
  //     onFinish: ({ messages }) => {
  //       saveChat({ chatId: id, messages });
  //     },
  //   });
  // }
}
