import {
  createTrip,
  getTripByUserandId,
  getChatHistory,
  saveItineraryOptions,
} from "@/lib/services/trip-service";
import { addAiMessage, addUserMessage } from "@/lib/services/chat-service";
import { generateResponse } from "@/lib/services/ai-service";
import { ItineraryResponse } from "@/types/itinerary";

export async function handleNewChat(userId: string, message: string) {
  try {
    const tripId = await createTrip(userId);
    await addUserMessage(tripId, message);

    const aiResponse = await generateResponse(message);

    if (aiResponse?.type === "question") {
      await addAiMessage(tripId, aiResponse.data as string);
      return {
        type: "question" as const,
        reply: aiResponse.data as string,
        tripId,
      };
    } else {
      const itineraryData = aiResponse?.data as ItineraryResponse;
      await saveItineraryOptions(tripId, itineraryData.itineraries);
      await addAiMessage(tripId, JSON.stringify(itineraryData));
      return {
        type: "itineraries" as const,
        itineraries: itineraryData.itineraries,
        tripId,
      };
    }
  } catch (error) {
    console.error("Error in handleNewChat:", error);
    throw new Error("Failed to start chat");
  }
}

export async function handleExistingChat(
  userId: string,
  tripId: string,
  message: string
) {
  try {
    const trip = await getTripByUserandId(userId, tripId);
    if (!trip) {
      throw new Error("Trip not found or unauthorized");
    }

    const chatHistory = await getChatHistory(tripId);
    await addUserMessage(tripId, message);

    const aiResponse = await generateResponse(message, chatHistory);

    if (aiResponse?.type === "question") {
      await addAiMessage(tripId, aiResponse.data as string);
      return {
        type: "question",
        reply: aiResponse.data as string,
        tripId,
      };
    } else {
      const itineraryData = aiResponse?.data as ItineraryResponse;
      await saveItineraryOptions(tripId, itineraryData.itineraries);
      await addAiMessage(tripId, JSON.stringify(itineraryData));
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
