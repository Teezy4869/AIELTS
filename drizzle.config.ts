import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { z } from "zod";

loadEnvConfig(process.cwd());

const databaseUrlSchema = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;

  return protocol === "postgres:" || protocol === "postgresql:";
}, "Expected DATABASE_URL to be a PostgreSQL connection URL.");

const databaseUrl = process.env.DATABASE_URL ? databaseUrlSchema.parse(process.env.DATABASE_URL) : undefined;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  ...(databaseUrl ? { dbCredentials: { url: databaseUrl } } : {}),
});
