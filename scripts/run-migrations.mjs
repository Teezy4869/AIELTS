import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { z } from "zod";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;

loadEnvConfig(rootDirectory);

const environmentVariable = process.argv[2];

if (environmentVariable !== "DATABASE_URL" && environmentVariable !== "TEST_DATABASE_URL") {
  throw new Error("Provide DATABASE_URL or TEST_DATABASE_URL as the migration target.");
}

if (environmentVariable === "TEST_DATABASE_URL" && process.env.NODE_ENV === "production") {
  throw new Error("Test migrations must not run with NODE_ENV=production.");
}

const databaseUrl = z
  .string()
  .url()
  .refine((value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol), "Expected a PostgreSQL connection URL.")
  .parse(process.env[environmentVariable]);

if (environmentVariable === "TEST_DATABASE_URL") {
  const developmentUrl = z.string().url().parse(process.env.DATABASE_URL);

  if (getComparableTarget(developmentUrl) === getComparableTarget(databaseUrl)) {
    throw new Error("TEST_DATABASE_URL must target a database distinct from DATABASE_URL.");
  }
}

const migrationsFolder = path.join(rootDirectory, "src", "db", "migrations");
const migrationJournal = path.join(migrationsFolder, "meta", "_journal.json");

if (!existsSync(migrationJournal)) {
  console.log("No generated migrations to apply.");
  process.exit(0);
}

const client = postgres(databaseUrl, { max: 1 });

try {
  await migrate(drizzle(client), { migrationsFolder });
  console.log("Migrations applied successfully.");
} finally {
  await client.end();
}

function getComparableTarget(value) {
  const url = new URL(value);

  return `${url.protocol}//${url.username}@${url.hostname}:${url.port}${url.pathname}`;
}
