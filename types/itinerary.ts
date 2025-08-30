export interface Destination {
  city: string;
  state?: string;
  country: string;
}

export interface TravelerProfile {
  type: string;
  goals_from_trip: string;
  pace_of_trip: string;
}

export interface BudgetOverview {
  budget_preference: string;
  max_budget?: string;
}

export interface ActivityDetails {
  location: string;
  cost_estimation: string;
  other_details?: string;
}

export interface ScheduleItem {
  time_slot: string;
  type: string;
  title: string;
  description: string;
  details: ActivityDetails;
}

export interface DayPlan {
  day: number;
  theme: string;
  schedule: ScheduleItem[];
}

export interface AccommodationDetails {
  name: string;
  contact_details?: string;
  address: string;
}

export interface Logistics {
  accommodation_details?: AccommodationDetails[];
  transport_options?: string;
  booking_details?: string;
}

export interface Itinerary {
  id?: string;
  title: string;
  theme: string;
  duration: string;
  destination: Destination;
  traveling_from?: Destination;
  traveler_profile: TravelerProfile;
  budget_overview: BudgetOverview;
  daily_plan: DayPlan[];
  logistics?: Logistics;
}

export interface ItineraryResponse {
  itineraries: Itinerary[];
}
