import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getTripById,
  isUserPassenger,
  getDriverOverallRating,
} from "@/lib/services/trips";
import { TripActions } from "@/components/TripActions";
import { CommentForm } from "./CommentForm";

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
    weekday: "long",
    month: "long",
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

function calculateAverageRating(reviews: Array<{ rating: number }> | undefined): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ created?: string; updated?: string; commented?: string }>;
}

export default async function TripDetailPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const query = await searchParams;
  const tripId = parseInt(id, 10);

  const trip = await getTripById(tripId);

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Trip Not Found</h1>
          <p className="text-red-700 mb-6">The trip you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/dashboard" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const passengerCount = trip.passengers.length;
  const isFullCapacity = passengerCount >= trip.capacity;
  const stateLabel = trip.isCanceled ? "Canceled" : trip.state === "upcoming" ? "Upcoming" : "Past";
  const stateColor = trip.isCanceled
    ? "bg-red-100 text-red-800"
    : trip.state === "upcoming"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  const averageRating = calculateAverageRating(trip.reviews);
  const isCurrentUserPassenger = await isUserPassenger(tripId, user.id);
  const isCurrentUserDriver = trip.driverId === user.id;
  const driverOverallRating = await getDriverOverallRating(trip.driverId);
  const wasCreated = query?.created === "1";
  const wasUpdated = query?.updated === "1";
  const wasCommented = query?.commented === "1";
  const canComment = isCurrentUserDriver || isCurrentUserPassenger;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {wasCreated ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
          <p className="font-semibold">Trip created successfully.</p>
          <p className="mt-1 text-sm text-green-800">Passengers can now find and join this trip.</p>
        </div>
      ) : null}

      {wasUpdated ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
          <p className="font-semibold">Departure time updated successfully.</p>
        </div>
      ) : null}

      {wasCommented ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
          <p className="font-semibold">Comment added successfully.</p>
        </div>
      ) : null}

      {/* Back button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold">
        ← Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {trip.origin} → {trip.destination}
                </h1>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${stateColor}`}>
                  {stateLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">DATE</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(trip.date)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">TIME</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(trip.departureTime)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">SEATS</p>
                <p className={`text-lg font-semibold ${isFullCapacity ? "text-red-600" : "text-green-600"}`}>
                  {passengerCount}/{trip.capacity}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">CAPACITY</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isFullCapacity ? "Full" : "Available"}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">PRICE PER SEAT</p>
              <p className="text-2xl font-bold text-gray-900">€{trip.pricePerSeat}</p>
            </div>
          </div>

          {/* Driver info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Driver</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">
                  {trip.driverName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <Link href={`/users/${trip.driverId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                  {trip.driverName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">{trip.driverEmail}</p>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-yellow-400">★</span>
                    <span className="text-gray-700">
                      {driverOverallRating > 0 ? `${driverOverallRating}/5` : "New"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Passengers ({passengerCount}/{trip.capacity})
            </h2>

            {trip.passengers.length === 0 ? (
              <p className="text-gray-600 italic">No passengers booked yet.</p>
            ) : (
              <div className="space-y-3">
                {trip.passengers.map((passenger) => (
                  <div key={passenger.id} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {passenger.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Link href={`/users/${passenger.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {passenger.name}
                      </Link>
                      <p className="text-sm text-gray-600">{passenger.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                        {getSeatLabel(passenger.seatPosition)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Reviews & Comments */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Cards */}
          {!isFullCapacity && trip.state === "upcoming" && !trip.isCanceled && (
            <div className="rounded-2xl border border-green-300 bg-green-50 p-6">
              <p className="text-green-900 font-semibold">
                ✓ Open to join! {trip.capacity - passengerCount} seat{trip.capacity - passengerCount > 1 ? "s" : ""} available.
              </p>
            </div>
          )}

          {trip.isCanceled && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
              <p className="text-red-900 font-semibold">
                ✗ This trip has been canceled by the driver.
              </p>
            </div>
          )}

          {trip.state === "past" && (
            <div className="rounded-2xl border border-gray-300 bg-gray-50 p-6">
              <p className="text-gray-900 font-semibold">
                ℹ This trip is in the past and is no longer active.
              </p>
            </div>
          )}

          {/* Trip Actions */}
          {isCurrentUserDriver && trip.state === "upcoming" && !trip.isCanceled ? (
            <Link
              href={`/trips/${tripId}/edit`}
              className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Edit Trip
            </Link>
          ) : null}

          <TripActions
            tripId={tripId}
            driverId={trip.driverId}
            currentUserId={user.id}
            isUpcoming={trip.state === "upcoming"}
            isCurrentUserPassenger={isCurrentUserPassenger}
            isCurrentUserDriver={isCurrentUserDriver}
            isFullCapacity={isFullCapacity}
          />

          {/* Reviews Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              {averageRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{averageRating}/5</span>
                  <span className="text-sm text-gray-600">({trip.reviews?.length || 0} {trip.reviews?.length === 1 ? "review" : "reviews"})</span>
                </div>
              )}
            </div>

            {!trip.reviews || trip.reviews.length === 0 ? (
              <p className="text-gray-600 italic">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {trip.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-yellow-600">
                            {review.reviewerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <Link href={`/users/${review.reviewerId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                            {review.reviewerName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.text && <p className="text-gray-700 mt-3">{review.text}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Comments ({trip.comments?.length || 0})</h2>

            {canComment ? (
              <CommentForm tripId={tripId} />
            ) : (
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Only the driver and passengers can comment on this trip.
              </div>
            )}

            {!trip.comments || trip.comments.length === 0 ? (
              <p className="text-gray-600 italic">No comments yet.</p>
            ) : (
              <div className="space-y-6">
                {trip.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Link href={`/users/${comment.userId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                            {comment.userName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.commentDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="text-gray-700 mt-2">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
