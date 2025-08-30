import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getTripByUserandId } from "@/lib/services/trip-service";
import ItineraryView from "./itinerary-view";
import { Itinerary } from "@/types/itinerary";

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return <div className="p-8">Unauthorized</div>;
  }

  const trip = await getTripByUserandId(session.user.id, tripId);

  if (!trip) {
    return <div className="p-8">Trip not found</div>;
  }

  const itineraries = trip.itineraryOptions as Itinerary[];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <ItineraryView tripId={tripId} itineraries={itineraries} />
      </div>
    </div>
  );
}
