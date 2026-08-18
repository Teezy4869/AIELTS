# Database migrations

Generated Drizzle SQL migrations live in this directory and are committed with
their schema changes. The normal workflow is:

```text
Drizzle schema -> pnpm db:generate -> inspect SQL -> pnpm db:migrate:test
-> integration verification -> pnpm db:migrate
```

There are intentionally no migrations before an owning module introduces an
authoritative table or Better Auth is configured with its supported adapter.
Do not use schema push as the normal workflow.
