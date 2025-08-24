export type ChatRole = "user" | "ai";
export interface ChatMessage {
  id: string;
  tripId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  name: string;
  userId: string;
  itinerary: string; // TODO: add itinerary type
  createdAt: Date;
}

export interface ChatRequest {
  message: string;
  tripID?: string;
}

export interface ChatResponse {
  reply: string;
  tripId?: string;
}
