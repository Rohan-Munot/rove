// types/itinerary.ts
export interface Itinerary {
  title: string;
  theme: string;
  duration: string;
  traveler_type: string;
  budget: string;
  daily_plan: DayPlan[];
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
  meal_suggestions: MealSuggestion[];
}

export interface Activity {
  time: string;
  activity_name?: string;
  description: string;
  duration?: string;
  cost_estimate?: string;
}

export interface MealSuggestion {
  time: string;
  restaurant_name?: string;
  description: string;
  cost_estimate?: string;
}

export interface ItineraryResponse {
  itineraries: Itinerary[];
}
