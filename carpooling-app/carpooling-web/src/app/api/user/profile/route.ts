import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { getPublicUserProfile, updateUserProfile } from "@/lib/services/users";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getPublicUserProfile(user.id);
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
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
  const name = typeof data.name === "string" ? data.name : "";
  const photoUrl = typeof data.photoUrl === "string" ? data.photoUrl : null;

  const result = await updateUserProfile(user.id, { name, photoUrl });
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
