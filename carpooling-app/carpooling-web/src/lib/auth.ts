"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/db/drizzle.schema";

const COOKIE_NAME = "carpoolgo_session";
const JWT_EXPIRATION = "30d";
const JWT_ALGO = "HS256";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in .env");
}

const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

function createToken(userId: number) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: JWT_ALGO })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey);
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as { sub?: string };
}

export async function getCurrentUser() {
  const requestCookies = await cookies();
  const token = requestCookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const userId = Number(payload.sub);
    if (!userId) return null;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user || null;
  } catch {
    return null;
  }
}

async function setSessionCookie(token: string) {
  const requestCookies = await cookies();
  requestCookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function clearSessionCookie() {
  const requestCookies = await cookies();
  requestCookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!name || !email || !password || !confirmPassword) {
    redirect("/register?error=Please fill in all fields");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=Passwords do not match");
  }

  if (password.length < 6) {
    redirect("/register?error=Password must have at least 6 characters");
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    redirect("/register?error=Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [newUser] = await db
    .insert(users)
    .values({ email, passwordHash, name, photoUrl: null })
    .returning();

  const next = formData.get("next")?.toString();
  const destination = next?.startsWith("/") ? next : "/dashboard";
  const token = await createToken(newUser.id);
  await setSessionCookie(token);
  redirect(destination);
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    redirect("/login?error=Please provide both email and password");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    redirect("/login?error=Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    redirect("/login?error=Invalid credentials");
  }

  const next = formData.get("next")?.toString();
  const destination = next?.startsWith("/") ? next : "/dashboard";
  const token = await createToken(user.id);
  await setSessionCookie(token);
  redirect(destination);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
