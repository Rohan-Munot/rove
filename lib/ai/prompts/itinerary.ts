import { Itinerary } from "@/types/itinerary";

export const BASIC_ITINERARY_PROMPT = (
  context: string,
  userMessage: string
) => `
${context}
User requirements: ${userMessage}

**Important**: Before generating the itineraries, use the available search tools to find up-to-date information on attractions, activities, and pricing. This is crucial for ensuring the suggestions are accurate and relevant.

Generate 3 distinct itinerary concepts for the same destination, each with a unique focus:
1. Culture & History focused
2. Adventure & Activities focused  
3. Relaxation & Local Experience focused

Each itinerary should match the user's specified duration, budget, and traveler type.
Provide realistic cost estimations based on your search results.
`;

export const DAILY_PLAN_PROMPT = (itinerary: Itinerary, context: string) => `
Create a detailed daily schedule for this itinerary:

Title: ${itinerary.title}
Theme: ${itinerary.theme}
Duration: ${itinerary.duration}
Destination: ${itinerary.destination.city}, ${itinerary.destination.country}
Budget: ${itinerary.budget_overview.budget_preference}
Traveler Type: ${itinerary.traveler_profile.type}
Goals: ${itinerary.traveler_profile.goals_from_trip}

Context: ${context}

**Important**: Use the available search tools to verify all details. Check for current opening hours, ticket prices, travel times between locations, and any seasonal events or closures. Fact-check details like contact numbers and websites.

Create a realistic daily schedule with:
- Appropriate timing between activities
- Budget-appropriate recommendations based on verified pricing
- Mix of must-see attractions and local experiences
- Practical transportation suggestions
`;

export const STREAMING_ITINERARY_PROMPT = (context: string) => `
Based on the following conversation history, analyze the user's request.

Conversation:
---
${context}
---

Your task is to decide on one of two actions:

1.  **If you have ALL the necessary information** (destination, trip duration, traveler type, interests, and budget preference), generate a comprehensive travel plan. You MUST return an object with \`type: "itineraries"\` containing an array of 3 distinct itinerary options.

2.  **If ANY information is missing**, you MUST ask a clarifying question to the user. Return an object with \`type: "question"\` and the question text in the \`question\` field. Do NOT make up information.

Required Information Checklist:
- Destination (city/country)
- Trip duration (number of days)
- Traveler type (solo, couple, family, etc.)
- Interests (food, culture, adventure, etc.)
- Budget preference (budget, mid-range, luxury)

Analyze the conversation and proceed.
`;
