---
name: database-migration
description: Use when changing the AIELTS PostgreSQL schema, constraints, indexes, auth-linked persistence, or version-controlled Drizzle migrations.
---

# Database Migration

## Purpose
Evolve PostgreSQL safely through Drizzle schema changes and version-controlled SQL migrations while preserving integrity, compatibility, and database ownership boundaries.

## Required Reading
- `AGENTS.md`
- `docs/architecture/database-design.md`
- `docs/rules/workflow.md`
- `docs/rules/coding-standards.md`
- `docs/rules/testing.md`
- `docs/rules/security.md` when identity/private/sensitive data is affected.
- `docs/architecture/system-design.md` when persistence ownership/runtime changes.

## Baseline
```text
PostgreSQL
→ Supabase PostgreSQL
→ Drizzle schema
→ Drizzle Kit
→ version-controlled SQL migrations
→ real PostgreSQL integration tests
```

Production uses committed migrations; direct schema push is not the normal path.

## Workflow

### 1. Define the data change
Identify:
- owning entity/domain;
- intended field/table/index/constraint/relationship;
- affected read/write paths;
- existing data compatibility;
- privacy/authorization effects;
- transaction/idempotency effects.

Do not encode a new product rule only in the database unless that rule is already authoritative or explicitly changed.

### 2. Inspect current persistence
Review related Drizzle schema, migrations, queries/repositories, indexes/constraints, and tests.
Avoid duplicate fields, indexes, or competing representations of the same authority.

### 3. Preserve data-design rules
Keep authoritative/frequently filtered values relational.
Approved variable structures may use `jsonb`:
```text
content_json
answer_key_json
answer_data
payload_json
feedback_json
```

Do not hide IDs, statuses, skill/task type, sequence, deadlines, XP, quarter keys, AI state, or model versions in JSON.
Large binaries remain outside PostgreSQL.

### 4. Respect auth ownership
Better Auth owns credential/session persistence through its adapter.
Do not create parallel password/session tables or duplicate auth credential representation in product tables.
AIELTS domain tables depend on the stable auth user ID.

### 5. Choose a safe migration shape
Prefer staged additive evolution when compatibility matters:
```text
add nullable
→ deploy compatible code
→ backfill
→ tighten constraint
→ remove obsolete field later
```

For destructive/hard-to-reverse decisions, evaluate an ADR and staged rollout.

### 6. Update Drizzle schema minimally
Preserve intentional:
```text
foreign keys
unique constraints
check constraints
nullability
history/lifecycle semantics
```

Do not add partitioning, sharding, replicas, or other speculative infrastructure.

### 7. Generate and inspect SQL
Normal flow:
```text
change schema
→ generate migration
→ inspect SQL
→ test migration
→ apply migration
```

Inspect for:
- unintended drops;
- unsafe type conversion;
- wrong defaults/nullability;
- missing/duplicate indexes;
- incorrect FK behavior;
- data-loss risks;
- statements incompatible with existing rows.

Generated SQL is not automatically correct.

### 8. Handle backfills explicitly
If rows need transformation, define deterministic behavior and compatible intermediate states where practical.
Do not silently rewrite historical submissions, XP, or AI results.

### 9. Preserve consistency/idempotency
Do not weaken persistence supporting high-risk workflows such as:
```text
assignment + member states + cursor advancement
submission + member state + XP + activity/notification
scheduler retry
XP/badge uniqueness
AI evaluation history/versioning
```

### 10. Test on real PostgreSQL
For meaningful changes:
- Apply migration to test PostgreSQL.
- Verify representative existing data remains valid/readable.
- Verify new constraints and transaction behavior.
- Run affected repository/service integration tests.

Do not use SQLite to prove PostgreSQL-specific constraints, transactions, or `jsonb` behavior.

### 11. Check application compatibility
Review affected repositories, Zod contracts, services, fixtures/import data, Better Auth adapter assumptions, and AI/admin persistence paths.
Run focused tests, then broader checks as applicable.

### 12. Update docs only if the logical design changed
Update `database-design.md` when persistent ownership, entities, relationships, constraints, transaction architecture, JSON boundaries, or lifecycle rules changed.
Do not put generated SQL or command trivia in architecture docs.

## Done
```text
[ ] Change matches authoritative behavior/architecture.
[ ] Existing schema/migrations/queries were inspected.
[ ] Drizzle schema changed minimally.
[ ] Migration SQL is version-controlled and inspected.
[ ] Existing-data compatibility was considered.
[ ] FKs/constraints/nullability are intentional.
[ ] Real PostgreSQL verification covers relevant semantics.
[ ] Transaction/idempotency invariants remain protected.
[ ] No production schema push is required.
[ ] Docs/ADR changed only when warranted.
```

## Do Not
- Use direct production schema push as normal workflow.
- Use SQLite as proof of PostgreSQL behavior.
- Store large media or expiring signed URLs as durable DB identity.
- Duplicate Better Auth credential/session persistence.
- Destroy historical learning/XP/AI data casually.
- Add speculative database infrastructure.
