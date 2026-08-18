import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationJournal = path.join(rootDirectory, "src", "db", "migrations", "meta", "_journal.json");

if (!existsSync(migrationJournal)) {
  console.log("No generated migrations to check.");
  process.exit(0);
}

const packageManagerEntry = process.env.npm_execpath;

if (!packageManagerEntry) {
  throw new Error("Run this command through pnpm so Drizzle Kit can be resolved.");
}

const result = spawnSync(process.execPath, [packageManagerEntry, "exec", "drizzle-kit", "check"], {
  cwd: rootDirectory,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
