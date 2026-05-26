"use client";

import { useState } from "react";

type LogoutButtonProps = {
  action: () => Promise<void>;
  size?: "default" | "small";
};

export function LogoutButton({ action, size = "default" }: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sizeClass =
    size === "small"
      ? "rounded px-3 py-1 text-sm"
      : "rounded-lg px-4 py-2";

  return (
    <form action={action} className="inline" onSubmit={() => setIsSubmitting(true)}>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className={`inline-flex items-center justify-center gap-2 bg-white font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-blue-100 ${sizeClass}`}
      >
        {isSubmitting ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"
          />
        ) : null}
        <span>{isSubmitting ? "Logging out..." : "Logout"}</span>
      </button>
    </form>
  );
}
