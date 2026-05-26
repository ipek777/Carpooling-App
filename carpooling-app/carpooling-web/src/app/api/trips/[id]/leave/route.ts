import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { leaveTrip } from "@/lib/services/trips";

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

  const result = await leaveTrip(tripId, user.id);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: result.message });
}
