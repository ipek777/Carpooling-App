import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config();

export default {
  schema: "./src/db/drizzle.schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
};
