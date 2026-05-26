import Link from "next/link";

interface Passenger {
  id: number;
  name: string;
  email: string;
  seatPosition: "front" | "back_left" | "back_middle" | "back_right";
}

interface TripCardProps {
  id: number;
  date: string;
  departureTime: string;
  origin: string;
  destination: string;
  state: "upcoming" | "past";
  isCanceled: boolean;
  capacity: number;
  passengers: Passenger[];
  driverName: string;
  averageRating: number;
  isCurrentUserDriver?: boolean;
}

function getSeatLabel(position: string): string {
  const labels: Record<string, string> = {
    front: "Front",
    back_left: "Back Left",
    back_middle: "Back Middle",
    back_right: "Back Right",
  };
  return labels[position] || position;
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

export function TripCard({
  id,
  date,
  departureTime,
  origin,
  destination,
  state,
  isCanceled,
  capacity,
  passengers,
  driverName,
  averageRating,
  isCurrentUserDriver,
}: TripCardProps) {
  const passengerCount = passengers.length;
  const isFullCapacity = passengerCount >= capacity;
  const capacityStatus = isFullCapacity ? "Full capacity" : `${passengerCount}/${capacity} seats`;

  const stateLabel = isCanceled ? "Canceled" : state === "upcoming" ? "Upcoming" : "Past";
  const stateColor = isCanceled
    ? "bg-red-100 text-red-800"
    : state === "upcoming"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  return (
    <Link href={`/trips/${id}`}>
      <div className="block rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {origin} → {destination}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${stateColor}`}>
                {stateLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span>Driver: {driverName}</span>
              <span className="inline-flex items-center gap-1">
                {averageRating > 0 ? (
                  <>
                    <span className="text-yellow-500">★</span>
                    <span>{averageRating}/5</span>
                  </>
                ) : (
                  <span>No rating</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold text-gray-900">{formatDate(date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="font-semibold text-gray-900">{formatTime(departureTime)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Seats</p>
            <p className={`font-semibold ${isFullCapacity ? "text-red-600" : "text-green-600"}`}>
              {capacityStatus}
            </p>
          </div>
        </div>

        {/* Passengers list */}
        {passengers.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Passengers:</p>
            <div className="space-y-1">
              {passengers.map((passenger) => (
                <p key={passenger.id} className="text-sm text-gray-600">
                  • {passenger.name} ({getSeatLabel(passenger.seatPosition)})
                </p>
              ))}
            </div>
          </div>
        )}

        {passengerCount === 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 italic">No passengers yet</p>
          </div>
        )}
      </div>
    </Link>
  );
}
