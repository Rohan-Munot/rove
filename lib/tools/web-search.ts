import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY as string });

export const tools = {
  get_location_info: tool({
    description:
      "Get information about a location from the web this info can be any general info about the location",
    inputSchema: z.object({
      location: z.string().describe("The location to get information about"),
      query: z.string().describe("The query to search for"),
    }),
    execute: async ({ location, query }) => {
      console.log("🔧 Tool called with:", { location, query });
      const response = await tvly.search(query + " " + location, {
        maxResults: 7,

        includeAnswer: false,
      });
      console.log("📊 Tool response:", response);
      return response;
    },
  }),
  search_activities: tool({
    description:
      "Search for activities, attractions, and things to do in a specific location",
    inputSchema: z.object({
      location: z.string().describe("The destination city and country"),
      activity_type: z
        .string()
        .describe(
          "Type of activity: sightseeing, adventure, culture, food, shopping, nature, etc."
        ),
      budget_level: z
        .string()
        .describe("Budget level: budget, mid-range, luxury"),
    }),
    execute: async ({ location, activity_type, budget_level }) => {
      console.log("🔧 Activity search called with:", {
        location,
        activity_type,
        budget_level,
      });
      const query = `${activity_type} activities ${budget_level} ${location}`;
      const response = await tvly.search(query, {
        maxResults: 10,
        includeAnswer: true,
      });
      console.log("📊 Activity search response:", response);
      return response;
    },
  }),

  search_restaurants: tool({
    description:
      "Search for restaurants and dining options in a specific location",
    inputSchema: z.object({
      location: z.string().describe("The destination city and country"),
      cuisine_type: z
        .string()
        .describe("Type of cuisine: local, italian, asian, american, etc."),
      meal_type: z
        .string()
        .describe("Meal type: breakfast, lunch, dinner, snacks"),
      budget_level: z
        .string()
        .describe("Budget level: budget, mid-range, luxury"),
    }),
    execute: async ({ location, cuisine_type, meal_type, budget_level }) => {
      console.log("🔧 Restaurant search called with:", {
        location,
        cuisine_type,
        meal_type,
        budget_level,
      });
      const query = `${cuisine_type} ${meal_type} restaurants ${budget_level} ${location}`;
      const response = await tvly.search(query, {
        maxResults: 8,

        includeAnswer: true,
      });
      console.log("📊 Restaurant search response:", response);
      return response;
    },
  }),

  get_cost_estimation: tool({
    description:
      "Get cost estimates for travel, accommodation, food, and activities in a destination",
    inputSchema: z.object({
      location: z.string().describe("The destination city and country"),
      category: z
        .string()
        .describe(
          "Category: accommodation, food, transport, activities, total"
        ),
      budget_level: z
        .string()
        .describe("Budget level: budget, mid-range, luxury"),
      user_currency: z
        .string()
        .describe("User's home currency code (e.g., USD, EUR, INR)"),
      trip_duration_days: z.number().describe("Number of days for the trip"),
    }),
    execute: async ({
      location,
      category,
      budget_level,
      user_currency,
      trip_duration_days,
    }) => {
      console.log("🔧 Cost estimation called with:", {
        location,
        category,
        budget_level,
        user_currency,
        trip_duration_days,
      });
      const query = `cost of ${category} ${budget_level} ${location} in ${user_currency}`;
      const response = await tvly.search(query, {
        maxResults: 5,

        includeAnswer: true,
      });
      console.log("📊 Cost estimation response:", response);
      return response;
    },
  }),

  search_transportation: tool({
    description:
      "Search for transportation options including flights, trains, buses, and local transport",
    inputSchema: z.object({
      from_location: z.string().describe("Departure city and country"),
      to_location: z.string().describe("Destination city and country"),
      transport_type: z
        .string()
        .describe("Type: flights, trains, buses, car_rental, local_transport"),
      travel_date: z.string().describe("Travel date in YYYY-MM-DD format"),
      return_date: z.string().optional().describe("Return date if applicable"),
    }),
    execute: async ({
      from_location,
      to_location,
      transport_type,
      travel_date,
      return_date,
    }) => {
      console.log("🔧 Transportation search called with:", {
        from_location,
        to_location,
        transport_type,
        travel_date,
        return_date,
      });
      let query = `${transport_type} from ${from_location} to ${to_location}`;
      if (travel_date) query += ` on ${travel_date}`;
      if (return_date) query += ` returning ${return_date}`;

      const response = await tvly.search(query, {
        maxResults: 6,

        includeAnswer: true,
      });
      console.log("📊 Transportation search response:", response);
      return response;
    },
  }),

  search_accommodation: tool({
    description:
      "Search for accommodation options including hotels, hostels, apartments",
    inputSchema: z.object({
      location: z.string().describe("The destination city and country"),
      accommodation_type: z
        .string()
        .describe("Type: hotel, hostel, apartment, resort, guesthouse"),
      budget_level: z
        .string()
        .describe("Budget level: budget, mid-range, luxury"),
      check_in_date: z.string().describe("Check-in date in YYYY-MM-DD format"),
      check_out_date: z
        .string()
        .describe("Check-out date in YYYY-MM-DD format"),
    }),
    execute: async ({
      location,
      accommodation_type,
      budget_level,
      check_in_date,
      check_out_date,
    }) => {
      console.log("🔧 Accommodation search called with:", {
        location,
        accommodation_type,
        budget_level,
        check_in_date,
        check_out_date,
      });
      const query = `${accommodation_type} ${budget_level} ${location} from ${check_in_date} to ${check_out_date}`;
      const response = await tvly.search(query, {
        maxResults: 8,

        includeAnswer: true,
      });
      console.log("📊 Accommodation search response:", response);
      return response;
    },
  }),
};
