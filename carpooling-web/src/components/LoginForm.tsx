"use client";

import { useState, useTransition } from "react";

type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  message?: string;
  next?: string;
};

export function LoginForm({ action, error, message, next }: LoginFormProps) {
  const [formError] = useState(error || "");
  const [isPending] = useTransition();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Sign In</h1>

        {formError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
            {formError}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        <form action={action} className="space-y-6">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
