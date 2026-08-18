// @vitest-environment node

import { describe, expect, it } from "vitest";

const runDevelopmentDatabaseIntegration = process.env.RUN_DEVELOPMENT_DATABASE_INTEGRATION === "true";
const describeWithDevelopmentDatabase = runDevelopmentDatabaseIntegration ? describe : describe.skip;

describeWithDevelopmentDatabase("development PostgreSQL integration", () => {
  it("validates the configured URL and executes a read-only Drizzle query", async () => {
    const { getDatabaseUrl } = await import("@/config/env");

    expect(() => getDatabaseUrl()).not.toThrow();

    const [{ db }, { sql }] = await Promise.all([import("@/db/client"), import("drizzle-orm")]);

    await expect(db.execute(sql`select 1`)).resolves.toBeDefined();
  });
});
