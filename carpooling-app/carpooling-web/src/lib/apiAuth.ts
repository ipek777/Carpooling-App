import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/drizzle.schema";
import { verifyJwtToken } from "@/lib/jwt";

export async function getUserFromToken(token: string) {
  try {
    const payload = await verifyJwtToken(token);
    const userId = Number(payload.sub);
    if (!userId) {
      return null;
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user || null;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request) {
  const header = request.headers.get("authorization")?.trim();
  if (!header?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();
  if (!token) {
    return null;
  }

  return getUserFromToken(token);
}
