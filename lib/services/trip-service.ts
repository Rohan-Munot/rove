import { db } from "@/database";
import * as schema from "@/database/db/schema";
import { and, eq } from "drizzle-orm";

export class TripService {
  static async createTrip(userId: string) {
    const newTrip = await db
      .insert(schema.trips)
      .values({ userId })
      .returning({ id: schema.trips.id });
    return newTrip[0].id;
  }
  static async getTripByUserandId(userId: string, tripId: string) {
    const [trip] = await db
      .select()
      .from(schema.trips)
      .where(and(eq(schema.trips.id, tripId), eq(schema.trips.userId, userId)));
    return trip;
  }
  static async getChatHistory(tripId: string) {
    const chatHistory = await db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.tripId, tripId))
      .orderBy(schema.chatMessages.createdAt);
    return chatHistory;
  }
}
