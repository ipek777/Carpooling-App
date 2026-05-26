import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getTripById, getAvailableSeats, updateTripDepartureTime } from "@/lib/services/trips";

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const tripId = Number(id);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return NextResponse.json({ error: "Invalid trip id." }, { status: 400 });
  }

  const trip = await getTripById(tripId);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const isDriver = trip.driverId === user.id;
  const isPassenger = trip.passengers.some((passenger) => passenger.id === user.id);
  const availableSeats = trip.availableSeats ?? (await getAvailableSeats(tripId));

  return NextResponse.json({
    ...trip,
    isDriver,
    isPassenger,
    availableSeats,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const tripId = Number(id);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return NextResponse.json({ error: "Invalid trip id." }, { status: 400 });
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
  const departureTime =
    typeof data.departureTime === "string" ? normalizeTime(data.departureTime.trim()) : "";

  if (!departureTime) {
    return NextResponse.json({ error: "departureTime is required." }, { status: 400 });
  }

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(departureTime)) {
    return NextResponse.json({ error: "departureTime must use HH:mm format." }, { status: 400 });
  }

  const result = await updateTripDepartureTime(tripId, user.id, departureTime);
  if (!result.success) {
    const status = result.message.includes("Only the driver") ? 403 : 400;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json({ success: true });
}
