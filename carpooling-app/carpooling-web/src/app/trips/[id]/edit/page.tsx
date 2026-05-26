import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTripById } from "@/lib/services/trips";
import { EditTripForm } from "./EditTripForm";

interface EditTripPageProps {
  params: Promise<{ id: string }>;
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;
  const tripId = parseInt(id, 10);

  if (!user) {
    redirect(`/login?next=/trips/${tripId}/edit`);
  }

  const trip = await getTripById(tripId);
  if (!trip) {
    redirect("/dashboard");
  }

  if (trip.driverId !== user.id) {
    redirect(`/trips/${tripId}`);
  }

  if (trip.state !== "upcoming" || trip.isCanceled) {
    redirect(`/trips/${tripId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <Link href={`/trips/${tripId}`} className="mb-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
          Back to trip
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Edit Trip</h1>
        <p className="mt-2 text-gray-600">
          {trip.origin} to {trip.destination}
        </p>
      </div>

      <EditTripForm
        tripId={tripId}
        currentDepartureTime={trip.departureTime}
        currentDepartureTimeLabel={formatTime(trip.departureTime)}
      />
    </div>
  );
}
