import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTrip } from "@/lib/services/trips";

interface NewTripPageProps {
  searchParams?: Promise<{ error?: string }>;
}

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
}

function getErrorMessage(error?: string): string | null {
  const messages: Record<string, string> = {
    missing: "Please fill in all fields.",
    capacity: "Capacity must be between 1 and 4 seats.",
    price: "Price per seat must be greater than 0.",
    datetime: "Departure date and time must be in the future.",
  };

  return error ? messages[error] ?? "Unable to create the trip." : null;
}

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/trips/new");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  async function createTripAction(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect("/login?next=/trips/new");
    }

    const origin = formData.get("origin")?.toString().trim() || "";
    const destination = formData.get("destination")?.toString().trim() || "";
    const date = formData.get("date")?.toString().trim() || "";
    const departureTime = normalizeTime(formData.get("departureTime")?.toString().trim() || "");
    const capacity = Number(formData.get("capacity"));
    const price = Number(formData.get("pricePerSeat"));

    if (!origin || !destination || !date || !departureTime || !capacity || !price) {
      redirect("/trips/new?error=missing");
    }

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4) {
      redirect("/trips/new?error=capacity");
    }

    if (!Number.isFinite(price) || price <= 0) {
      redirect("/trips/new?error=price");
    }

    const departureDateTime = new Date(`${date}T${departureTime}`);
    if (Number.isNaN(departureDateTime.getTime()) || departureDateTime <= new Date()) {
      redirect("/trips/new?error=datetime");
    }

    const tripId = await createTrip(currentUser.id, {
      origin,
      destination,
      date,
      departureTime,
      capacity,
      pricePerSeat: price.toFixed(2),
    });

    redirect(`/trips/${tripId}?created=1`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="mb-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
          Back to dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Create Trip</h1>
        <p className="mt-2 text-gray-600">Publish an upcoming carpool for passengers to join.</p>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <form action={createTripAction} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Origin
            <input
              name="origin"
              type="text"
              required
              maxLength={200}
              placeholder="Sofia"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Destination
            <input
              name="destination"
              type="text"
              required
              maxLength={200}
              placeholder="Plovdiv"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Date
            <input
              name="date"
              type="date"
              required
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Departure time
            <input
              name="departureTime"
              type="time"
              required
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Capacity
            <input
              name="capacity"
              type="number"
              required
              min="1"
              max="4"
              step="1"
              placeholder="4"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Price per seat
            <input
              name="pricePerSeat"
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="12.50"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Create Trip
          </button>
        </div>
      </form>
    </div>
  );
}
