import { z } from "zod";

export const destinationSchema = z.object({
  city: z.string().describe("City name"),
  state: z.string().optional().describe("State/Province (if applicable)"),
  country: z.string().describe("Country name"),
});

export const travelerProfileSchema = z.object({
  type: z
    .string()
    .describe("Type of traveler: Solo, Couple, Family, Friends, Business"),
  goals_from_trip: z
    .string()
    .describe("What the traveler hopes to achieve/experience"),
  pace_of_trip: z
    .string()
    .describe("Trip pace: Relaxed, Moderate, Fast-paced, Mixed"),
});

export const budgetOverviewSchema = z.object({
  budget_preference: z
    .string()
    .describe("Budget category: Budget, Mid-range, or Luxury"),
  max_budget: z
    .string()
    .optional()
    .describe("Approximate total budget in their local currency"),
});

export const basicItinerarySchema = z.object({
  itineraries: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for this itinerary"),
        title: z
          .string()
          .describe("Catchy, descriptive title for the itinerary"),
        theme: z
          .string()
          .describe("Brief description of what makes this itinerary unique"),
        duration: z.string().describe("Trip duration in format 'X days'"),
        destination: destinationSchema,
        traveler_profile: travelerProfileSchema,
        budget_overview: budgetOverviewSchema,
      })
    )
    .min(3)
    .max(3),
});

export const scheduleItemSchema = z.object({
  time_slot: z
    .string()
    .describe("Time of day: Morning, Afternoon, Evening, Late Evening"),
  type: z
    .string()
    .describe("Type of activity: Activity, Meal, Transport, Rest"),
  title: z.string().describe("Name/title of the activity or meal"),
  description: z.string().describe("Detailed description (2-3 sentences)"),
  details: z.object({
    location: z.string().describe("Specific location or address"),
    cost_estimation: z
      .string()
      .describe("Cost estimate (e.g., '$15-25', 'Free', '$50+')"),
    other_details: z
      .string()
      .optional()
      .describe("Additional relevant information"),
  }),
});

export const dailyPlanSchema = z.object({
  daily_plan: z
    .array(
      z.object({
        day: z.number().describe("Day number (1, 2, 3, etc.)"),
        theme: z.string().describe("Theme or focus for this specific day"),
        schedule: z.array(scheduleItemSchema).min(2),
      })
    )
    .min(1),
});

export const logisticsSchema = z.object({
  logistics: z.object({
    accommodation_details: z
      .array(
        z.object({
          name: z.string().describe("Name of the accommodation"),
          contact_details: z
            .string()
            .optional()
            .describe("Phone number and/or website"),
          address: z.string().describe("Full address of the accommodation"),
        })
      )
      .optional(),
    transport_options: z.string().optional().describe("Transportation options"),
    booking_details: z
      .string()
      .optional()
      .describe("Booking preferences or requirements"),
  }),
});
