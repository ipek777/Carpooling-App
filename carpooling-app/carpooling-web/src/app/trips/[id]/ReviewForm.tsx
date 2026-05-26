"use client";

import { useState } from "react";

interface ReviewFormProps {
  tripId: number;
}

export function ReviewForm({ tripId }: ReviewFormProps) {
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: Number(rating), text }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Unable to add your review.");
        setSaving(false);
        if (response.status === 409) {
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
        return;
      }

      window.location.href = `/trips/${tripId}?reviewed=1`;
    } catch {
      setError("Unable to add your review.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 border-b border-gray-200 pb-6">
      {error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Bad</option>
        </select>
      </label>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-gray-700">
        Review
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
          rows={4}
          className="resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          placeholder="Share how the ride went."
        />
      </label>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{text.length}/1000</p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? "Posting..." : "Post Review"}
        </button>
      </div>
    </form>
  );
}
