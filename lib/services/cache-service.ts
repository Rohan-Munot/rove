import { generateText } from "ai";
import { model } from "@/lib/ai/client";
import { SYSTEM_IDENTITY, CONTEXT_GATHERING } from "@/lib/ai/prompts/base";
import { db } from "@/database";
import { destinationCache } from "@/database/db/schema";
import { and, eq, gt } from "drizzle-orm";

export const getOrGenerateDestinationContext = async (
  userMessage: string,
  context: string
): Promise<string> => {
  // Extract destination for cache key
  const destinationMatch = userMessage.match(
    /(?:to|visit|going|trip to|traveling to)\s+([a-zA-Z\s,]+)/i
  );
  const destination = destinationMatch?.[1]?.trim().toLowerCase() || "unknown";

  if (destination === "unknown") {
    // Don't cache for unknown destinations, just generate
    const { text } = await generateText({
      model,
      system: `${SYSTEM_IDENTITY}\n\n${CONTEXT_GATHERING}`,
      prompt: `${context}\n\nUser: ${userMessage}`,
      temperature: 0.3,
    });
    return `${context}\n\nAdditional Context: ${text}`;
  }

  // Try to get from database cache first
  const cachedEntries = await db
    .select()
    .from(destinationCache)
    .where(
      and(
        eq(destinationCache.destination, destination),
        gt(destinationCache.expiresAt, new Date())
      )
    )
    .limit(1);

  const cached = cachedEntries[0];
  if (cached) {
    console.log(`Cache hit for destination: ${destination}`);
    return `${context}\n\nCached Context: ${cached.contextData}`;
  }

  // Generate new context
  console.log(
    `Cache miss for destination: ${destination}, generating new context...`
  );
  const { text } = await generateText({
    model,
    system: `${SYSTEM_IDENTITY}\n\n${CONTEXT_GATHERING}`,
    prompt: `${context}\n\nUser: ${userMessage}`,
    temperature: 0.3,
  });

  // Cache the result for 24 hours
  const ttlMinutes = 1440;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await db
    .insert(destinationCache)
    .values({
      destination,
      contextData: text,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: destinationCache.destination,
      set: {
        contextData: text,
        expiresAt: expiresAt,
      },
    });

  return `${context}\n\nAdditional Context: ${text}`;
};

export const clearCache = async () => {
  console.log("Clearing destination cache...");
  await db.delete(destinationCache);
  console.log("Cache cleared.");
};
