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
import { Itinerary } from "@/types/itinerary";
import { UserProfileResponse } from "@/types/user-profile";

export const generateBasicItineraries = async (
  userMessage: string,
  context: string,
  userProfile?: UserProfileResponse
) => {
  const { object } = await generateObject({
    model,
    schema: basicItinerarySchema,
    system: SYSTEM_IDENTITY,
    prompt: BASIC_ITINERARY_PROMPT(context, userMessage, userProfile),
    temperature: 0.7,
  });

  return object;
};

export const generateDailyPlan = async (
  itinerary: Itinerary,
  context: string,
  userProfile?: UserProfileResponse
) => {
  const { object } = await generateObject({
    model,
    schema: dailyPlanSchema,
    system: SYSTEM_IDENTITY,
    prompt: DAILY_PLAN_PROMPT(itinerary, context, userProfile),
    temperature: 0.6,
  });

  return object;
};

export const generateLogistics = async (
  itineraries: Itinerary[],
  userMessage: string,
  context: string,
  userProfile?: UserProfileResponse
) => {
  const destination = itineraries[0]?.destination;

  const { object } = await generateObject({
    model,
    schema: logisticsSchema,
    system: SYSTEM_IDENTITY,
    prompt: `Generate practical logistics for ${destination?.city}, ${
      destination?.country
    }:
      
      ${context}
      User requirements: ${userMessage}
      
      ${
        userProfile
          ? `User's home country: ${userProfile.homeCountry}
      User's home currency: ${userProfile.homeCurrency}
      IMPORTANT: Show all costs in ${userProfile.homeCurrency} for better understanding.`
          : ""
      }
      
      Provide accommodation options, transportation details, and booking guidance.`,
    temperature: 0.5,
  });

  return object;
};
