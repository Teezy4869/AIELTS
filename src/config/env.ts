import { z } from "zod";

import "server-only";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const databaseUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;

    return protocol === "postgres:" || protocol === "postgresql:";
  }, "Expected a PostgreSQL connection URL.");

export const env = environmentSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
});

export function getDatabaseUrl() {
  return databaseUrlSchema.parse(process.env.DATABASE_URL);
}
