---
name: review-code
description: Use when reviewing an AIELTS change, pull request, diff, or implementation for correctness, scope, architecture, security, data integrity, privacy, and tests.
---

# Review Code

## Purpose
Review a change against AIELTS source-of-truth documents and repository invariants. Prioritize concrete defects and risks over stylistic preference.

## Required Reading
Always read:
- AGENTS.md
- docs/rules/workflow.md
- docs/rules/coding-standards.md
- docs/rules/testing.md

Then read the governing product, architecture, security, UI, AI, database, and project-memory files touched by the diff.

## Priority Order
```text
1. Functional correctness
2. Authorization / privacy / security
3. Data integrity / transactions / idempotency
4. Product / architecture compliance
5. Failure handling / edge cases
6. Test adequacy
7. Maintainability / duplication
8. Style when materially useful
```

## Workflow

### 1. Understand intent
Determine requested behavior, owning module/domain, expected affected layers, explicit non-goals, and authoritative docs.

### 2. Inspect the full change
Read changed files plus relevant callers/callees, nearby established patterns, tests, schema/migrations, and project-memory context.

### 3. Check product scope
Flag silent introduction of removed/deferred behavior such as:
- individualized group assignments
- adaptive content selection
- realtime/free-form social features
- mandatory AI for Writing
- AI outside Writing Evaluation
- public detailed academic results

### 4. Check architecture boundaries
Expected direction: UI/transport → application service → domain logic → repository/infrastructure.

### 5. Check auth and authorization
Protected operations should follow:
```text
resolve session → load resource → check ownership/membership → check role → execute
```

### 6. Check privacy
Group-facing data must not expose another member's detailed scores, Writing text/band, AI criteria, or private progress history.

### 7. Check validation
Look for missing runtime validation, blind casts, invalid enum/range/date handling, or unvalidated AI output.

### 8. Report findings
Order findings by severity. Each finding should state:
1. What is wrong.
2. Where it occurs.
3. Why it matters.
4. Smallest reasonable correction.

## Checklist
```text
[ ] Requested scope is preserved.
[ ] Correct domain/layer owns behavior.
[ ] Server-side authorization is complete.
[ ] Private academic data is protected.
[ ] Untrusted input is validated.
[ ] DB constraints/transactions are sound.
[ ] Tests cover important positive + negative/failure paths.
[ ] No unjustified dependency was added.
```

## Do Not
- Approve based only on compilation or happy paths.
- Treat formatting preferences as high-severity defects.
- Assume hidden UI protects server data.
