import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/drizzle.schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set in .env");
}

export const db = drizzle(databaseUrl, { schema });
