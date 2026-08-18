import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/config/env";

const queryClient = postgres(getDatabaseUrl(), {
  max: 1,
});

export const db = drizzle(queryClient);
