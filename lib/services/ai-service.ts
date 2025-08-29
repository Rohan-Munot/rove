import { generateText, ModelMessage } from "ai";
import { model } from "@/lib/ai/client";
import {
  generateBasicItineraries,
  generateDailyPlan,
  generateLogistics,
} from "./itinerary-service";
import { getOrGenerateDestinationContext } from "./cache-service";
import { SYSTEM_IDENTITY } from "@/lib/ai/prompts/base";
import { Itinerary } from "@/types/itinerary";
import { UserProfileResponse } from "@/types/user-profile";

export const generateResponse = async (
  userMessage: string,
  chatHistory?: ModelMessage[],
  userProfile?: UserProfileResponse
) => {
  try {
    const messages: ModelMessage[] = [
      ...(chatHistory || []),
      { role: "user", content: userMessage },
    ];

    const context = messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const hasEnoughInfo = hasRequiredInformation(userMessage, context);

    if (!hasEnoughInfo) {
      return await askForMissingInformation(messages);
    }

    // Use cached context gathering
    const enrichedContext = await getOrGenerateDestinationContext(
      userMessage,
      context
    );

    // Generate itineraries using the new service
    const basicItineraries = await generateBasicItineraries(
      userMessage,
      enrichedContext,
      userProfile
    );

    // Generate detailed plans for each itinerary
    const completeItineraries = await Promise.all(
      basicItineraries.itineraries.map(async (itinerary) => {
        const dailyPlan = await generateDailyPlan(
          itinerary as Itinerary,
          enrichedContext,
          userProfile
        );
        return { ...itinerary, daily_plan: dailyPlan.daily_plan };
      })
    );

    // Generate logistics
    const logistics = await generateLogistics(
      completeItineraries,
      userMessage,
      enrichedContext,
      userProfile
    );

    const finalItineraries = completeItineraries.map((itinerary) => ({
      ...itinerary,
      logistics: logistics.logistics,
    }));

    return {
      type: "itineraries",
      data: { itineraries: finalItineraries },
    };
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};

const askForMissingInformation = async (messages: ModelMessage[]) => {
  const { text } = await generateText({
    model,
    system: `${SYSTEM_IDENTITY}

Analyze the conversation and ask for any missing required information in a friendly way.

Required information:
- Destination (city/country)
- Trip duration (number of days)
- Traveler type (solo, couple, family, etc.)
- Interests (food, culture, adventure, etc.)
- Budget preference (budget, mid-range, luxury)`,
    messages: messages,
    temperature: 0.7,
  });

  return {
    type: "question",
    data: text,
  };
};

const hasRequiredInformation = (userMessage: string, context: string) => {
  const fullText = `${context} ${userMessage}`.toLowerCase();

  const hasDuration = /\b(\d+)\s*(day|days|week|weeks)\b/i.test(fullText);
  const hasTravelerType =
    /\b(solo|couple|family|friends|business|honeymoon)\b/i.test(fullText);
  const hasInterests =
    /\b(culture|food|adventure|history|art|relaxation|nightlife|shopping)\b/i.test(
      fullText
    );
  const hasBudget =
    /\b(budget|mid-range|luxury|cheap|expensive|mid\s*budget)\b/i.test(
      fullText
    );

  return hasDuration && hasTravelerType && hasInterests && hasBudget;
};
