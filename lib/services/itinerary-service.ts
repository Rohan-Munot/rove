import { generateObject, generateText } from "ai";
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
import {
  SYSTEM_IDENTITY,
  CONTEXT_GATHERING,
  TOOL_USAGE_GUIDELINES,
} from "@/lib/ai/prompts/base";
import { Itinerary } from "@/types/itinerary";
import { searchTools } from "@/lib/ai/tools/search-tool";

export const generateBasicItineraries = async (
  userMessage: string,
  context: string
) => {
  const { text: toolResults } = await generateText({
    model,
    tools: searchTools,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: `Research comprehensive information for the destination mentioned in: ${userMessage}. 

    You MUST gather the following information using the available tools:
    1. Use searchDestinationInfo for general destination information
    2. Use getCurrentInfo for current weather and seasonal events
    3. Use searchPricingInfo for activity costs and meal prices
    4. Use searchComprehensiveInfo for detailed attractions and experiences
    5. Use factCheckDetails to verify important contact information or venues
    
    Focus on: attractions, current weather, detailed pricing for activities and meals, travel requirements, and verify any specific venues mentioned.`,
    temperature: 0.3,
  });

  const { object } = await generateObject({
    model,
    schema: basicItinerarySchema,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: BASIC_ITINERARY_PROMPT(
      `${context}\n\nCurrent Research Data:\n${toolResults}`,
      userMessage
    ),
    temperature: 0.7,
  });

  return object;
};

export const generateDailyPlan = async (
  itinerary: Itinerary,
  context: string
) => {
  const { text: toolResults } = await generateText({
    model,
    tools: searchTools,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: `Research current information about ${itinerary.destination.city}, ${itinerary.destination.country}. Focus on current events, weather, and activity availability.
    
    You MUST gather the following information using the available tools:
    1. Use getCurrentInfo for current weather and seasonal events
    2. Use searchPricingInfo for activity costs and meal prices
    3. Use searchComprehensiveInfo for detailed attractions and experiences
    4. Use factCheckDetails to verify important contact information or venues
    
    `,
    temperature: 0.3,
  });

  const { object } = await generateObject({
    model,
    schema: dailyPlanSchema,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: DAILY_PLAN_PROMPT(
      itinerary,
      `${context}\n\nCurrent Information:\n${toolResults}`
    ),
    temperature: 0.6,
  });

  return object;
};

export const generateLogistics = async (
  itineraries: Itinerary[],
  userMessage: string,
  context: string
) => {
  const destination = itineraries[0]?.destination;

  const { text: toolResults } = await generateText({
    model,
    tools: searchTools,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: `Research current accommodation options, transportation details, and pricing for ${destination?.city}, ${destination?.country}.
    
    You MUST gather the following information using the available tools:
    1. Use searchPricingInfo for activity costs and meal prices
    2. Use searchComprehensiveInfo for detailed attractions and experiences
    3. Use factCheckDetails to verify important contact information or venues
    `,
    temperature: 0.3,
  });

  const { object } = await generateObject({
    model,
    schema: logisticsSchema,
    system: SYSTEM_IDENTITY + CONTEXT_GATHERING + TOOL_USAGE_GUIDELINES,
    prompt: `Generate practical logistics for ${destination?.city}, ${destination?.country}:
      
      ${context}
      Current Research: ${toolResults}
      User requirements: ${userMessage}     
      Provide accommodation options, transportation details, and booking guidance.`,
    temperature: 0.5,
  });

  return object;
};
