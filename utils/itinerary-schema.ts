import { Type } from "@google/genai";

// Step 1: Generate basic itinerary info
export const basicItinerarySchema = {
  type: Type.OBJECT,
  properties: {
    itineraries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Unique identifier for this itinerary",
          },
          title: {
            type: Type.STRING,
            description: "Catchy, descriptive title for the itinerary",
          },
          theme: {
            type: Type.STRING,
            description:
              "Brief description of what makes this itinerary unique",
          },
          duration: {
            type: Type.STRING,
            description: "Trip duration in format 'X days'",
          },
          destination: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING, description: "City name" },
              state: {
                type: Type.STRING,
                description: "State/Province (if applicable)",
              },
              country: { type: Type.STRING, description: "Country name" },
            },
            required: ["city", "country"],
          },
          traveler_profile: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description:
                  "Type of traveler: Solo, Couple, Family, Friends, Business",
              },
              goals_from_trip: {
                type: Type.STRING,
                description: "What the traveler hopes to achieve/experience",
              },
              pace_of_trip: {
                type: Type.STRING,
                description: "Trip pace: Relaxed, Moderate, Fast-paced, Mixed",
              },
            },
            required: ["type", "goals_from_trip", "pace_of_trip"],
          },
          budget_overview: {
            type: Type.OBJECT,
            properties: {
              budget_preference: {
                type: Type.STRING,
                description: "Budget category: Budget, Mid-range, or Luxury",
              },
              max_budget: {
                type: Type.STRING,
                description: "Approximate total budget in their local currency",
              },
            },
            required: ["budget_preference"],
          },
        },
        required: [
          "id",
          "title",
          "theme",
          "duration",
          "destination",
          "traveler_profile",
          "budget_overview",
        ],
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["itineraries"],
};

// Step 2: Generate daily plan for a specific itinerary
export const dailyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    daily_plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER, description: "Day number (1, 2, 3, etc.)" },
          theme: {
            type: Type.STRING,
            description: "Theme or focus for this specific day",
          },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time_slot: {
                  type: Type.STRING,
                  description:
                    "Time of day: Morning, Afternoon, Evening, Late Evening",
                },
                type: {
                  type: Type.STRING,
                  description:
                    "Type of activity: Activity, Meal, Transport, Rest",
                },
                title: {
                  type: Type.STRING,
                  description: "Name/title of the activity or meal",
                },
                description: {
                  type: Type.STRING,
                  description: "Detailed description (2-3 sentences)",
                },
                details: {
                  type: Type.OBJECT,
                  properties: {
                    location: {
                      type: Type.STRING,
                      description: "Specific location or address",
                    },
                    cost_estimation: {
                      type: Type.STRING,
                      description:
                        "Cost estimate (e.g., '$15-25', 'Free', '$50+')",
                    },
                    other_details: {
                      type: Type.STRING,
                      description:
                        "Additional relevant information (duration, booking info, etc.)",
                    },
                  },
                  required: ["location", "cost_estimation"],
                },
              },
              required: [
                "time_slot",
                "type",
                "title",
                "description",
                "details",
              ],
            },
            minItems: 4,
          },
        },
        required: ["day", "theme", "schedule"],
      },
      minItems: 1,
    },
  },
  required: ["daily_plan"],
};

// Step 3: Generate logistics for the complete trip
export const logisticsSchema = {
  type: Type.OBJECT,
  properties: {
    logistics: {
      type: Type.OBJECT,
      properties: {
        accommodation_details: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Name of the accommodation",
              },
              contact_details: {
                type: Type.STRING,
                description: "Phone number, email, or website",
              },
              address: {
                type: Type.STRING,
                description: "Full address of the accommodation",
              },
            },
            required: ["name", "address"],
          },
        },
        transport_options: {
          type: Type.STRING,
          description: "Transportation options from one place to another",
        },
        booking_details: {
          type: Type.STRING,
          description:
            "Any specific booking preferences or requirements from user",
        },
      },
    },
  },
  required: ["logistics"],
};
