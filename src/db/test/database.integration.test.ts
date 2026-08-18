// @vitest-environment node

import { describe, expect, it } from "vitest";

import { assertTestDatabaseIsDistinctFromDevelopment, createTestDatabaseClient, hasTestDatabaseUrl } from "@/db/test/test-database";

const describeWithDatabase = hasTestDatabaseUrl ? describe : describe.skip;

describeWithDatabase("PostgreSQL integration environment", () => {
  it("uses a test target distinct from development", () => {
    expect(() => assertTestDatabaseIsDistinctFromDevelopment()).not.toThrow();
  });

  it("connects to the dedicated test database", async () => {
    const client = createTestDatabaseClient();

    try {
      const result = await client<{ value: number }[]>`select 1 as value`;

      expect(result).toEqual([{ value: 1 }]);
    } finally {
      await client.end();
    }
  });
});
