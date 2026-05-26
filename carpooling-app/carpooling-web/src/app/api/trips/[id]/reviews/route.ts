import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { addTripReview } from "@/lib/services/trips";

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
  const rating = Number(data.rating);
  const text = typeof data.text === "string" ? data.text : null;

  const result = await addTripReview(tripId, user.id, rating, text);
  if (!result.success) {
    const status =
      result.message.includes("Only passengers") ||
      result.message.includes("past trips")
        ? 403
        : result.message.includes("already reviewed")
          ? 409
        : 400;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json(
    { id: result.reviewId, message: result.message },
    { status: 201 }
  );
}
