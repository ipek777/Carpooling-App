import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/drizzle.schema";
import { eq } from "drizzle-orm";
import { createJwtToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createJwtToken(user.id);
  return NextResponse.json({ token });
}
