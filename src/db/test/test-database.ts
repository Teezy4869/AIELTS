import postgres from "postgres";
import { z } from "zod";

const testDatabaseUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;

    return protocol === "postgres:" || protocol === "postgresql:";
  }, "Expected TEST_DATABASE_URL to be a PostgreSQL connection URL.");

export const hasTestDatabaseUrl = Boolean(process.env.TEST_DATABASE_URL);

export function assertTestDatabaseIsDistinctFromDevelopment() {
  const developmentUrl = testDatabaseUrlSchema.parse(process.env.DATABASE_URL);
  const testUrl = testDatabaseUrlSchema.parse(process.env.TEST_DATABASE_URL);

  if (getComparableTarget(developmentUrl) === getComparableTarget(testUrl)) {
    throw new Error("TEST_DATABASE_URL must target a database distinct from DATABASE_URL.");
  }
}

export function createTestDatabaseClient() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Database integration tests must not run with NODE_ENV=production.");
  }

  const databaseUrl = testDatabaseUrlSchema.parse(process.env.TEST_DATABASE_URL);

  return postgres(databaseUrl, { max: 1 });
}

function getComparableTarget(value: string) {
  const url = new URL(value);

  return `${url.protocol}//${url.username}@${url.hostname}:${url.port}${url.pathname}`;
}
