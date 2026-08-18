# Database Memory

Database decisions, schema notes, and migration history.

The repository has a server-only Drizzle/PostgreSQL foundation using `postgres`
and Drizzle Kit. Product schema remains intentionally empty; the migration
journal has no entries and no SQL migration has been created.

`DATABASE_URL` is reserved for development/application migrations and
`TEST_DATABASE_URL` is required for PostgreSQL integration tests and test
migrations. The test harness skips when the dedicated test URL is absent and
refuses `NODE_ENV=production`.

The configured development `DATABASE_URL` has been validated by the server
configuration and verified through a read-only Drizzle `select 1` integration
test. The empty Drizzle migration journal was also applied successfully; it
contains no product SQL migrations.

The dedicated `TEST_DATABASE_URL` has been verified through the local
environment-loading path. The test harness confirms its canonical connection
target differs from development before connecting, then executes a real
PostgreSQL read-only query. The empty migration journal was successfully
applied through the test migration command.

The current schema remains intentionally empty until Authentication begins;
there are no product SQL migrations or product-domain tables.
