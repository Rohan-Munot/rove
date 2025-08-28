import { Itinerary } from "./itinerary";
import { StreamTextResult } from "ai";

export type ChatRole = "user" | "ai";

interface BaseChatResponse {
  tripId: string;
}

export interface StreamingQuestionResponse extends BaseChatResponse {
  type: "question_stream";
  stream: StreamTextResult<Record<string, never>, string>;
}

export interface ItinerariesResponse extends BaseChatResponse {
  type: "itineraries";
  itineraries: Itinerary[];
}

export type ChatControllerResponse =
  | StreamingQuestionResponse
  | ItinerariesResponse;

export type ChatAPIResponse = ItinerariesResponse;

export interface ChatRequest {
  message: string;
  tripId?: string;
}

export interface StreamingState {
  isStreaming: boolean;
  accumulatedText: string;
  isComplete: boolean;
}
