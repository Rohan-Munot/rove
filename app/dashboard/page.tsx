"use client";

import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { data: session, isPending } = useSession();
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [tripId, setTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (isPending) return <div className="p-8">Loading...</div>;
  if (!session) return <div className="p-8">Unauthorized</div>;

  const send = async (message: string, existingTripId?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ...(existingTripId && { tripId: existingTripId }),
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      if (data.type === "question") {
        setTripId(data.tripId);
        setQuestion(data.reply);
        setAnswer("");
      } else if (data.type === "itineraries") {
        setTripId(data.tripId);
        router.push(`/trips/${data.tripId}`);
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const onStart = () => {
    if (!prompt.trim() || isLoading) return;
    send(prompt);
  };

  const onAnswer = () => {
    if (!answer.trim() || isLoading || !tripId) return;
    send(answer, tripId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trip Planner</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {session.user.name}!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {!question ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Describe your ideal trip
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Example: "5 days in Tokyo for a couple, love food and culture,
                mid-range budget"
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tell me about destination, days, traveler type, interests, and budget..."
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                rows={3}
              />
              <div className="mt-4">
                <Button
                  onClick={onStart}
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? "Working..." : "Generate itinerary"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">One more detail</h2>
              <p className="text-gray-700 mb-3">{question}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                rows={2}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={onAnswer}
                  disabled={isLoading || !answer.trim()}
                >
                  {isLoading ? "Working..." : "Continue"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuestion(null);
                    setAnswer("");
                  }}
                >
                  Edit initial prompt
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
