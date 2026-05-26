import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getUserTrips } from "@/lib/services/trips";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const limit = Math.max(Number(url.searchParams.get("limit") || "10"), 1);

  const { upcomingTrips } = await getUserTrips(user.id);
  const total = upcomingTrips.length;
  const start = (page - 1) * limit;
  const pagedTrips = upcomingTrips.slice(start, start + limit);

  return NextResponse.json({
    trips: pagedTrips,
    total,
    page,
    pageSize: limit,
  });
}
