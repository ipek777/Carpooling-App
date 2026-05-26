import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getUserTripsPage, type UserTripPageState } from "@/lib/services/trips";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "10"), 1), 50);
  const stateParam = url.searchParams.get("state");
  const state: UserTripPageState = stateParam === "past" ? "past" : "upcoming";

  const result = await getUserTripsPage(user.id, page, limit, state);

  return NextResponse.json({
    trips: result.trips,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}
