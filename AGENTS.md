# AIELTS Together — Agent Operating Guide

## 1. Purpose
This file is the repository-level operating guide for coding agents working on AIELTS Together.

It exists to:
- Orient the agent before repository work begins.
- Route the agent to the correct source of truth.
- Summarize project-wide invariants.
- Define the expected engineering workflow.
- Provide command and verification guidance.
- Define when documentation should change.

It is intentionally concise. It is **not** the authoritative product specification, architecture encyclopedia, database documentation, AI design document, coding-standard encyclopedia, project memory, task history, or detailed reusable procedure.

---

## 2. Project Snapshot
AIELTS Together is a desktop-first web application for individual and small-group IELTS study.

Supported skills: **Reading, Listening, Writing**. Speaking is outside the current scope.

Core group-learning flow:
```text
Group → Goal → Study Plan → Assignment → Submission → Progress / XP
```

The product also supports individual practice using the same learning content. Writing must work without AI. AI is limited to later Writing Evaluation.

Detailed product scope belongs in `docs/product/`.

---

## 3. Technology Baseline
```text
Language              → TypeScript
Runtime               → Node.js active LTS
Web                   → Next.js App Router + React
Architecture          → Modular monolith
Database              → PostgreSQL
Managed database      → Supabase PostgreSQL
ORM                   → Drizzle ORM
Migrations            → Drizzle Kit + version-controlled SQL
Authentication        → Better Auth
Sessions              → Database-backed secure cookie sessions
Validation            → Zod
Object storage        → Supabase Storage
Hosting               → Vercel
Scheduled trigger     → Vercel Cron
UI                    → Tailwind CSS + project-owned shadcn/ui
Unit/service tests    → Vitest
Component tests       → React Testing Library + Vitest
End-to-end tests      → Playwright
Database tests        → PostgreSQL
CI                    → GitHub Actions
Package manager       → pnpm
AI workstream         → Python ecosystem; exact stack deferred
```

Do not replace or duplicate these responsibilities without a concrete requirement. Significant changes require an explicit architecture decision.

---

## 4. Repository and Domain Structure
```text
src/
├── app/          → routes, pages, layouts, server boundaries
├── modules/      → application/domain logic by technical ownership
├── db/           → schema, migrations, persistence support
├── components/   → reusable UI
├── lib/          → infrastructure/general support
└── config/       → validated configuration

docs/
├── product/          → product identity, behavior, roadmap
├── architecture/     → system, database, AI architecture
├── rules/            → engineering rules
├── decisions/        → ADRs
└── project-memory/   → current implementation state
```

Primary technical domains: `Identity`, `Group & Planning`, `Assignment Orchestration`, `Learning Content`, `Submission & Assessment`, `Progress & Motivation`, `Communication`, `Operations`, `AI Writing`.

Product modules do not need a one-to-one mapping to technical folders. Keep ownership explicit.

---

## 5. Source of Truth
| Concern | Authority |
|---|---|
| Product identity / principles | `docs/product/project-overview.md` |
| Functional module behavior / scope | `docs/product/modules.md` |
| Milestones / development order | `docs/product/roadmap.md` |
| System boundaries / runtime / technology | `docs/architecture/system-design.md` |
| Persistent data / constraints / transactions / migrations | `docs/architecture/database-design.md` |
| AI lifecycle / evaluation boundary | `docs/architecture/ai-architecture.md` |
| Engineering workflow | `docs/rules/workflow.md` |
| Implementation conventions | `docs/rules/coding-standards.md` |
| Testing requirements | `docs/rules/testing.md` |
| Security requirements | `docs/rules/security.md` |
| UI rules | `docs/rules/design-system.md` |
| Decision history | `docs/decisions/ADR-*.md` |
| Current implementation state | `docs/project-memory/*.md` |

Project memory never overrides product, architecture, security, or engineering rules. If authoritative documents conflict, identify the conflict instead of silently choosing one.

---

## 6. Required Reading by Task
| Task | Read |
|---|---|
| Normal engineering task | `workflow.md`, `coding-standards.md` |
| Product behavior/scope | `modules.md`; also `project-overview.md` when principles/scope are affected |
| Milestone/order change | `roadmap.md` |
| Architecture/runtime/provider/infrastructure | `system-design.md` |
| Database/schema/transaction/migration | `database-design.md` |
| AI research/integration/runtime | `ai-architecture.md` |
| Authentication/authorization/privacy/uploads/secrets | `security.md` |
| UI/layout/theme/accessibility | `design-system.md` |
| Test strategy/verification | `testing.md` |

Also inspect the current implementation, nearby tests, and relevant project memory before adding parallel code or abstractions.

---

## 7. Project-Wide Invariants
Unless an explicit product or architecture decision changes them:

1. Backend authorization is authoritative; frontend visibility is not authorization.
2. Business rules must not live exclusively in UI, Server Actions, or Route Handlers.
3. Server boundaries delegate reusable behavior to application/domain services.
4. The browser must not directly access application PostgreSQL tables.
5. Group Study Plans create shared group Assignments, not individualized assignments.
6. Content progression is sequential, not adaptive.
7. Detailed academic results and Writing content remain private.
8. Writing works without AI.
9. AI is limited to Writing Evaluation in current scope.
10. AI failure never invalidates or rolls back a Writing Submission.
11. AI output is untrusted input and must be contract-validated.
12. Large media belongs in object storage, not PostgreSQL.
13. Crawler output never writes directly into core application tables.
14. Retryable work must avoid duplicate outcomes.
15. Assignment creation and content-cursor advancement remain consistency-safe.
16. XP/reward calculations are server-authoritative.
17. Deadlines, late state, streaks, and quarter boundaries are server-authoritative.
18. Do not silently expand product scope.
19. Do not add infrastructure or major dependencies without demonstrated need.

---

## 8. Working Rules
For every implementation task:

1. Understand the requested behavior and identify the owning domain.
2. Read the relevant source-of-truth documents.
3. Inspect existing code, tests, schemas, components, and project memory first.
4. Identify security, privacy, transaction, idempotency, and time risks.
5. Make the smallest correct change.
6. Reuse established project patterns when appropriate.
7. Keep domain logic out of presentation and transport boundaries.
8. Validate untrusted runtime input before domain logic.
9. Enforce protected authorization server-side.
10. Preserve constraints and transaction boundaries.
11. Avoid unrelated refactors, renames, formatting, or scope expansion.
12. Avoid parallel auth, validation, storage, persistence, or state stacks.
13. Add dependencies only for concrete unmet requirements.
14. Run focused verification first, then broader checks as appropriate.
15. Review the final diff for scope, architecture, security, data integrity, and maintainability.
16. Update only documentation whose owned responsibility changed.

Protected-operation flow:
```text
resolve session → validate input → load resource → authorize
→ execute application/domain operation → return safe result
```

Typical feature flow:
```text
domain rule/type → validation → persistence → application service
→ server boundary → UI → tests → docs/memory when required
```

---

## 9. Commands and Verification
Repository-defined scripts become authoritative after application bootstrap.

Expected command surface:
```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Do not assume an expected command exists unless it is defined in the repository.

Verification rules:
- Run the smallest relevant tests first.
- Use real PostgreSQL when DB semantics, constraints, transactions, or `jsonb` matter.
- Authorization changes require forbidden-path coverage.
- Privacy boundaries should be verified at server/API level, not only UI level.
- Retryable workflows require idempotency coverage where relevant.
- Time-sensitive behavior uses deterministic timezone-aware tests.
- Important bug fixes should add regression coverage when practical.
- Run lint, typecheck, tests, build, and selected E2E checks as applicable.

Detailed requirements live in `docs/rules/testing.md`.

---

## 10. Documentation and Decision Rules
| Change | Update |
|---|---|
| Product capability/rule | `docs/product/modules.md` |
| Product identity/principle/scope | `docs/product/project-overview.md` |
| Milestone scope/order | `docs/product/roadmap.md` |
| System/runtime/provider/infrastructure | `docs/architecture/system-design.md` |
| Persistent model/integrity/transaction architecture | `docs/architecture/database-design.md` |
| AI lifecycle/contract/runtime boundary | `docs/architecture/ai-architecture.md` |
| Engineering rule | relevant `docs/rules/*.md` |
| Significant hard-to-reverse decision | create a new ADR |
| Meaningful implementation state / known issue / durable lesson | `docs/project-memory/` |

Do not update every documentation file after every task. Project memory is not a transcript or duplicate specification. Detailed reusable procedures belong in `.agents/skills/`, not in this file.

---

## 11. Definition of Done
```text
[ ] Requested behavior is implemented.
[ ] Relevant product/architecture invariants are preserved.
[ ] Untrusted input is validated where required.
[ ] Authorization is server-side where required.
[ ] Private academic data remains protected.
[ ] Database integrity/transactions are correct.
[ ] Retryable effects are idempotent where required.
[ ] Relevant tests were added or updated.
[ ] Applicable lint/typecheck/tests/build checks pass.
[ ] No unrelated changes remain.
[ ] Documentation changed only where responsibility changed.
[ ] Project memory changed only for meaningful current state.
```

If a task conflicts with an existing source of truth, treat it as a product or architecture decision rather than a local implementation detail.
