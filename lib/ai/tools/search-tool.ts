// File: lib/services/search.ts (or your existing search file)

import { tavily } from "@tavily/core";
import { SearchOptions } from "@/types/search-tool";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const searchWeb = async (options: SearchOptions) => {
  try {
    const response = await tvly.search(options.query, {
      max_results: options.maxResults || 5,
      search_depth: options.searchDepth || "basic",
      include_answer: true,
      include_raw_content: false,
      include_images: options.include_images || false,
    });
    return response;
  } catch (error) {
    console.error("Tavily search error:", error);
    throw new Error("Failed to perform web search");
  }
};

export const searchDestinationInfo = async (destination: string) => {
  const query = `in-depth travel guide for ${destination}, including major tourist attractions with opening hours, best time to visit based on weather, and local customs.`;
  return await searchWeb({
    query: query,
    maxResults: 5,
  });
};

export const factCheckDetails = async (
  entityName: string,
  location: string
) => {
  const query = `official website and contact number for "${entityName}" in ${location}`;
  return await searchWeb({
    query: query,
    maxResults: 2,
  });
};

export const getComprehensiveInfo = async (
  destination: string,
  interests: string[]
) => {
  const interestsQuery = interests.join(", ");
  const query = `Comprehensive travel information for ${destination}. 
  Include:
  1. Top attractions related to ${interestsQuery}.
  2. Hidden gems and authentic local experiences for someone interested in ${interestsQuery}.
  3. Average cost for mid-range meals and popular activities.
  4. Best neighborhoods to stay in for easy access to these interests.`;

  return await searchWeb({
    query: query,
    maxResults: 10,
    searchDepth: "advanced",
  });
};
