import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserTrips } from "@/lib/services/trips";
import { TripCard } from "@/components/TripCard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { upcomingTrips, pastTrips } = await getUserTrips(user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      {/* Upcoming Trips Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {upcomingTrips.length}
          </span>
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
      </section>

      {/* Past Trips Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Past Trips</h2>
          <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
            {pastTrips.length}
          </span>
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
      </section>
    </div>
  );
}
