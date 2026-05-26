import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getTripById, getAvailableSeats } from "@/lib/services/trips";

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
