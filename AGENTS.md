# AIELTS Together — Codex Operating Guide

## 1. Purpose
This file is the repository-level operating guide for Codex working on AIELTS Together.

It exists to:
- Orient Codex before repository work begins.
- Route to the correct source of truth.
- Summarize project-wide invariants.
- Define the expected engineering workflow.
- Provide command and verification guidance.
- Define when documentation should change.

---

## 2. Project Snapshot
AIELTS Together is a desktop-first web application for individual and small-group IELTS study.

Supported skills: **Reading, Listening, Writing**. Speaking is outside current scope.

Core group-learning flow:
```text
Group → Goal → Study Plan → Assignment → Submission → Progress / XP
```

Writing must work without AI. AI is limited to Writing Evaluation.

---

## 3. Technology Baseline
- **Language**: TypeScript
- **Runtime**: Node.js active LTS
- **Web**: Next.js App Router + React
- **Architecture**: Modular monolith
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit + version-controlled SQL
- **Auth**: Better Auth + database-backed sessions
- **Validation**: Zod
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **UI**: Tailwind CSS + shadcn/ui
- **Tests**: Vitest, React Testing Library, Playwright
- **CI**: GitHub Actions
- **Package manager**: pnpm

---

## 4. Repository Structure
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

---

## 5. Source of Truth
| Concern | Authority |
|---|---|
| Product identity / principles | docs/product/project-overview.md |
| Functional module behavior / scope | docs/product/modules.md |
| Milestones / development order | docs/product/roadmap.md |
| System boundaries / runtime | docs/architecture/system-design.md |
| Persistent data / migrations | docs/architecture/database-design.md |
| AI lifecycle / evaluation boundary | docs/architecture/ai-architecture.md |
| Engineering workflow | docs/rules/workflow.md |
| Implementation conventions | docs/rules/coding-standards.md |
| Testing requirements | docs/rules/testing.md |
| Security requirements | docs/rules/security.md |
| Decision history | docs/decisions/ADR-*.md |
| Current implementation state | docs/project-memory/*.md |

---

## 6. Project-Wide Invariants
1. Backend authorization is authoritative.
2. Business rules must not live exclusively in UI, Server Actions, or Route Handlers.
3. Writing works without AI.
4. AI is limited to Writing Evaluation.
5. AI failure never invalidates or rolls back a Writing Submission.
6. AI output is untrusted input and must be contract-validated.
7. Group Study Plans create shared group Assignments, not individualized assignments.
8. Content progression is sequential, not adaptive.
9. Detailed academic results and Writing content remain private.
10. Large media belongs in object storage, not PostgreSQL.
11. Retryable work must avoid duplicate outcomes.
12. XP/reward calculations are server-authoritative.
13. Deadlines, late state, streaks are server-authoritative.

---

## 7. Working Rules
1. Read the relevant source-of-truth documents before changing an existing area.
2. Make the smallest correct change; avoid unrelated refactors.
3. Identify security, privacy, transaction, idempotency, and time risks.
4. Keep domain logic out of presentation and transport boundaries.
5. Validate untrusted runtime input before domain logic.
6. Enforce protected authorization server-side.
7. Run focused verification first, then broader checks.
8. Update docs only when responsibility changed.

Protected-operation flow:
```text
resolve session → validate input → load resource → authorize
→ execute domain operation → return safe result
```

---

## 8. Commands
```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

---

## 9. Available Skills
Use the relevant repository skill when one of these workflows applies. Invoke it explicitly as `$skill-name` when needed:

- $database-migration — Use when changing PostgreSQL schema, constraints, indexes, or Drizzle migrations.
- $review-code — Use when reviewing changes, pull requests, or diffs.
- $ai-experiment — Use when designing, running, or evaluating AI Writing research experiments.
- $create-api — Use when adding HTTP Route Handlers or server-facing API boundaries.

---

## 10. Definition of Done
- [ ] Requested behavior is implemented.
- [ ] Relevant product/architecture invariants are preserved.
- [ ] Input validation exists at untrusted boundaries.
- [ ] Authorization is server-side where required.
- [ ] Private academic data remains protected.
- [ ] Database integrity/transactions are correct.
- [ ] Retryable effects are idempotent where required.
- [ ] Relevant tests were added or updated.
- [ ] Lint/typecheck/tests/build pass.
- [ ] No unrelated changes in the diff.
- [ ] Documentation updated only where responsibility changed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
