import { Itinerary } from "./itinerary";

export type ChatRole = "user" | "ai";

export type ChatAPIResponse =
  | {
      type: "question";
      reply: string;
      tripId: string;
    }
  | {
      type: "itineraries";
      itineraries: Itinerary[];
      tripId: string;
    };
