import {
  smoothStream,
  streamText,
  UIMessage,
  convertToModelMessages,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { tools } from "@/lib/tools/web-search";

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: `You are Rove, an AI Trip Manager. Help users plan comprehensive trips and generate detailed itineraries.
Today is ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })} based on the current date and time.

Key capabilities:
- Generate complete itineraries with daily schedules
- Provide cost estimations in the user's home currency
- Suggest multiple travel options between destinations
- Research activities, restaurants, accommodation, and transportation
- Always respond in context relative to the user's location
- Focus on practical, actionable travel advice

Process:
1) Research phase (tools): Use the available tools to gather facts. Ask clarifying questions if essential.

Research bundle requirements:
- Output MUST be a single JSON object, no markdown fences, no extra text.
- Shape (keep it compact and normalized):

`,
        },
        ...convertToModelMessages(messages),
      ],
      experimental_transform: smoothStream(),
      tools,
      toolChoice: "auto",
      stopWhen: stepCountIs(20),
    });
    console.log(JSON.stringify(result, null, 2));
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
