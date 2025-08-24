export class AIService {
  static async generateResponse(userMessage: string, chatHistory?: any[]) {
    // TODO: Integrate with Gemini API
    const isFirstMessage = !chatHistory || chatHistory.length === 0;
    if (isFirstMessage) {
      return "That sounds exciting! To help me plan, what is your budget for this trip (e.g., budget, mid-range, or luxury)?";
    }
    return "Thanks for the additional information! Let me help you plan your trip further.";
  }
  static async generateItinerary(tripDetails: any) {
    // TODO: Generate full itinerary
  }
  static async suggestActivities(location: string, preferences: any) {
    // TODO: Suggest activities
  }
}
