import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOpenTrips } from "@/lib/services/trips";

interface TripsPageProps {
  searchParams?: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
    available?: string;
    availableOnly?: string;
    page?: string;
  }>;
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function buildPageHref(
  params: URLSearchParams,
  page: number
): string {
  const nextParams = new URLSearchParams(params);
  nextParams.set("page", page.toString());
  return `/trips?${nextParams.toString()}`;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const params = await searchParams;
  const origin = params?.origin?.trim() || "";
  const destination = params?.destination?.trim() || "";
  const date = params?.date?.trim() || "";
  const availableOnly = params?.available === "1" || params?.availableOnly === "1";
  const hasSearchFilters = Boolean(origin || destination || date || availableOnly);
  const page = Math.max(Number(params?.page || "1"), 1);
  const pageSize = 10;

  const queryParams = new URLSearchParams();
  if (origin) queryParams.set("origin", origin);
  if (destination) queryParams.set("destination", destination);
  if (date) queryParams.set("date", date);
  if (availableOnly) queryParams.set("available", "1");

  const user = await getCurrentUser();
  if (!user) {
    const nextPath = queryParams.size > 0 ? `/trips?${queryParams.toString()}` : "/trips";
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const result = hasSearchFilters
    ? await getOpenTrips(page, pageSize, {
        origin,
        destination,
        date,
        availableOnly,
      })
    : null;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="mb-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
          Back to home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Find Trips</h1>
        <p className="mt-2 text-gray-600">Search upcoming carpools and join a ride heading your way.</p>
      </div>

      <form action="/trips" method="get" className="mb-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Origin
          <input
            name="origin"
            type="text"
            defaultValue={origin}
            placeholder="City or neighborhood"
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Destination
          <input
            name="destination"
            type="text"
            defaultValue={destination}
            placeholder="City or neighborhood"
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Date
          <input
            name="date"
            type="date"
            defaultValue={date}
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <div className="flex flex-col justify-between gap-3">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              name="available"
              type="checkbox"
              value="1"
              defaultChecked={availableOnly}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Available seats only
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Search Trips
          </button>
        </div>
      </form>

      {!result ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="font-semibold text-gray-900">Start by searching for a trip.</p>
          <p className="mt-2 text-gray-600">Enter an origin, destination, date, or choose available seats only.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-700">
              {result.total} matching trip{result.total === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-gray-600">
              Page {result.page} of {totalPages}
            </p>
          </div>

          {result.trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">No upcoming trips match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.trips.map((trip) => {
            const seatsLeft = trip.capacity - trip.passengerCount;
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {trip.origin} to {trip.destination}
                  </h2>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${trip.isFullCapacity ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {trip.isFullCapacity ? "Full" : "Open"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(trip.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{formatTime(trip.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Driver</p>
                    <span className="font-semibold text-gray-900">{trip.driverName}</span>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">€{trip.pricePerSeat}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4 text-sm font-semibold text-gray-900">
                  {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} available` : "No seats available"}
                </div>
              </Link>
            );
          })}
        </div>
      )}
        </>
      )}

      {result && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={buildPageHref(queryParams, Math.max(1, result.page - 1))}
            aria-disabled={result.page === 1}
            className={`rounded-xl px-5 py-3 font-semibold ${result.page === 1 ? "pointer-events-none bg-gray-100 text-gray-400" : "bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"}`}
          >
            Previous
          </Link>
          <Link
            href={buildPageHref(queryParams, Math.min(totalPages, result.page + 1))}
            aria-disabled={result.page >= totalPages}
            className={`rounded-xl px-5 py-3 font-semibold ${result.page >= totalPages ? "pointer-events-none bg-gray-100 text-gray-400" : "bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
