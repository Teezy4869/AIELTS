import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;

loadEnvConfig(rootDirectory);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the development database integration test.");
}

const packageManagerEntry = process.env.npm_execpath;

if (!packageManagerEntry) {
  throw new Error("Run this command through pnpm so Vitest can be resolved.");
}

const result = spawnSync(process.execPath, [packageManagerEntry, "exec", "vitest", "run", "src/db/test/development-database.integration.test.ts"], {
  cwd: rootDirectory,
  env: { ...process.env, RUN_DEVELOPMENT_DATABASE_INTEGRATION: "true" },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
