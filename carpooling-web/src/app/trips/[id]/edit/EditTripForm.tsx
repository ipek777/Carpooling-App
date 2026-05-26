"use client";

import Link from "next/link";
import { useState } from "react";

interface EditTripFormProps {
  tripId: number;
  currentDepartureTime: string;
  currentDepartureTimeLabel: string;
}

export function EditTripForm({
  tripId,
  currentDepartureTime,
  currentDepartureTimeLabel,
}: EditTripFormProps) {
  const [departureTime, setDepartureTime] = useState(currentDepartureTime.slice(0, 5));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!departureTime) {
      setError("Please choose a departure time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departureTime }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Unable to update the departure time.");
        setSaving(false);
        return;
      }

      window.location.href = `/trips/${tripId}?updated=1`;
    } catch {
      setError("Unable to update the departure time.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mb-6 rounded-xl bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-600">Current departure time</p>
        <p className="mt-1 text-lg font-bold text-gray-900">{currentDepartureTimeLabel}</p>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        New departure time
        <input
          name="departureTime"
          type="time"
          required
          value={departureTime}
          onChange={(event) => setDepartureTime(event.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? "Saving..." : "Save Time"}
        </button>
      </div>
    </form>
  );
}
