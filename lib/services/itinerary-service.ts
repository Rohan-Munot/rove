import { generateObject } from "ai";
import { model } from "@/lib/ai/client";
import {
  basicItinerarySchema,
  dailyPlanSchema,
  logisticsSchema,
} from "@/utils/schemas/itinerary-schema";
import {
  BASIC_ITINERARY_PROMPT,
  DAILY_PLAN_PROMPT,
} from "@/lib/ai/prompts/itinerary";
import { SYSTEM_IDENTITY } from "@/lib/ai/prompts/base";

export class ItineraryService {
  static async generateBasicItineraries(userMessage: string, context: string) {
    const { object } = await generateObject({
      model,
      schema: basicItinerarySchema,
      system: SYSTEM_IDENTITY,
      prompt: BASIC_ITINERARY_PROMPT(context, userMessage),
      temperature: 0.7,
    });

    return object;
  }

  static async generateDailyPlan(itinerary: any, context: string) {
    const { object } = await generateObject({
      model,
      schema: dailyPlanSchema,
      system: SYSTEM_IDENTITY,
      prompt: DAILY_PLAN_PROMPT(itinerary, context),
      temperature: 0.6,
    });

    return object;
  }

  static async generateLogistics(
    itineraries: any[],
    userMessage: string,
    context: string
  ) {
    const destination = itineraries[0]?.destination;

    const { object } = await generateObject({
      model,
      schema: logisticsSchema,
      system: SYSTEM_IDENTITY,
      prompt: `Generate practical logistics for ${destination?.city}, ${destination?.country}:
      
      ${context}
      User requirements: ${userMessage}
      
      Provide accommodation options, transportation details, and booking guidance.`,
      temperature: 0.5,
    });

    return object;
  }
}
