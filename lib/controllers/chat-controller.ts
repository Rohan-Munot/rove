import { TripService } from "@/lib/services/trip-service";
import { ChatService } from "@/lib/services/chat-service";
import { AIService } from "@/lib/services/ai-service";
import { ItineraryResponse } from "@/types/itinerary";

export class ChatController {
  static async handleNewChat(userId: string, message: string) {
    try {
      const tripId = await TripService.createTrip(userId);
      await ChatService.addUserMessage(tripId, message);

      const aiResponse = await AIService.generateResponse(message);

      if (aiResponse.type === "question") {
        await ChatService.addAiMessage(tripId, aiResponse.data as string);
        return {
          type: "question",
          reply: aiResponse.data as string,
          tripId,
        };
      } else {
        const itineraryData = aiResponse.data as ItineraryResponse;
        await TripService.saveItineraryOptions(
          tripId,
          itineraryData.itineraries
        );
        await ChatService.addAiMessage(tripId, JSON.stringify(itineraryData));
        return {
          type: "itineraries",
          itineraries: itineraryData.itineraries,
          tripId,
        };
      }
    } catch (error) {
      console.error("Error in handleNewChat:", error);
      throw new Error("Failed to start chat");
    }
  }

  static async handleExistingChat(
    userId: string,
    tripId: string,
    message: string
  ) {
    try {
      const trip = await TripService.getTripByUserandId(userId, tripId);
      if (!trip) {
        throw new Error("Trip not found or unauthorized");
      }

      const chatHistory = await TripService.getChatHistory(tripId);
      await ChatService.addUserMessage(tripId, message);

      const aiResponse = await AIService.generateResponse(message, chatHistory);

      if (aiResponse.type === "question") {
        await ChatService.addAiMessage(tripId, aiResponse.data as string);
        return {
          type: "question",
          reply: aiResponse.data as string,
          tripId,
        };
      } else {
        const itineraryData = aiResponse.data as ItineraryResponse;
        await TripService.saveItineraryOptions(
          tripId,
          itineraryData.itineraries
        );
        await ChatService.addAiMessage(tripId, JSON.stringify(itineraryData));
        return {
          type: "itineraries",
          itineraries: itineraryData.itineraries,
          tripId,
        };
      }
    } catch (error) {
      console.error("Error in handleExistingChat:", error);
      throw new Error("Failed to continue chat");
    }
  }
}
