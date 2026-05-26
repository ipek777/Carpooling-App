import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserTripsPage } from "@/lib/services/trips";
import { TripCard } from "@/components/TripCard";

function buildDashboardPageHref(
  currentParams: URLSearchParams,
  key: "upcomingPage" | "pastPage",
  page: number
) {
  const nextParams = new URLSearchParams(currentParams);
  nextParams.set(key, page.toString());
  return `/dashboard?${nextParams.toString()}`;
}

function Pagination({
  currentParams,
  pageKey,
  page,
  totalPages,
}: {
  currentParams: URLSearchParams;
  pageKey: "upcomingPage" | "pastPage";
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <Link
        href={buildDashboardPageHref(currentParams, pageKey, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-xl px-5 py-3 font-semibold ${
          page === 1
            ? "pointer-events-none bg-gray-100 text-gray-400"
            : "bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"
        }`}
      >
        Previous
      </Link>
      <span className="text-sm font-semibold text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildDashboardPageHref(currentParams, pageKey, Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-xl px-5 py-3 font-semibold ${
          page >= totalPages
            ? "pointer-events-none bg-gray-100 text-gray-400"
            : "bg-white text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50"
        }`}
      >
        Next
      </Link>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ upcomingPage?: string; pastPage?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const queryParams = new URLSearchParams();
  if (params?.upcomingPage) queryParams.set("upcomingPage", params.upcomingPage);
  if (params?.pastPage) queryParams.set("pastPage", params.pastPage);

  const upcomingPage = Math.max(Number(params?.upcomingPage || "1"), 1);
  const pastPage = Math.max(Number(params?.pastPage || "1"), 1);
  const pageSize = 6;
  const [upcomingResult, pastResult] = await Promise.all([
    getUserTripsPage(user.id, upcomingPage, pageSize, "upcoming"),
    getUserTripsPage(user.id, pastPage, pageSize, "past"),
  ]);
  const upcomingTrips = upcomingResult.trips;
  const pastTrips = pastResult.trips;
  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingResult.total / upcomingResult.pageSize));
  const pastTotalPages = Math.max(1, Math.ceil(pastResult.total / pastResult.pageSize));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
        <div className="mt-4">
          <Link
            href="/trips/new"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Create Trip
          </Link>
          <Link
            href="/profile"
            className="ml-3 inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Manage Profile
          </Link>
        </div>
      </div>

      {/* Upcoming Trips Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {upcomingTrips.length}
          </span>
          <span className="text-sm text-gray-500">of {upcomingResult.total}</span>
        </div>

        {upcomingTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-600">No upcoming trips. Create or join a carpool to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                date={trip.date}
                departureTime={trip.departureTime}
                origin={trip.origin}
                destination={trip.destination}
                state={trip.state}
                isCanceled={trip.isCanceled}
                capacity={trip.capacity}
                passengers={trip.passengers}
                driverName={trip.driverName}
                averageRating={trip.averageRating}
                isCurrentUserDriver={trip.driverId === user.id}
              />
            ))}
          </div>
        )}
        <Pagination
          currentParams={queryParams}
          pageKey="upcomingPage"
          page={upcomingResult.page}
          totalPages={upcomingTotalPages}
        />
      </section>

      {/* Past Trips Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Past Trips</h2>
          <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
            {pastTrips.length}
          </span>
          <span className="text-sm text-gray-500">of {pastResult.total}</span>
        </div>

        {pastTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-600">No past trips yet. Your completed trips will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastTrips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                date={trip.date}
                departureTime={trip.departureTime}
                origin={trip.origin}
                destination={trip.destination}
                state={trip.state}
                isCanceled={trip.isCanceled}
                capacity={trip.capacity}
                passengers={trip.passengers}
                driverName={trip.driverName}
                averageRating={trip.averageRating}
                isCurrentUserDriver={trip.driverId === user.id}
              />
            ))}
          </div>
        )}
        <Pagination
          currentParams={queryParams}
          pageKey="pastPage"
          page={pastResult.page}
          totalPages={pastTotalPages}
        />
      </section>
    </div>
  );
}
