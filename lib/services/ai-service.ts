import { ModelMessage, streamText } from "ai";
import { model } from "@/lib/ai/client";
import { SYSTEM_IDENTITY } from "@/lib/ai/prompts/base";

export const generateChatResponse = async (messages: ModelMessage[]) => {
  const result = streamText({
    model,
    system:
      SYSTEM_IDENTITY +
      `
You are helping users plan their travel itineraries. Follow this approach:

1. If the user hasn't provided complete travel information, ask ONE specific follow-up question to gather missing details.

Required information for planning:
- Destination (specific city/country)
- Trip duration (number of days)
- Traveler type (solo, couple, family, etc.)
- Interests/preferences (food, culture, adventure, etc.)
- Budget preference (budget, mid-range, luxury)

2. If you have ALL the required information, respond with: "Perfect! I have all the details I need. Let me create some amazing itineraries for you! (Simulation mode - actual generation coming soon)"

Be conversational, friendly, and ask only one question at a time.`,
    messages: messages,
    temperature: 0.3,
  });

  return result;
};
