import { tool } from "ai";
import z from "zod";
import * as searchToolDefinition from "./search-tool-definition";

export const searchTools = {
  searchDestinationInfo: tool({
    description:
      "Search for comprehensive destination information including attractions, weather, and travel requirements",
    inputSchema: z.object({
      destination: z.string().describe("The destination to search for"),
    }),
    execute: async ({ destination }) => {
      return await searchToolDefinition.searchDestinationInfo(destination);
    },
  }),

  getCurrentInfo: tool({
    description:
      "Get the current information about a destination, like weather, events, seasonal updates, cultural events, etc",
    inputSchema: z.object({
      destination: z.string().describe("The destination to search for"),
    }),
    execute: async ({ destination }) => {
      return await searchToolDefinition.searchCurrentDestinationInfo(
        destination
      );
    },
  }),

  searchPricingInfo: tool({
    description:
      "Search for pricing information about a destination, activities, etc",
    inputSchema: z.object({
      destination: z.string().describe("The destination to search for"),
      activity: z.string().describe("The activity to search for"),
    }),
    execute: async ({ destination, activity }) => {
      return await searchToolDefinition.searchPricingInfo(
        destination,
        activity
      );
    },
  }),

  searchFactCheckInfo: tool({
    description:
      "Use this tool to fact check the information about a destination, like contact numbers, website, etc",
    inputSchema: z.object({
      entityName: z.string().describe("The entity name to search for"),
      location: z.string().describe("The location to search for"),
    }),
    execute: async ({ entityName, location }) => {
      return await searchToolDefinition.factCheckDetails(entityName, location);
    },
  }),

  searchComprehensiveInfo: tool({
    description:
      "Search for comprehensive information about a destination, like attractions, activities, pricing, etc",
    inputSchema: z.object({
      destination: z.string().describe("The destination to search for"),
      interests: z.array(z.string()).describe("The interests to search for"),
    }),
    execute: async ({ destination, interests }) => {
      return await searchToolDefinition.getComprehensiveInfo(
        destination,
        interests
      );
    },
  }),
};
