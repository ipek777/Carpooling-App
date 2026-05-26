import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getTripById } from "@/lib/services/trips";

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

  return NextResponse.json(trip);
}
