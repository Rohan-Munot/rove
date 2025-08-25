import { GoogleGenAI } from "@google/genai";
import { ItineraryResponse } from "@/types/itinerary";

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

      const systemPrompt = `You are "TripGenie," a world-class AI travel assistant. Your goal is to create 3 detailed, distinct itinerary options.

**CRITICAL INSTRUCTIONS:**
1.  **Information Gathering Phase:** You MUST first collect all of the following required information. If any piece is missing from the conversation history, your ONLY job is to ask a friendly, clarifying question to get it. DO NOT create an itinerary yet.
    * Destination: City/Country
    * Trip Duration: Number of days
    * Traveler Type: Solo, couple, family, etc.
    * Interests: Food, history, adventure, art, relaxation, etc.
    * Budget: Budget, mid-range, or luxury.

2.  **Generation Phase:** Once you have ALL the above information, and ONLY then, your response MUST be a single, valid JSON object following this EXACT structure:

{
  "itineraries": [
    {
      "title": "Catchy title for this itinerary",
      "theme": "Brief description of what makes this itinerary unique",
      "duration": "X days",
      "traveler_type": "Solo/Couple/Family/etc",
      "budget": "Budget/Mid-range/Luxury",
      "daily_plan": [
        {
          "day": 1,
          "theme": "Theme for this day",
          "activities": [
            {
              "time": "Morning/Afternoon/Evening/Late Evening",
              "activity_name": "Name of the activity",
              "description": "Detailed description (2-3 sentences)",
              "duration": "X hours",
              "cost_estimate": "$XX - $XX (or Free)"
            }
            // MINIMUM 4-5 activities per day
          ],
          "meal_suggestions": [
            {
              "time": "Breakfast/Lunch/Dinner",
              "restaurant_name": "Specific restaurant name or type",
              "description": "What to try and why",
              "cost_estimate": "$XX - $XX"
            }
          ]
        }
        // Repeat for each day
      ]
    }
    // Create 3 distinct itineraries
  ]
}

**IMPORTANT REQUIREMENTS:**
- Each day MUST have 4-5 activities minimum
- Activities should align with the interests provided (${
        userMessage.includes("food") ? "food experiences" : ""
      }${userMessage.includes("adventure") ? "adventurous activities" : ""}${
        userMessage.includes("history") ? "historical sites" : ""
      })
- Budget should influence activity choices and cost estimates
- Each itinerary should have a different theme/focus
- Include specific names of places, restaurants, and attractions
- Provide realistic time estimates and costs

Do not include any text before or after the JSON object.

---
**User's new message:**
      ${userMessage}`;

      const fullPrompt = isFirstMessage
        ? `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
        : `${systemPrompt}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          tools: [groundingTool],
        },
      });

      const responseText =
        (response as any)?.text ?? (response as any)?.response?.text?.() ?? "";

      if (responseText && this.isJsonResponse(responseText)) {
        const parsedResponse = this.parseAndValidateJson(responseText);
        return {
          type: "itineraries",
          data: parsedResponse,
        };
      } else {
        return {
          type: "question",
          data: responseText,
        };
      }
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  private static isJsonResponse(text: string): boolean {
    const trimmed = text.trim();

    // Check if the response contains JSON in markdown code blocks
    if (trimmed.includes("```json") && trimmed.includes("```")) {
      return true;
    }

    // Check for JSON wrapped in markdown code blocks at the start/end
    if (trimmed.startsWith("```json") && trimmed.endsWith("```")) {
      return true;
    }
    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
      return true;
    }

    // Check for plain JSON
    return trimmed.startsWith("{") && trimmed.endsWith("}");
  }

  private static parseAndValidateJson(jsonString: string): ItineraryResponse {
    try {
      let cleanJson = jsonString.trim();

      // Extract JSON from mixed content (text + JSON in markdown)
      const jsonMatch = cleanJson.match(/```json\s*\n([\s\S]*?)\n\s*```/);
      if (jsonMatch) {
        cleanJson = jsonMatch[1];
      } else {
        // Handle other markdown block formats
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        }
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
      }

      const parsed = JSON.parse(cleanJson) as ItineraryResponse;

      if (!parsed.itineraries || !Array.isArray(parsed.itineraries)) {
        throw new Error("Invalid JSON structure: missing itineraries array");
      }

      if (parsed.itineraries.length === 0) {
        throw new Error("No itineraries found in response");
      }

      parsed.itineraries.forEach((itinerary, index) => {
        if (!itinerary.title || !itinerary.theme || !itinerary.daily_plan) {
          throw new Error(`Itinerary ${index + 1} is missing required fields`);
        }

        if (
          !Array.isArray(itinerary.daily_plan) ||
          itinerary.daily_plan.length === 0
        ) {
          throw new Error(`Itinerary ${index + 1} has invalid daily_plan`);
        }
      });

      return parsed;
    } catch (error) {
      console.error("JSON parsing/validation error:", error);
      throw new Error(
        `Failed to parse AI response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
