import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getOpenTrips } from "@/lib/services/trips";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const limit = Math.max(Number(url.searchParams.get("limit") || "10"), 1);

  const result = await getOpenTrips(page, limit);
  return NextResponse.json(result);
}
