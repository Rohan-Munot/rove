import { Itinerary } from "@/types/itinerary";

export const BASIC_ITINERARY_PROMPT = (
  context: string,
  userMessage: string
) => `
${context}

User requirements: ${userMessage}

Generate 3 distinct itinerary concepts for the same destination, each with a unique focus:
1. Culture & History focused
2. Adventure & Activities focused  
3. Relaxation & Local Experience focused

Each itinerary should match the user's specified duration, budget, and traveler type.
Ensure cost estimations are in the appropriate currency for the user's location.
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

Create a realistic daily schedule with:
- Appropriate timing between activities
- Budget-appropriate recommendations
- Mix of must-see attractions and local experiences
- Practical transportation suggestions
`;
