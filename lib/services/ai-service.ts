import {
  generateObject,
  generateText,
  ModelMessage,
  streamText,
  tool,
} from "ai";
import { model } from "@/lib/ai/client";
import { SYSTEM_IDENTITY } from "@/lib/ai/prompts/base";
import { z } from "zod";
import { searchWeb } from "../ai/tools/search-tool-definition";

export const generateChatResponse = async (messages: ModelMessage[]) => {
  const result = streamText({
    model,
    system:
      SYSTEM_IDENTITY +
      `
You are helping users plan their travel itineraries. Follow this approach:

1. If the user hasn't provided complete travel information, ask ONE specific follow-up question to gather missing details.

Required information for planning:
- Destination (specific city/country)
- Trip duration (number of days)
- Traveler type (solo, couple, family, etc.)
- Interests/preferences (food, culture, adventure, etc.)
- Budget preference (budget, mid-range, luxury)

2. If you have ALL the required information, respond with: "Perfect! I have all the details I need. Let me create some amazing itineraries for you! (Simulation mode - actual generation coming soon)"

Be conversational, friendly, and ask only one question at a time.`,
    messages: messages,
    temperature: 0.3,
  });

  return result;
};

type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};
type Learning = {
  learning: string;
  followupQuestions: string[];
  category:
    | "food"
    | "culture"
    | "adventure"
    | "history"
    | "nature"
    | "attractions"
    | "events"
    | "transportation"
    | "accommodation"
    | "other";
};
type TravelSearch = {
  originalQuery: string;
  destination: string;
  queries: string[];
  searchResults: SearchResult[];
  learnings: Learning[];
  completedQueries: string[];
  researchDepth: number;
};
const RESEARCH_SYSTEM_PROMPT = `You are an expert travel researcher. Today is ${new Date().toISOString()}. Follow these instructions:
- Research comprehensive travel information with high accuracy
- Focus on current, actionable travel advice
- Consider seasonal factors, local events, and practical logistics
- Prioritize verified information from trusted sources
- Be detailed and thorough in your analysis
- Anticipate traveler needs and potential issues
- Consider cultural sensitivity and local customs
- Use Markdown formatting for clarity`;

let accumalatedResearch: TravelSearch = {
  originalQuery: "",
  destination: "",
  queries: [],
  searchResults: [],
  learnings: [],
  completedQueries: [],
  researchDepth: 0,
};
const generateSearchQueries = async (query: string) => {
  const {
    object: { queries },
  } = await generateObject({
    model,
    prompt: `Generate 5 specific travel research queries for ${query}
    Focus on these aspects: 
      - Current Attractions and Activities
      - Seasonal Events and Festivals
      - Local Customs and Traditions
      - Practical Logistics (Transportation, Accommodation, etc.)
      - Current Weather and Climate
      - Local Cuisine and Dining Options
      - Local Culture and History
    `,
    schema: z.object({
      queries: z.array(z.string()).min(1).max(5),
    }),
  });
  return queries;
};
const performSearch = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await searchWeb({ query, max_results: 5 });
    return response.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
    }));
  } catch (error) {
    console.error("Error performing search:", error);
    return [];
  }
};
const performAndEvaluateSearch = async (
  query: string,
  accumulatedSources: SearchResult[]
): Promise<SearchResult[]> => {
  try {
    const pendingSearchResults: SearchResult[] = [];
    const finalResults: SearchResult[] = [];

    await generateText({
      model,
      prompt: `Research travel information for: ${query}`,
      system: RESEARCH_SYSTEM_PROMPT,
      tools: {
        searchWeb: tool({
          description:
            "Search the web for travel information and find resources",
          inputSchema: z.object({
            query: z.string().min(1),
          }),
          execute: async ({
            query,
          }: {
            query: string;
          }): Promise<SearchResult[]> => {
            const results = await performSearch(query);
            pendingSearchResults.push(...results);
            return results;
          },
        }),
        evaluate: tool({
          description: "Evaluate the search results",
          inputSchema: z.object({}),
          execute: async (): Promise<string> => {
            const pendingResult = pendingSearchResults.pop()!;
            const { object: evaluation } = await generateObject({
              model,
              prompt: `Evaluate whether the search results are relevant and will help answer the following query: ${query}. If the page already exists in the existing results, mark it as irrelevant.
 
            <search_results>
            ${JSON.stringify(pendingResult)}
            </search_results>
             <existing_sources>
            ${JSON.stringify(accumulatedSources.map((r) => r.url))}
            </existing_sources>
            `,
              output: "enum",
              enum: ["relevant", "irrelevant"],
            });
            if (evaluation === "relevant") {
              finalResults.push(pendingResult);
            }
            console.log("Found:", pendingResult.url);
            console.log("Evaluation completed:", evaluation);
            return evaluation === "irrelevant"
              ? "Search results are irrelevant. Please search again with a more specific query."
              : "Search results are relevant. End research for this query.";
          },
        }),
      },
    });

    return finalResults;
  } catch (error) {
    console.error("Error performing and evaluating search:", error);
    return [];
  }
};

const generateLearnings = async (
  query: string,
  searchResults: SearchResult[]
): Promise<Learning[]> => {
  const { object } = await generateObject({
    model,
    prompt: `Generate learnings from the following search results for the query: "${query}" 
      Extract travel insights, practical information, and any other relevant details from the search results.
      <search_results>
      ${JSON.stringify(searchResults)}
      </search_results>

      Categorize the learnings into  categories and suggest follow up research queries.
    `,
    schema: z.object({
      learnings: z
        .array(
          z.object({
            learning: z
              .string()
              .min(1)
              .max(5)
              .describe(
                "Key travel insights, practical information, and any other relevant details"
              ),
            followupQuestions: z
              .array(z.string())
              .min(1)
              .max(5)
              .describe(
                "Follow up research queries to gather more information"
              ),
            category: z
              .enum([
                "food",
                "culture",
                "adventure",
                "history",
                "nature",
                "attractions",
                "events",
                "transportation",
                "accommodation",
                "other",
              ])
              .describe("The category of the learning"),
          })
        )
        .min(1)
        .max(5),
    }),
  });
  return object.learnings;
};

const deepResearch = async (
  query: string,
  depth: number
): Promise<TravelSearch> => {
  if (!accumalatedResearch.originalQuery) {
    accumalatedResearch.originalQuery = query;
    accumalatedResearch.researchDepth = depth;
    const destinationMatch = query.match(
      /(?:to|in|visiting)\s+([A-Z][a-zA-Z\s,]+)/i
    );
    accumalatedResearch.destination = destinationMatch?.[1] || "destination";
  }
  if (depth === 0) return accumalatedResearch;

  const queries = await generateSearchQueries(query);
  accumalatedResearch.queries.push(...queries);
  for (const query of queries) {
    console.log("Generating search results for:", query);
    const searchResults = await performAndEvaluateSearch(
      query,
      accumalatedResearch.searchResults
    );
    accumalatedResearch.searchResults.push(...searchResults);

    for (const searchResult of searchResults) {
      console.log("Generating learnings for:", searchResult.url);
      const learnings = await generateLearnings(query, [searchResult]);
      accumalatedResearch.learnings.push(...learnings);
      accumalatedResearch.completedQueries.push(query);

      if (learnings[0].followupQuestions.length > 0) {
        const newQuery = `Original goal: ${accumalatedResearch.originalQuery}
        Previous research: ${accumalatedResearch.completedQueries.join(", ")}
        Current focus: ${learnings[0].followupQuestions.join(", ")}
        Destination: ${accumalatedResearch.destination}`;
        await deepResearch(newQuery, depth - 1);
      }
    }
  }
  return accumalatedResearch;
};

const generateTravelReport = async (
  research: TravelSearch
): Promise<string> => {
  const { text } = await generateText({
    model,
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: `Generate a comprehensive travel research report based on the following data:

    ${JSON.stringify(research, null, 2)}
    
    Structure the report with:
    1. Executive Summary of destination
    2. Key Attractions & Activities
    3. Practical Travel Information
    4. Cultural Insights & Local Customs
    5. Budget & Pricing Information
    6. Seasonal Considerations
    7. Recommendations & Tips
    
    Make it actionable for travel planning.`,
  });

  return text;
};

export const conductTravelResearch = async (
  travelQuery: string,
  depth: number = 2
): Promise<{ research: TravelSearch; report: string }> => {
  accumalatedResearch = {
    originalQuery: "",
    destination: "",
    queries: [],
    searchResults: [],
    learnings: [],
    completedQueries: [],
    researchDepth: 0,
  };
  console.log(`🚀 Starting deep travel research for: ${travelQuery}`);
  const research = await deepResearch(travelQuery, depth);
  console.log("📝 Generating comprehensive travel report...");
  const report = await generateTravelReport(research);
  console.log("✅ Travel research completed!");
  return { research, report };
};
