import { GoogleGenAI } from "@google/genai";
import { ItineraryResponse } from "@/types/itinerary";
import {
  basicItinerarySchema,
  dailyPlanSchema,
  logisticsSchema,
} from "@/utils/itinerary-schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const groundingTool = { googleSearch: {} };

export class AIService {
  static async generateResponse(userMessage: string, chatHistory?: any[]) {
    try {
      const isFirstMessage = !chatHistory || chatHistory.length === 0;
      let context = "";
      if (!isFirstMessage && chatHistory) {
        context = chatHistory
          .map((message) => `${message.role}: ${message.content}`)
          .join("\n");
      }

      // Check if we have enough information to generate itineraries
      const hasEnoughInfo = this.hasRequiredInformation(userMessage, context);

      if (!hasEnoughInfo) {
        return await this.askForMissingInformation(userMessage, context);
      }

      // Generate itineraries iteratively
      return await this.generateIterativeItineraries(userMessage, context);
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  private static hasRequiredInformation(
    userMessage: string,
    context: string
  ): boolean {
    const fullText = `${context} ${userMessage}`.toLowerCase();

    // Check for required information
    const hasDestination =
      /\b(to|visit|going|trip to|traveling to)\s+([a-zA-Z\s]+)/i.test(
        fullText
      ) || /\b([a-zA-Z]+)\s*,\s*([a-zA-Z]+)/i.test(fullText);
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

    return (
      hasDestination &&
      hasDuration &&
      hasTravelerType &&
      hasInterests &&
      hasBudget
    );
  }

  private static async askForMissingInformation(
    userMessage: string,
    context: string
  ) {
    const systemPrompt = `You are "Rove," an AI travel assistant. Analyze the conversation and ask for any missing required information in a friendly, conversational way.

Required information:
- Destination (city/country)
- Trip duration (number of days)
- Traveler type (solo, couple, family, etc.)
- Interests (food, culture, adventure, etc.)
- Budget preference (budget, mid-range, luxury)

Context: ${context || "This is the first message"}
User message: ${userMessage}

Ask for missing information in a single, friendly message. If most information is provided, just ask for what's missing specifically.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 0 }, // Increased thinking budget
      },
    });

    return {
      type: "question",
      data:
        response.text ??
        "Could you provide more details about your trip preferences?",
    };
  }

  private static async generateIterativeItineraries(
    userMessage: string,
    context: string
  ) {
    try {
      // Step 0: Gather additional information using tools (optional)
      const enrichedContext = await this.gatherAdditionalInfo(
        userMessage,
        context
      );

      // Step 1: Generate basic itinerary information (without tools)
      console.log("Step 1: Generating basic itinerary information...");
      const basicItineraries = await this.generateBasicItineraries(
        userMessage,
        enrichedContext
      );

      // Step 2: Generate detailed daily plans for each itinerary
      console.log("Step 2: Generating detailed daily plans...");
      const completeItineraries = await Promise.all(
        basicItineraries.itineraries.map(async (itinerary: any) => {
          const dailyPlan = await this.generateDailyPlan(
            itinerary,
            userMessage,
            enrichedContext
          );
          return { ...itinerary, daily_plan: dailyPlan.daily_plan };
        })
      );

      // Step 3: Generate logistics information
      console.log("Step 3: Generating logistics information...");
      const logistics = await this.generateLogistics(
        completeItineraries,
        userMessage,
        enrichedContext
      );

      // Combine everything
      const finalItineraries = completeItineraries.map((itinerary) => ({
        ...itinerary,
        logistics: logistics.logistics,
      }));

      return {
        type: "itineraries",
        data: { itineraries: finalItineraries },
      };
    } catch (error) {
      console.error("Error in iterative generation:", error);
      throw error;
    }
  }

  private static async gatherAdditionalInfo(
    userMessage: string,
    context: string
  ) {
    const systemPrompt = `You are "Rove," an AI travel assistant. Use web search to gather current information about the destination mentioned in the user's request. Focus on:
- Current attractions and activities
- Recent restaurant recommendations
- Transportation options
- Accommodation suggestions
- Local events or seasonal considerations

Summarize the key findings that would be useful for creating travel itineraries.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${context}\n\nUser: ${userMessage}`,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 20000 },
        tools: [groundingTool], // Use tools here for information gathering
      },
    });

    return `${context}\n\nAdditional Context: ${response.text}`;
  }

  private static async generateBasicItineraries(
    userMessage: string,
    context: string
  ) {
    const systemPrompt = `You are "Rove," an AI travel assistant. Generate 3 distinct basic itinerary concepts based on the user's requirements.

Context: ${context}
User requirements: ${userMessage}

Focus on creating 3 different themes/approaches for the same destination. Each should have a unique focus (e.g., culture-focused, adventure-focused, relaxation-focused).

Generate ONLY the JSON object with basic itinerary information. No additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${context}\n\nUser: ${userMessage}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: basicItinerarySchema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return JSON.parse(response.text ?? "{}");
  }

  private static async generateDailyPlan(
    itinerary: any,
    userMessage: string,
    context: string
  ) {
    const systemPrompt = `You are "Rove," an AI travel assistant. Generate a detailed daily plan for this specific itinerary:

Title: ${itinerary.title}
Theme: ${itinerary.theme}
Duration: ${itinerary.duration}
Destination: ${itinerary.destination.city}, ${itinerary.destination.country}
Traveler Profile: ${itinerary.traveler_profile.type}
Budget: ${itinerary.budget_overview.budget_preference}
Goals: ${itinerary.traveler_profile.goals_from_trip}

Original user requirements: ${userMessage}
Context: ${context}

Create a detailed daily schedule that matches this itinerary's theme and the traveler's preferences. Include specific locations, realistic timing, and appropriate activities for the budget level.

Generate ONLY the JSON object with daily plan information. No additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate daily plan for: ${itinerary.title}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: dailyPlanSchema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return JSON.parse(response.text ?? "{}");
  }

  private static async generateLogistics(
    itineraries: any[],
    userMessage: string,
    context: string
  ) {
    const destination = itineraries[0]?.destination;
    const budget = itineraries[0]?.budget_overview?.budget_preference;
    const duration = itineraries[0]?.duration;

    const systemPrompt = `You are "Rove," an AI travel assistant. Generate logistics information for a trip to ${destination?.city}, ${destination?.country}.

Trip details:
- Duration: ${duration}
- Budget: ${budget}
- Destination: ${destination?.city}, ${destination?.country}

User requirements: ${userMessage}
Context: ${context}

Provide practical logistics information including accommodation recommendations, transportation options, and booking details.

Generate ONLY the JSON object with logistics information. No additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate logistics for ${destination?.city}, ${destination?.country}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: logisticsSchema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return JSON.parse(response.text ?? "{}");
  }
}
