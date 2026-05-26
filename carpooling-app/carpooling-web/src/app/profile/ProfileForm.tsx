"use client";

import { useState } from "react";

interface ProfileFormProps {
  initialName: string;
  initialPhotoUrl: string;
}

export function ProfileForm({ initialName, initialPhotoUrl }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, photoUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Unable to update your profile.");
        setSaving(false);
        return;
      }

      setMessage("Profile updated successfully.");
      setSaving(false);
    } catch {
      setError("Unable to update your profile.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {message ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
            required
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Profile photo URL
          <input
            type="url"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
