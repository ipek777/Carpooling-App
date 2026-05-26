import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createTrip, getOpenTrips } from "@/lib/services/trips";

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const limit = Math.max(Number(url.searchParams.get("limit") || "10"), 1);
  const origin = url.searchParams.get("origin")?.trim() || undefined;
  const destination = url.searchParams.get("destination")?.trim() || undefined;
  const date = url.searchParams.get("date")?.trim() || undefined;
  const availableOnly =
    url.searchParams.get("available") === "1" ||
    url.searchParams.get("availableOnly") === "1";

  const result = await getOpenTrips(page, limit, {
    origin,
    destination,
    date,
    availableOnly,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body is required." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const origin = typeof data.origin === "string" ? data.origin.trim() : "";
  const destination = typeof data.destination === "string" ? data.destination.trim() : "";
  const date = typeof data.date === "string" ? data.date.trim() : "";
  const departureTime =
    typeof data.departureTime === "string" ? normalizeTime(data.departureTime.trim()) : "";
  const capacity = Number(data.capacity);
  const price = Number(data.pricePerSeat);

  if (!origin || !destination || !date || !departureTime) {
    return NextResponse.json({ error: "Origin, destination, date, and departureTime are required." }, { status: 400 });
  }

  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4) {
    return NextResponse.json({ error: "Capacity must be an integer between 1 and 4." }, { status: 400 });
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "pricePerSeat must be greater than 0." }, { status: 400 });
  }

  const departureDateTime = new Date(`${date}T${departureTime}`);
  if (Number.isNaN(departureDateTime.getTime()) || departureDateTime <= new Date()) {
    return NextResponse.json({ error: "Departure date and time must be in the future." }, { status: 400 });
  }

  const tripId = await createTrip(user.id, {
    origin,
    destination,
    date,
    departureTime,
    capacity,
    pricePerSeat: price.toFixed(2),
  });

  return NextResponse.json({ id: tripId }, { status: 201 });
}
