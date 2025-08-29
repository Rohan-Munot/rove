import { Itinerary } from "@/types/itinerary";
import { UserProfile } from "@/types/user-profile";

export const BASIC_ITINERARY_PROMPT = (
  context: string,
  userMessage: string,
  userProfile?: UserProfile
) => `
${context}

${
  userProfile
    ? `👤 User Profile:
- Home Country: ${userProfile.homeCountry}
- Home Currency: ${userProfile.homeCurrency}
- Preferred Language: ${userProfile.preferredLanguage}

IMPORTANT: All cost estimations must be shown in ${userProfile.homeCurrency}.
Convert local prices to user's currency for better understanding and comparison.`
    : ""
}

User requirements: ${userMessage}

Generate 3 distinct itinerary concepts for the same destination, each with a unique focus:
1. Culture & History focused
2. Adventure & Activities focused  
3. Relaxation & Local Experience focused

Each itinerary should match the user's specified duration, budget, and traveler type.
${
  userProfile
    ? `Ensure cost estimations are in the appropriate currency (${userProfile.homeCurrency}).`
    : "Provide realistic cost estimations."
}
`;

export const DAILY_PLAN_PROMPT = (
  itinerary: Itinerary,
  context: string,
  userProfile?: UserProfile
) => `
Create a detailed daily schedule for this itinerary:

Title: ${itinerary.title}
Theme: ${itinerary.theme}
Duration: ${itinerary.duration}
Destination: ${itinerary.destination.city}, ${itinerary.destination.country}
Budget: ${itinerary.budget_overview.budget_preference}
Traveler Type: ${itinerary.traveler_profile.type}
Goals: ${itinerary.traveler_profile.goals_from_trip}

${
  userProfile
    ? `User's home currency: ${userProfile.homeCurrency}
IMPORTANT: Show all costs in ${userProfile.homeCurrency}.`
    : ""
}

Context: ${context}

Create a realistic daily schedule with:
- Appropriate timing between activities
- Budget-appropriate recommendations
- Mix of must-see attractions and local experiences
- Practical transportation suggestions
${userProfile ? `- Cost estimates in ${userProfile.homeCurrency}` : ""}
`;
