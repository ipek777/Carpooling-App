import { SignJWT, jwtVerify } from "jose";

const JWT_ALGO = "HS256";
const JWT_EXPIRATION = "30d";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in .env");
}

const encoder = new TextEncoder();
const jwtSecret = encoder.encode(JWT_SECRET);

export async function createJwtToken(userId: number) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: JWT_ALGO })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(jwtSecret);
}

export async function verifyJwtToken(token: string) {
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload as { sub?: string };
}
