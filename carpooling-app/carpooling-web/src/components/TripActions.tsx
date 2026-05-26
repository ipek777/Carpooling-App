"use client";

import { useState, useCallback } from "react";
import { joinTrip, leaveTrip, cancelTrip, getAvailableSeats } from "@/lib/services/trips";

interface TripActionsProps {
  tripId: number;
  driverId: number;
  currentUserId: number;
  isUpcoming: boolean;
  isCurrentUserPassenger: boolean;
  isCurrentUserDriver: boolean;
  isFullCapacity: boolean;
}

type SeatPosition = "front" | "back_left" | "back_middle" | "back_right";

function getSeatLabel(position: SeatPosition): string {
  const labels: Record<SeatPosition, string> = {
    front: "Front Passenger",
    back_left: "Back Left",
    back_middle: "Back Middle",
    back_right: "Back Right",
  };
  return labels[position] || position;
}

export function TripActions({
  tripId,
  currentUserId,
  isUpcoming,
  isCurrentUserPassenger,
  isCurrentUserDriver,
  isFullCapacity,
}: TripActionsProps) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<SeatPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const loadAvailableSeats = useCallback(async () => {
    try {
      const seats = await getAvailableSeats(tripId);
      setAvailableSeats(seats);
      if (seats.length > 0) {
        setSelectedSeat(seats[0]);
      } else {
        setMessage("No seats available");
      }
    } catch (error) {
      console.error("Error loading available seats:", error);
      setMessage("Failed to load available seats. Please try again.");
    }
  }, [tripId]);

  const openJoinModal = async () => {
    setShowJoinModal(true);
    await loadAvailableSeats();
  };

  const handleJoin = async () => {
    if (!selectedSeat) {
      setMessage("Please select a seat");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await joinTrip(tripId, currentUserId, selectedSeat);
      setMessage(result.message);
      if (result.success) {
        setShowJoinModal(false);
        // Leave loading as true while we wait for the reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setLoading(false); // Only stop loading if it failed
      }
    } catch (error) {
      console.error("Error joining trip:", error);
      setMessage("An error occurred");
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await leaveTrip(tripId, currentUserId);
      setMessage(result.message);
      if (result.success) {
        setConfirmLeave(false);
        // Leave loading as true while we wait for the reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setLoading(false); // Only stop loading if it failed
      }
    } catch (error) {
      console.error("Error leaving trip:", error);
      setMessage("An error occurred");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await cancelTrip(tripId, currentUserId);
      setMessage(result.message);
      if (result.success) {
        setConfirmCancel(false);
        // Leave loading as true while we wait for the reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setLoading(false); // Only stop loading if it failed
      }
    } catch (error) {
      console.error("Error canceling trip:", error);
      setMessage("An error occurred");
      setLoading(false);
    }
  };

  if (!isUpcoming) {
    return null;
  }

  return (
    <div className="space-y-3">
      {isCurrentUserPassenger && (
        <>
          <button
            onClick={() => setConfirmLeave(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 transition"
          >
            {loading ? "Leaving..." : "Leave Trip"}
          </button>
          {confirmLeave ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">Leave this trip?</p>
              <p className="mt-1 text-sm text-red-700">Your seat will become available to other passengers.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-red-400"
                >
                  Yes, leave
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Keep trip
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {!isCurrentUserPassenger && !isCurrentUserDriver && (
        <button
            onClick={openJoinModal}
            disabled={loading || isFullCapacity}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
            isFullCapacity 
                ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                : "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
            }`}
            title={isFullCapacity ? "This trip is at full capacity" : ""}
        >
            {isFullCapacity ? "Trip Full" : loading ? "Joining..." : "Join Trip"}
        </button>
        )}

      {isCurrentUserDriver && (
        <>
          <button
            onClick={() => setConfirmCancel(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 transition"
          >
            {loading ? "Canceling..." : "Cancel Trip"}
          </button>
          {confirmCancel ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">Cancel this trip?</p>
              <p className="mt-1 text-sm text-red-700">Passengers will no longer be able to join this trip.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-red-400"
                >
                  Yes, cancel
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Keep trip
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.includes("error") || message.includes("failed") || message.includes("not") || message.includes("no longer") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          {message}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Seat</h2>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium mb-6 ${message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") || message.toLowerCase().includes("no seats") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message}
              </div>
            )}

            {availableSeats.length === 0 ? (
              <div className="text-center py-8">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setMessage("");
                  }}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {availableSeats.map((seat) => (
                    <button
                      key={seat}
                      onClick={() => setSelectedSeat(seat)}
                      className={`w-full p-4 rounded-lg border-2 font-semibold transition ${
                        selectedSeat === seat
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {getSeatLabel(seat)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setMessage("");
                      setSelectedSeat(availableSeats[0] || null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition disabled:bg-gray-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoin}
                    disabled={loading || !selectedSeat}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition"
                  >
                    {loading ? "Joining..." : "Join"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
