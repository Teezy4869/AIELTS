---
name: implement-module
description: Use when implementing or extending an AIELTS product capability across domain logic, persistence, server boundaries, UI, and tests.
---

# Implement Module

## Purpose
Implement the smallest complete product change in the correct AIELTS domain while preserving product scope, architecture, privacy, and repository rules.

## Use When
- Implementing a new module capability.
- Extending existing user-visible behavior.
- Connecting domain, persistence, server boundary, UI, and tests.

For database-only changes use `database-migration`. For review-only work use `review-code`. For isolated AI research use `ai-experiment`.

## Required Reading
Always read:
- `AGENTS.md`
- `docs/rules/workflow.md`
- `docs/rules/coding-standards.md`
- `docs/rules/testing.md`

Then read only what the task touches:
```text
product behavior/scope → docs/product/
architecture/runtime   → docs/architecture/system-design.md
persistence            → docs/architecture/database-design.md
security/privacy/auth  → docs/rules/security.md
UI                     → docs/rules/design-system.md
AI                     → docs/architecture/ai-architecture.md
current state          → relevant docs/project-memory/*.md
```

## Workflow

### 1. Identify ownership
Determine the requested behavior, owning product module, owning technical domain, dependencies, and affected layers.

Technical domains:
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

If the request conflicts with an authoritative document, surface the decision instead of silently making code authoritative.

### 2. Inspect before adding
Search for existing services, repositories, validators, components, tests, schemas, and project-memory notes.
Reuse an established pattern when it still fits. Do not create parallel implementations without a replacement reason.

### 3. Check risks
Identify whether the task affects:
```text
authentication / authorization
private academic data
transactions / idempotency
scheduler / XP / rewards
time boundaries
storage / imports
AI failure isolation
```

Preserve all applicable invariants from `AGENTS.md`.

### 4. Plan the smallest dependency-ordered change
Preferred order:
```text
domain rule/type
→ validation
→ persistence
→ application service
→ server boundary
→ UI
→ tests
→ docs/memory when required
```

Do not create a layer the change does not need.

### 5. Implement domain behavior
Keep reusable business rules independent from React, Next.js request objects, and provider SDKs.
Use domain-intent names and focused functions.

### 6. Validate boundaries
For untrusted data:
```text
input → Zod → validated command/DTO → application/domain logic
```

TypeScript types do not replace runtime validation.

### 7. Persist safely
Use Drizzle/PostgreSQL through established boundaries.
Use a transaction when partial success would violate an invariant.
Make retryable effects idempotent where duplicate outcomes matter.

If schema changes are required, follow `database-migration`.

### 8. Implement protected server boundaries
Use:
```text
resolve session
→ validate input
→ load resource
→ authorize
→ call application/domain service
→ return safe result
```

Server Actions and Route Handlers are interfaces, not the primary home of reusable business rules.

### 9. Implement UI from authorized data
Follow `design-system.md`.
The client must not be authoritative for identity, role, membership, XP, score, deadline, late state, assignment eligibility, or privacy.
Handle relevant loading, empty, error, pending, and disabled states.

### 10. Test at the lowest correct layer
```text
pure rule                  → Vitest
application use case       → service test
constraint/transaction     → PostgreSQL integration
component interaction      → RTL + Vitest
critical cross-layer flow  → Playwright
```

Add forbidden-path coverage for important authorization changes, retry coverage for idempotent behavior, and failure-path coverage where partial state is dangerous.

### 11. Verify and review
Run focused checks first, then broader repository-defined checks as applicable:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Review the final diff for scope, architecture, security, data integrity, and unrelated changes.

### 12. Update documentation selectively
```text
product behavior           → modules.md
product principle/scope    → project-overview.md
milestone/order            → roadmap.md
architecture               → architecture docs
engineering rule           → relevant rules file
hard-to-reverse decision   → ADR
meaningful current state   → project memory
```

## Done
```text
[ ] Correct domain owns the change.
[ ] Existing patterns were inspected first.
[ ] Scope/architecture was not silently expanded.
[ ] Untrusted input is validated.
[ ] Authorization is server-side where required.
[ ] Privacy is preserved.
[ ] Transactions/idempotency are correct where required.
[ ] Relevant positive + failure/forbidden tests exist.
[ ] Applicable verification passes.
[ ] No unrelated changes remain.
[ ] Docs/memory changed only when warranted.
```

## Do Not
- Put reusable business logic mainly in UI/transport code.
- Trust client identity, role, XP, score, deadlines, or privacy state.
- Add speculative infrastructure or duplicate auth/validation/storage stacks.
- Bundle unrelated refactors with feature work.
- Use project memory as product or architecture authority.
