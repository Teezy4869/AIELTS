# AIELTS Together — Coding Standards

## 1. Purpose
This document defines implementation standards for the AIELTS Together codebase.
Baseline: TypeScript, Next.js App Router, React, PostgreSQL, Drizzle ORM, Better Auth, Zod, Tailwind CSS, shadcn/ui, Vitest, RTL, Playwright, and pnpm.

## 2. Core principles
Code should be explicit, domain-oriented, type-safe, runtime-validated at trust boundaries, server-authoritative for protected rules, testable, and small enough to review.
Do not optimize for abstraction count.

## 3. TypeScript
- Enable strict mode.
- Avoid `any`; use `unknown` and narrow/validate.
- Prefer shared domain types for stable statuses/enums.
- Do not use blind type assertions for untrusted values.
- Keep nullable/optional semantics explicit.
- Do not disable compiler rules globally to solve local problems.

## 4. Technical module ownership
Technical modules should follow the architecture domains rather than mirror all 22 product modules one-to-one:
```text
Identity
Group & Planning
Assignment Orchestration
Learning Content
Submission & Assessment
Progress & Motivation
Communication
Operations
```
Closely related product capabilities may share a technical boundary when ownership stays clear.

## 5. Dependency direction
```text
UI / transport
      ↓
application service
      ↓
domain logic
      ↓
repository / infrastructure
```
Framework code may depend inward. Domain rules should not depend on React, Next.js request objects, Supabase SDK details, or presentation components.

## 6. Server Actions and Route Handlers
They should:
- Parse input.
- Validate with Zod.
- Resolve authentication.
- Call application services.
- Translate expected errors into safe responses.
They should not contain long workflows involving authorization + raw DB + XP + notifications + formatting.
Reusable business behavior belongs in services/domain code.

## 7. Application services
Application services coordinate use cases such as:
```text
createGroup
updateStudyPlan
createManualAssignment
generateScheduledAssignments
submitWork
awardCompletionXP
requestWritingEvaluation
```
A service may coordinate multiple repositories and domain rules. Avoid duplicating a use case across UI/server boundaries.

## 8. Domain logic
Stable domain rules include:
- Group-role permissions.
- Assignment eligibility.
- Schedule interpretation.
- Late-state calculation.
- XP/badge eligibility.
- Content progression.
- Submission transitions.
Keep them independent from UI state and provider SDKs.

## 9. Database access
- Use Drizzle ORM for application persistence.
- Database access is server-side only.
- Browser code must not query application tables directly through Supabase.
- Prefer domain-scoped repositories/query modules.
- Use constraints and transactions in addition to application checks.
- Keep raw SQL localized and parameterized when required.

## 10. Transactions
Use a transaction when partial success would violate an invariant.
Examples:
```text
Assignment generation
→ create assignment
→ create member states
→ advance cursor
```
```text
Submission completion
→ persist submitted state
→ update member state
→ award XP
→ create activity/notification
```
Do not split one logical consistency boundary into unrelated commits without reason.

## 11. Idempotency
Retryable operations must prevent duplicate outcomes, especially:
- Assignment scheduler.
- XP awards.
- Badge awards.
- Event-linked notifications where duplication matters.
- Future AI evaluation jobs.
Prefer durable unique/idempotency constraints over in-memory flags.

## 12. Runtime validation
Use Zod for untrusted input:
```text
forms
Server Action payloads
Route Handler payloads
query parameters
environment config
content import JSON
file metadata
AI subsystem output
```
TypeScript types do not provide runtime validation. Database constraints remain necessary.

## 13. Authentication and authorization
Better Auth owns authentication/session mechanics. AIELTS owns product authorization.
Required protected flow:
```text
resolve session
→ load resource
→ check ownership/membership
→ check role if needed
→ execute operation
```
Never trust browser-provided `user_id`, role, ownership, XP amount, score, late status, deadline, assignment eligibility, quarter, or AI evaluation ownership.

## 14. Error handling
Use predictable application errors for expected conditions, e.g.:
```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
INVALID_INPUT
INVALID_STATE
CONFLICT
CONTENT_EXHAUSTED
```
Do not expose stack traces, SQL details, secrets, or provider internals to users. Unexpected errors should be logged with safe context.

## 15. Logging
Prefer structured logs with fields such as `timestamp`, `level`, `module`, `request_id`, and relevant IDs.
Never log passwords, raw session tokens, secrets, private keys, or full Writing essays/answer payloads by default.

## 16. Naming
Use domain-intent names.
Prefer `generateScheduledAssignments()` over `processItems()` and `isGroupAdmin` over `flag`.
Avoid vague shared files such as `helpers.ts`, `utils.ts`, `common.ts` when domain-specific ownership is clearer.

## 17. File naming
Prefer consistent lowercase/kebab-case file names:
```text
assignment-service.ts
submission-repository.ts
study-plan-schema.ts
writing-editor.tsx
```
React component exports may use PascalCase.

## 18. Function design
Functions should have one clear responsibility, visible side effects, explicit dependencies when useful, and domain-relevant return values.
Avoid many unrelated boolean parameters; prefer a named command/input object when a use case has structured input.

## 19. React components
Components primarily own presentation and interaction.
Client components are appropriate for editors, forms, audio controls, auto-save triggers, and browser APIs.
Do not add `use client` by default.
Server-authoritative decisions such as role, XP, score, deadline, or eligibility do not belong in client-only logic.

## 20. State management
Default order:
```text
server/application state → server data flow
URL-relevant state       → URL
local interaction state  → React state
```
Do not add Redux/Zustand/TanStack Query merely because they are common in web projects. Add them only for a concrete unmet need.

## 21. Forms
- Always validate server-side.
- Client validation is UX only.
- Show clear field errors.
- Do not trust hidden fields for authorization.
- Prevent duplicate destructive/submission actions where appropriate.
- Preserve accessible labels and focus behavior.

## 22. Styling
Use Tailwind through the project design system. Reuse semantic tokens and project-owned shadcn/ui components.
Do not introduce arbitrary colors, spacing, typography, radius, or a second component library when an existing pattern works.
See `design-system.md`.

## 23. Persistent data structure
Keep authoritative/frequently queried data relational.
Use PostgreSQL `jsonb` for approved variable structures such as:
```text
content_json
answer_key_json
answer_data
payload_json
feedback_json
```
Do not hide IDs, status, skill, task type, sequence, deadline, XP amount, quarter key, or model version inside JSON.

## 24. Time handling
Persist absolute instants as timezone-aware timestamps, calendar-only values as dates, and timezone values as IANA identifiers.
Deadline, late, streak, and quarter calculations are server-authoritative.
Do not use browser local time as protected business truth.

## 25. Media handling
Large media belongs in object storage.
Persist durable object identity/metadata rather than expiring signed URLs.
Access provider APIs through a storage capability/adapter.
Validate size/type/MIME before accepting uploads.

## 26. Content import
Crawler code must not write directly to core application tables.
Required flow:
```text
crawler
→ raw data
→ normalizer
→ validator
→ normalized JSON
→ import process
→ PostgreSQL / Storage
```
Validate normalized input before persistence.

## 27. AI integration
The TypeScript application does not import Python research artifacts as runtime dependencies.
AI integration uses a versioned request/result contract.
Validate AI output before persistence.
Do not send unrelated profile, group, XP, or credential data to AI.
Writing submission success must not depend on AI availability.

## 28. Environment configuration
Environment-specific values come from validated environment/configuration, not hard-coded production values.
Never commit real secrets. `.env.example` documents names only.

## 29. Package management and dependencies
- Use `pnpm` only and commit its lockfile.
- Do not generate npm/yarn lockfiles.
- Prefer current stack capabilities before adding packages.
- Avoid duplicate libraries for the same responsibility.
- Review maintenance/security/runtime impact before adding dependencies.

## 30. Comments
Comments explain non-obvious intent/invariants, not syntax.
Good:
```ts
// Cursor advancement shares the transaction with assignment creation
// so a failed retry cannot skip content.
```
Avoid comments that merely restate the next line.

## 31. Abstraction discipline
Do not introduce generic repository frameworks, plugin systems, event buses, service locators, CQRS, or domain-event infrastructure without demonstrated need.
A small amount of local duplication is safer than a wrong global abstraction.

## 32. Infrastructure discipline
Do not add by default:
```text
Redis
BullMQ
Kafka
RabbitMQ
GraphQL
tRPC
microservices
Kubernetes
vector database
analytics warehouse
```
These remain deferred until implementation evidence justifies them.

## 33. Change discipline
- Follow established project patterns unless they are the problem being fixed.
- Do not reformat or rename unrelated code.
- Keep refactors separate from feature changes where practical.
- Preserve compatibility when a migration/deployment sequence requires it.

## 34. Review checklist
```text
[ ] Correct domain owns the logic.
[ ] Business rules are not trapped in UI/transport code.
[ ] Untrusted input is runtime-validated.
[ ] Authorization is server-side.
[ ] Database constraints/transactions are preserved.
[ ] Retryable side effects are idempotent where required.
[ ] Private academic data is not leaked.
[ ] Time logic is server-authoritative.
[ ] No unnecessary dependency/infrastructure was added.
[ ] Relevant tests protect the changed behavior.
```

## 35. Summary
```text
Framework at the edges.
Domain logic in owned modules.
Runtime validation at trust boundaries.
Server-authoritative security and business rules.
PostgreSQL for durable relational state.
Explicit transactions for consistency.
Tests for important rules.
No infrastructure without evidence.
```
