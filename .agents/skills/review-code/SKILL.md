---
name: review-code
description: Use when reviewing an AIELTS change, pull request, diff, or implementation for correctness, scope, architecture, security, data integrity, privacy, and tests.
---

# Review Code

## Purpose
Review a change against AIELTS source-of-truth documents and repository invariants. Prioritize concrete defects and risks over stylistic preference.

## Required Reading
Always read:
- `AGENTS.md`
- `docs/rules/workflow.md`
- `docs/rules/coding-standards.md`
- `docs/rules/testing.md`

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
Do not invent requirements absent from the task/source of truth.

### 2. Inspect the full change
Read changed files plus relevant callers/callees, nearby established patterns, tests, schema/migrations, and project-memory context.
Look for unrelated scope changes.

### 3. Check product scope
Flag silent introduction of removed/deferred behavior such as:
```text
individualized group assignments
adaptive content selection
realtime/free-form social features
mandatory AI for Writing
AI outside Writing Evaluation
public detailed academic results
```

### 4. Check architecture boundaries
Expected direction:
```text
UI / transport
→ application service
→ domain logic
→ repository / infrastructure
```

Flag reusable business rules trapped in React, Server Actions, or Route Handlers; browser-direct application table access; and unnecessary provider coupling inside domain logic.

### 5. Check auth and authorization
Protected operations should follow:
```text
resolve session
→ load resource
→ check ownership/membership
→ check role when required
→ execute
```

Flag trust in client user IDs, roles, ownership, XP, score, deadlines, eligibility, or AI ownership.
Frontend hiding is not authorization.

### 6. Check privacy
Group-facing server/API/UI data must not expose another member's:
```text
detailed Reading/Listening scores
Writing text/band/AI criteria
detailed study time
private progress/submission history
```

### 7. Check validation and safe errors
Look for missing runtime validation, blind casts, invalid enum/range/date handling, unsafe uploads/imported content, or unvalidated AI output.
Ensure errors/logs do not leak SQL, stack traces, tokens, secrets, credentials, or full private essays by default.

### 8. Check persistence
Verify intentional FK/unique/check constraints, nullability, JSON boundaries, media storage boundaries, auth persistence ownership, and historical-data preservation.

### 9. Check transactions/idempotency
Focus on:
```text
assignment + member states + cursor
submission + member state + XP + activity/notification
scheduler retries
XP/badge rewards
AI evaluation retries
```

Flag partial-state risks and in-memory duplicate guards where durable protection is required.

### 10. Check time authority
Deadline, late state, streak, quarter, and scheduler business-date decisions must be server-authoritative and timezone-aware.
Flag browser clock or developer-machine timezone as protected truth.

### 11. Check tests
Expect as applicable:
```text
positive path
forbidden authorization path
consistency failure path
retry/idempotency
real PostgreSQL semantics
privacy payload protection
regression coverage for important bug fixes
```

Prefer the lowest test layer that proves the behavior correctly.

### 12. Check unnecessary complexity
Flag unjustified duplicate stacks or premature:
```text
Redis / queues / event buses
microservices / CQRS
service locators / generic repository frameworks
global state libraries
second UI/auth/validation stack
```

### 13. Report findings
Order findings by severity.
Each finding should state:
1. What is wrong.
2. Where it occurs.
3. Why it matters or which invariant it violates.
4. Smallest reasonable correction.

Do not bury correctness/security defects under style comments.
If no material defects are found, say so and note residual uncertainty/testing gaps briefly.

## Checklist
```text
[ ] Requested scope is preserved.
[ ] Correct domain/layer owns behavior.
[ ] Server-side authorization is complete.
[ ] Private academic data is protected.
[ ] Untrusted input is validated.
[ ] Errors/logs are safe.
[ ] DB constraints/transactions are sound.
[ ] Retryable effects are idempotent where required.
[ ] Time rules are server-authoritative.
[ ] Writing/AI invariants are preserved.
[ ] Tests cover important positive + negative/failure paths.
[ ] No unjustified dependency/infrastructure was added.
[ ] Documentation changes match responsibility changes.
```

## Do Not
- Approve based only on compilation or happy paths.
- Treat formatting preferences as high-severity defects.
- Demand abstractions not justified by current scope.
- Assume hidden UI protects server data.
- Rewrite code during review unless explicitly asked to fix it.
