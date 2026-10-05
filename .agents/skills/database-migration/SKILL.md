---
name: database-migration
description: Use when changing the AIELTS PostgreSQL schema, constraints, indexes, auth-linked persistence, or version-controlled Drizzle migrations.
---

# Database Migration

## Purpose
Evolve PostgreSQL safely through Drizzle schema changes and version-controlled SQL migrations while preserving integrity, compatibility, and database ownership boundaries.

## Required Reading
- AGENTS.md
- docs/architecture/database-design.md
- docs/rules/workflow.md
- docs/rules/coding-standards.md
- docs/rules/testing.md
- docs/rules/security.md when identity/private/sensitive data is affected.
- docs/architecture/system-design.md when persistence ownership/runtime changes.

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

### 2. Inspect current persistence
Review related Drizzle schema, migrations, queries/repositories, indexes/constraints, and tests.
Avoid duplicate fields, indexes, or competing representations of the same authority.

### 3. Preserve data-design rules
Keep authoritative/frequently filtered values relational.
Approved variable structures may use jsonb: content_json, answer_key_json, answer_data, payload_json, feedback_json.

Do not hide IDs, statuses, skill/task type, sequence, deadlines, XP, quarter keys, AI state, or model versions in JSON.

### 4. Choose a safe migration shape
Prefer staged additive evolution when compatibility matters:
```text
add nullable → deploy compatible code → backfill → tighten constraint → remove obsolete field
```

### 5. Generate and inspect SQL
```text
change schema → generate migration → inspect SQL → test migration → apply migration
```

Inspect for:
- unintended drops;
- unsafe type conversion;
- wrong defaults/nullability;
- missing/duplicate indexes;
- incorrect FK behavior;
- data-loss risks.

### 6. Test on real PostgreSQL
- Apply migration to test PostgreSQL.
- Verify representative existing data remains valid/readable.
- Verify new constraints and transaction behavior.
- Run affected repository/service integration tests.

Do not use SQLite to prove PostgreSQL-specific constraints, transactions, or jsonb behavior.

## Done
```text
[ ] Change matches authoritative behavior/architecture.
[ ] Existing schema/migrations/queries were inspected.
[ ] Drizzle schema changed minimally.
[ ] Migration SQL is version-controlled and inspected.
[ ] Existing-data compatibility was considered.
[ ] Real PostgreSQL verification covers relevant semantics.
[ ] No production schema push is required.
```

## Do Not
- Use direct production schema push as normal workflow.
- Use SQLite as proof of PostgreSQL behavior.
- Store large media or expiring signed URLs as durable DB identity.
- Destroy historical learning/XP/AI data casually.
