# AIELTS Together — Engineering Workflow

## 1. Purpose
This document defines how engineering work moves from task understanding to implementation, verification, documentation, and completion.
It defines process only. Product behavior belongs in `docs/product/`; architecture belongs in `docs/architecture/`.

## 2. Core principles
1. Read the authoritative documentation before changing an existing product area.
2. Make the smallest correct change; avoid unrelated refactors and scope expansion.
3. Product and architecture decisions must be explicit, never hidden inside implementation.
4. Verification is part of implementation, not a final optional step.
5. Update only the documentation whose responsibility actually changed.
6. Project memory records current useful state, not chat history or duplicate specifications.

## 3. Source-of-truth hierarchy
```text
Product identity / principles      → docs/product/project-overview.md
Functional module behavior         → docs/product/modules.md
Milestones / development order     → docs/product/roadmap.md
System / runtime architecture      → docs/architecture/system-design.md
Persistent data design             → docs/architecture/database-design.md
AI subsystem architecture          → docs/architecture/ai-architecture.md
Engineering constraints            → docs/rules/*.md
Decision history                   → docs/decisions/ADR-*.md
Current implementation state       → docs/project-memory/*.md
```
Project memory must never override product, architecture, or rules.

## 4. Standard task flow
```text
1. Understand the requested behavior.
2. Identify the owning domain/module.
3. Read the relevant source-of-truth files.
4. Inspect the current implementation and tests.
5. Identify invariants, privacy rules, and risks.
6. Plan the smallest correct change.
7. Implement in dependency order.
8. Run focused tests, then broader verification.
9. Review the final diff.
10. Update docs / ADR / project memory only if needed.
```

## 5. Understand the task
Before editing, determine:
- What user-visible behavior changes?
- Which product module owns it?
- Is it a feature, bug fix, refactor, migration, operational task, or AI experiment?
- Does it affect authorization, privacy, persistence, scheduling, XP, or AI?
- Does it conflict with an existing product or architecture decision?
If a task conflicts with a source of truth, do not silently make the implementation authoritative.

## 6. Technical domain ownership
Prefer one primary owner:
```text
Identity
Group & Planning
Assignment Orchestration
Learning Content
Submission & Assessment
Progress & Motivation
Communication
Operations
AI Writing
```
A task may cross domains, but ownership should remain clear. Do not create generic shared code merely to avoid deciding where behavior belongs.

## 7. Required reading by task type
### Product behavior change
Read `docs/product/modules.md`; also read `project-overview.md` when product principles or scope may change.
### Architecture/runtime change
Read `docs/architecture/system-design.md` and the relevant specialized architecture document.
### Database change
Read `docs/architecture/database-design.md`.
### AI change
Read `docs/architecture/ai-architecture.md`.
### UI change
Read `docs/rules/design-system.md`.
### Security-sensitive change
Read `docs/rules/security.md`.

## 8. Inspect before adding
Before creating new code:
- Search for existing services, repositories, validators, components, schemas, and tests.
- Reuse the established project pattern when it is still appropriate.
- Check project memory for known limitations or unfinished work.
- Confirm the responsibility is not already implemented elsewhere.
Do not create parallel implementations of the same responsibility without an explicit replacement plan.

## 9. Preserve architecture invariants
Important invariants include:
```text
Backend authorization is authoritative.
Writing works without AI.
AI failure does not invalidate Submission.
Group Study Plans create shared group Assignments.
Content progression is sequential, not adaptive.
Detailed academic results remain private.
Browser / import / AI input is untrusted.
Retryable work must avoid duplicate outcomes.
Large media remains outside PostgreSQL.
```
Changing an invariant is a product/architecture decision, not a local coding preference.

## 10. Plan the minimal change
A plan should identify:
- Files to modify/create.
- Data/schema impact.
- Validation and authorization changes.
- Transaction/idempotency implications.
- Tests required.
- Documentation or ADR impact.
Prefer extending an existing service or domain boundary over adding business logic directly to UI, Server Actions, or Route Handlers.

## 11. Recommended implementation order
For a normal feature:
```text
Domain rule/type
→ validation contract
→ repository/persistence
→ application service
→ server boundary
→ UI
→ tests
→ documentation/memory
```
For database changes:
```text
Drizzle schema
→ generated migration
→ inspect SQL
→ test migration
→ repository/service
→ UI/API
→ integration tests
```
For protected operations:
```text
resolve session
→ validate input
→ load resource
→ authorize
→ execute domain operation
→ return safe result
```

## 12. Server boundary workflow
Server Actions and Route Handlers are transport/interface boundaries.
They should:
1. Parse and validate input.
2. Resolve authenticated identity.
3. Call an application service.
4. Translate expected errors into safe responses.
They must not become the main location for reusable business rules.

## 13. Database workflow
Normal schema evolution:
```text
Change Drizzle schema
→ generate SQL migration
→ inspect SQL
→ run on development/test PostgreSQL
→ run integration tests
→ commit schema + migration together
```
Production uses committed migrations. Direct schema push is not the normal production path.
Prefer additive evolution when compatibility matters:
```text
add nullable
→ deploy compatible code
→ backfill
→ tighten constraint
→ remove obsolete field later
```

## 14. Dependency workflow
Before adding a dependency:
1. Check whether the current stack already solves the problem.
2. Confirm the dependency solves a concrete requirement.
3. Prefer maintained, focused packages.
4. Avoid introducing a second library for an existing responsibility.
5. Record an architecture decision when the dependency materially changes future architecture.
Do not add Redis, queues, global state libraries, microservice frameworks, or observability platforms pre-emptively.

## 15. Testing during implementation
Add or update tests as important rules are implemented. Highest-priority areas:
- Authorization and privacy.
- Scheduler idempotency.
- Submission lifecycle.
- XP/badge duplicate prevention.
- Database transaction boundaries.
- Import validation.
- AI failure isolation.
See `testing.md` for detailed requirements.

## 16. Final review
Review the diff across five dimensions:
### Scope
- Does it solve only the requested problem?
- Did unrelated behavior change?
### Architecture
- Is logic in the correct layer/domain?
- Did UI/transport become authoritative?
### Security
- Is untrusted input validated?
- Is authorization server-side?
- Is private data protected?
### Data
- Are constraints/transactions/idempotency correct?
### Maintainability
- Is duplicate logic introduced?
- Are names and ownership clear?

## 17. Documentation update rules
Update `modules.md` when user-visible capabilities or product rules change.
Update `roadmap.md` when milestone scope/order changes.
Update architecture docs when component boundaries, ownership, persistence, or infrastructure architecture changes.
Create an ADR for significant, hard-to-reverse decisions with meaningful alternatives.
Update project memory when implementation status, known issues, or durable implementation lessons change.
Do not update every documentation file after every task.

## 18. Definition of Done
```text
[ ] Requested behavior is implemented.
[ ] Relevant product/architecture invariants are preserved.
[ ] Input validation exists at untrusted boundaries.
[ ] Authorization is enforced server-side where required.
[ ] Database integrity and transactions are correct.
[ ] Retryable effects are idempotent where required.
[ ] Relevant tests were added/updated.
[ ] Lint/typecheck/tests/build pass as applicable.
[ ] No unrelated changes remain in the diff.
[ ] Documentation was updated only where responsibility changed.
[ ] Project memory reflects meaningful state changes when necessary.
```

## 19. Bug-fix workflow
```text
Reproduce
→ identify the violated rule/invariant
→ add regression test when practical
→ fix the smallest underlying cause
→ verify adjacent behavior
→ update known issues if relevant
```
Do not hide product ambiguity inside a bug fix.

## 20. Refactor workflow
A refactor should preserve user-visible behavior unless explicitly stated otherwise.
Before refactoring: identify the concrete pain, define the boundary being improved, preserve tests, and avoid bundling unrelated features.
Architecture-changing refactors require architecture review and may require an ADR.

## 21. AI experiment workflow
```text
Hypothesis
→ dataset/version
→ experiment
→ evaluation
→ result record
→ promotion decision
```
Research code, notebooks, and checkpoints do not become production dependencies automatically. Production integration still follows the stable AI evaluation contract.

## 22. Prohibited patterns
```text
Code first, architecture later.
Silent product-scope expansion.
Business logic copied across Route Handlers/Server Actions.
Browser-authoritative roles, scoring, XP, deadlines, or privacy.
Production schema push without committed migration.
Infrastructure added only because it may be useful later.
Project memory used as transcript or duplicate spec.
Large unrelated refactor inside feature work.
```

## 23. Summary
```text
Read the source of truth
→ identify ownership
→ preserve invariants
→ make the smallest correct change
→ verify behavior and failure paths
→ review security/data boundaries
→ update only the documentation that actually changed
```
