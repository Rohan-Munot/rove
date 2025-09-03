import {
  tavily,
  TavilySearchOptions,
  TavilySearchResponse,
} from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const TrustedDomains = [
  "https://www.tripadvisor.in",
  "https://www.audleytravel.com",
  "https://www.reddit.com",
  "https://en.wikipedia.org/",
];
const excludedDomains = ["https://www.quora.com"];
export const searchWeb = async (options: TavilySearchOptions) => {
  try {
    const response = await tvly.search(options.query, {
      max_results: options.max_results || 7,
      search_depth: options.search_depth || "basic",
      include_answer: true,
      include_raw_content: options.include_raw_content || false,
      include_images: options.include_images || false,
      topic: options.topic,
      include_domains: TrustedDomains,
      exclude_domains: excludedDomains,
      ...(options.time_range && { time_range: options.time_range }),
    });
    return response;
  } catch (error) {
    console.error("Tavily search error:", error);
    throw new Error("Failed to perform web search");
  }
};

const processResults = (response: TavilySearchResponse) => {
  const filteredResults = response.results
    .filter((result) => result.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .map((result) => ({
      ...result,
      title: result.title,
      url: result.url,
      score: result.score,
      content: result.content,
    }));
  return {
    ...response,
    results: filteredResults,
  };
};
export const searchDestinationInfo = async (destination: string) => {
  const query = `"${destination}" travel guide attractions opening hours weather customs official tourism board`;
  console.log("Search Destination Info called");
  const response = await searchWeb({
    query: query,
    max_results: 8,
    search_depth: "advanced",
  });
  return processResults(response);
};

export const factCheckDetails = async (
  entityName: string,
  location: string
) => {
  const query = `official website and contact number for "${entityName}" in ${location}`;
  console.log("Fact Check Details Called");
  const response = await searchWeb({
    query: query,
    max_results: 3,
    search_depth: "basic",
  });
  return processResults(response);
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

  console.log("Get Comprehensive Info Called");

  const response = await searchWeb({
    query: query,
    max_results: 10,
    search_depth: "advanced",
  });
  return processResults(response);
};

export const searchPricingInfo = async (
  destination: string,
  activity: string
) => {
  const query = `pricing information about ${activity} in ${destination}`;
  console.log("Search Pricing Info Called");
  const response = await searchWeb({
    query: query,
    max_results: 4,
    search_depth: "basic",
    topic: "general",
  });
  return processResults(response);
};

export const searchCurrentDestinationInfo = async (destination: string) => {
  const query = `current travel conditions, seasonal events, and recent updates for ${destination}`;
  console.log("Search Current Destination Info Called");
  try {
    const response = await searchWeb({
      query: query,
      max_results: 5,
      search_depth: "basic",
      time_range: "month",
      topic: "news",
    });

    return processResults(response);
  } catch (error) {
    console.error("Tavily search error:", error);
    return { results: [], answer: "Information unavailable" };
  }
};
