import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/drizzle.schema";
import { verifyJwtToken } from "@/lib/jwt";

const SESSION_COOKIE_NAME = "carpoolgo_session";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;

  return decodeURIComponent(match.slice(name.length + 1));
}

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
  const bearerToken = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const cookieToken = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  const token = bearerToken || cookieToken;

  if (!token) {
    return null;
  }

  return getUserFromToken(token);
}
