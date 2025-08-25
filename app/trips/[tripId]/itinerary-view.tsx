// app/trips/[tripId]/ItineraryView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Itinerary } from "@/types/itinerary";

export default function ItineraryView({
  tripId,
  itineraries: initialItineraries,
}: {
  tripId: string;
  itineraries: Itinerary[];
}) {
  const [itineraries, setItineraries] =
    useState<Itinerary[]>(initialItineraries);
  const [selected, setSelected] = useState<number | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [clarify, setClarify] = useState<string | null>(null);
  const [clarifyAnswer, setClarifyAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const send = async (message: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, tripID: tripId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      if (data.type === "question") {
        setClarify(data.reply);
        setClarifyAnswer("");
      } else if (data.type === "itineraries") {
        // DB is updated server-side; refresh to fetch latest
        setClarify(null);
        setRefinePrompt("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Trip</h1>
            <p className="text-gray-600 text-sm mt-1">
              {itineraries.length} itinerary option
              {itineraries.length !== 1 ? "s" : ""} generated
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {!clarify ? (
          <>
            <h2 className="text-lg font-semibold mb-2">Refine itinerary</h2>
            <textarea
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder="e.g., Make day 2 more food-focused, reduce budget, add kid-friendly activity"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
              rows={2}
            />
            <div className="mt-3">
              <Button
                onClick={() => refinePrompt.trim() && send(refinePrompt)}
                disabled={isLoading || !refinePrompt.trim()}
              >
                {isLoading ? "Working..." : "Apply refinements"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">One more detail</h2>
            <p className="text-gray-700 mb-3">{clarify}</p>
            <textarea
              value={clarifyAnswer}
              onChange={(e) => setClarifyAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
              rows={2}
            />
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => clarifyAnswer.trim() && send(clarifyAnswer)}
                disabled={isLoading || !clarifyAnswer.trim()}
              >
                {isLoading ? "Working..." : "Continue"}
              </Button>
              <Button variant="outline" onClick={() => setClarify(null)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {itineraries.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Your personalized itineraries will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraries.map((itinerary, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selected === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelected(selected === index ? null : index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{itinerary.title}</h3>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {itinerary.duration}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{itinerary.theme}</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {itinerary.budget}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {itinerary.traveler_type}
                  </span>
                </div>

                {selected === index && (
                  <div className="mt-4 space-y-4">
                    {itinerary.daily_plan.map((day, dayIndex) => (
                      <div key={dayIndex} className="border-t pt-4">
                        <h4 className="font-semibold text-sm text-blue-600 mb-2">
                          Day {day.day}: {day.theme}
                        </h4>
                        <div className="space-y-2">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {activity.time}
                                </span>
                                {activity.cost_estimate && (
                                  <span className="text-gray-500">
                                    {activity.cost_estimate}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700">
                                {activity.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
