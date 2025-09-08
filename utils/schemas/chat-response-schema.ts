import { z } from "zod";
import { fullItineraryObjectSchema } from "./itinerary-schema";
export const chatResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("question"),
    question: z.string().describe("A clarifying question to ask the user"),
  }),
  z.object({
    type: z.literal("itineraries"),
    itineraries: z
      .array(fullItineraryObjectSchema)
      .length(3)
      .describe("Array of exactly 3 distinct itinerary options"),
  }),
]);
