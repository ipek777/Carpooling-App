import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getAvailableSeats, joinTrip } from "@/lib/services/trips";

const seatNames = ["front", "back_left", "back_middle", "back_right"] as const;

type SeatName = (typeof seatNames)[number];

function isSeatName(value: unknown): value is SeatName {
  return typeof value === "string" && seatNames.includes(value as SeatName);
}

export async function POST(
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

  const body = await request.json().catch(() => ({}));
  let seatPosition = body?.seatPosition;

  if (seatPosition !== undefined && !isSeatName(seatPosition)) {
    return NextResponse.json({ error: "Invalid seat position." }, { status: 400 });
  }

  if (!seatPosition) {
    const availableSeats = await getAvailableSeats(tripId);
    if (availableSeats.length === 0) {
      return NextResponse.json({ error: "No seats available." }, { status: 400 });
    }
    seatPosition = availableSeats[0];
  }

  const result = await joinTrip(tripId, user.id, seatPosition);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: result.message, seatPosition });
}
