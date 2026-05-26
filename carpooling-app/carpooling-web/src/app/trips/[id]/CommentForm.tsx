"use client";

import { useState } from "react";

interface CommentFormProps {
  tripId: number;
}

export function CommentForm({ tripId }: CommentFormProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("Write a comment before posting.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Unable to add your comment.");
        setSaving(false);
        return;
      }

      window.location.href = `/trips/${tripId}?commented=1`;
    } catch {
      setError("Unable to add your comment.");
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
        Add a comment
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
          rows={4}
          className="resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          placeholder="Share a note about pickup details, timing, or anything your travel buddies should know."
        />
      </label>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{text.length}/1000</p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
