import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;

loadEnvConfig(rootDirectory);

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is required for the dedicated database integration test.");
}

const packageManagerEntry = process.env.npm_execpath;

if (!packageManagerEntry) {
  throw new Error("Run this command through pnpm so Vitest can be resolved.");
}

const result = spawnSync(process.execPath, [packageManagerEntry, "exec", "vitest", "run", "src/db/test"], {
  cwd: rootDirectory,
  env: process.env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
