# AIELTS Together — System Design
## 1. Purpose
This document defines the high-level technical architecture of AIELTS Together.
It explains how major components fit together, which responsibilities belong to each boundary, and how the main product flows move through the system.
It intentionally does not define database tables, model internals, framework-specific code structure, or detailed product requirements.
Related details live in:
```text
./database-design.md
./ai-architecture.md
../product/modules.md
```
## 2. Architecture Goals
The architecture prioritizes single-developer maintainability, explicit domain boundaries, backend-enforced privacy, safe scheduled work, external media storage, and the complete group-learning workflow. Writing must remain usable without AI, and future growth should not require premature microservices.
## 3. Architectural Style
AIELTS Together begins as a **modular monolith**.
The primary backend is one deployable application with explicit internal domain boundaries:
```text
Backend Application
├── Identity
├── Group & Planning
├── Assignment Orchestration
├── Learning Content
├── Submission & Assessment
├── Progress & Motivation
├── Communication
└── Operations
```
Product modules remain logically separated even when they run in the same process.
Product modules describe product capabilities; technical modules may group closely related capabilities inside coherent domain boundaries.
The AI Writing subsystem may later run separately because inference has different runtime and dependency needs.

## 4. Technology Baseline

The initial implementation baseline is:

```text
Primary language             → TypeScript
Application runtime          → Node.js active LTS, pinned during bootstrap
Web framework                → Next.js App Router + React
Architecture                 → Modular monolith
Database                     → PostgreSQL
Managed database provider    → Supabase PostgreSQL
ORM / query layer            → Drizzle ORM
Migration tooling            → Drizzle Kit + version-controlled SQL migrations
Authentication               → Better Auth
Session strategy             → Database-backed secure cookie sessions
Boundary validation          → Zod
Object storage               → Supabase Storage
Web hosting                  → Vercel
Scheduled trigger            → Vercel Cron for the initial MVP
UI implementation            → Tailwind CSS + project-owned shadcn/ui components
Unit/service testing         → Vitest
React component testing      → React Testing Library + Vitest
End-to-end testing           → Playwright
Database integration tests   → PostgreSQL
CI                           → GitHub Actions
Package manager              → pnpm
```

These technologies implement the architectural boundaries in this document; they do not replace those boundaries.

Provider-specific infrastructure must remain behind application or infrastructure boundaries where practical. In particular:

```text
Supabase = PostgreSQL + object-storage infrastructure provider
Vercel   = initial web hosting + scheduled trigger provider
```

Neither provider is the application domain architecture.

The AI workstream is expected to use Python, but its model family, training framework, inference framework, queue technology, compute provider, and serving framework remain intentionally deferred.

## 5. System Context
```text
┌─────────────────────┐
│      End User       │
│  Desktop Web Client │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│   AIELTS Together   │
│    Web Platform     │
└──────┬──────┬───────┘
       │      │
       ▼      ▼
┌──────────┐ ┌──────────────┐
│ Database │ │ Object       │
│          │ │ Storage      │
└──────────┘ └──────────────┘
       │
       │ optional in MVP 3
       ▼
┌─────────────────────┐
│ AI Writing Subsystem│
└─────────────────────┘
```
The browser never connects directly to the database.
Authorization decisions remain on the backend.
Media may be delivered through application-controlled URLs or signed access when needed.
## 6. Runtime Components

### Web Application

AIELTS Together uses a single Next.js application for the initial modular-monolith deployment.

The web application contains:

```text
Next.js Application
├── React presentation
├── Server Actions / server-side application boundaries
├── Route Handlers for explicit HTTP boundaries
├── Application services
├── Domain logic
└── Infrastructure adapters
```

The React/UI layer owns presentation, interaction state, skill interfaces, auto-save triggers, and dashboards. It is not authoritative for identity, roles, ownership, assignment eligibility, XP, score, deadline state, or privacy.

Server Actions and Route Handlers are interface/transport boundaries. They must delegate reusable business behavior to application/domain services rather than becoming the primary location of domain rules.

Conceptual flow:

```text
Server Action / Route Handler
            ↓
Application Service
            ↓
Domain Logic
            ↓
Repository / Infrastructure
```

Internal web mutations may use Server Actions or equivalent server-side application boundaries where appropriate.

Explicit HTTP Route Handlers are used when an HTTP boundary is actually required, such as:

- Scheduled triggers.
- Future AI-service communication.
- Future callbacks or integrations.
- A future external API.

Both forms must reuse the same application/domain rules.

### Authentication

Better Auth owns authentication-specific behavior and persistence through the configured database adapter.

The initial session strategy is:

```text
Browser
  ↓
Secure HttpOnly session cookie
  ↓
Next.js server
  ↓
Database-backed session
  ↓
Authenticated user
```

Protected operations validate the authenticated session server-side. The existence of client-visible state or a cookie alone is not authorization.

### Database

PostgreSQL is the relational database technology.

Supabase is the initial managed PostgreSQL provider.

Application data access uses Drizzle ORM. Detailed schema, constraints, indexes, type strategy, and migration principles belong in `database-design.md`.

The browser does not access application tables directly through Supabase.

### Boundary Validation

Untrusted application input is validated before domain logic executes.

Conceptual boundary:

```text
Untrusted input
      ↓
Zod validation
      ↓
Validated command / DTO
      ↓
Application / domain logic
      ↓
Persistence
```

This applies to form input, Route Handler input, query parameters, import data, configuration, and external subsystem output where applicable.

Database constraints remain necessary even when application validation exists.

### Object Storage

Supabase Storage is the initial object-storage provider.

Object storage holds Listening audio, Writing Task 1 images, Reading images, avatars, and temporary ingestion assets.

Application/domain code should depend on storage capabilities rather than scattering provider-specific storage calls across domain modules.

Conceptual boundary:

```text
Application
    ↓
Storage capability / adapter
    ↓
Supabase Storage
```

The database stores durable media references and metadata rather than large binary files or expiring signed URLs.

### Background Jobs

Background processing handles scheduled assignment generation and later other long-running or retryable tasks such as AI evaluation.

For the initial MVP:

```text
Vercel Cron
     ↓
Protected scheduler trigger
     ↓
Assignment Scheduler service
     ↓
PostgreSQL transaction
```

The cron provider only triggers execution. Study-plan interpretation, assignment generation, cursor advancement, idempotency, and notification behavior remain application/domain responsibilities.

A dedicated queue or worker is not required initially. It should be introduced only when concrete runtime needs justify it.

## 7. Domain Boundaries
### Identity
Contains Authentication, User Profile, and personal Settings.
It establishes the current user before protected domain operations run.
### Group & Planning
Contains Group, Goal, and Study Plan.
```text
Who studies together?
        ↓
What is the shared goal?
        ↓
What should the group study and when?
```
Membership and role checks are required before management actions.
### Assignment Orchestration
Contains Assignment, Assignment Scheduler, and group content progression.
It converts Study Plans into concrete shared assignments.
Automatic and manual assignment creation should reuse the same domain rules.
### Learning Content
Contains Question Bank plus Reading, Listening, and Writing content.
The same content may support individual practice and group assignments.
Content progression is sequential, not adaptive.
### Submission & Assessment
Submission is the central record of user learning activity.
Reading and Listening may be graded automatically.
Writing supports draft, save, submit, and review without AI.
### Progress & Motivation
Contains Progress Tracking, Gamification, Quarterly Leaderboard, and Team Activity.
It derives progress and motivation state from learning activity while preserving:
```text
Shared progress indicators
≠
Shared detailed academic results
```
### Communication
Contains in-web Notification and fixed reactions.
There is no general chat or private messaging subsystem.
### Operations
Contains Content Import Pipeline, Admin Monitoring, and File & Media Storage integration.
## 8. Core Learning Flows
The main group workflow is:
```text
User
 ↓
Group
 ↓
Goal
 ↓
Study Plan
 ↓
Assignment
 ↓
Submission
 ↓
Progress / XP
```
### Planning
```text
Owner / Admin
      ↓
React UI
      ↓
Next.js server boundary
      ↓
Backend authorization
      ↓
Application / domain service
      ↓
Goal / Study Plan persistence
```
A Study Plan represents schedule intent; an Assignment represents an actual learning task.
### Automatic Assignment Generation
```text
Vercel Cron
   ↓
Protected scheduler trigger
   ↓
Assignment Scheduler service
   ↓
Load active Study Plans
   ↓
Determine today's activity
   ↓
Resolve next content by sequence
   ↓
Create group Assignment
   ↓
Advance progression
   ↓
Create notifications
```
The job must avoid duplicate assignments when retried.
If content is exhausted, generation stops, the failure is recorded, and administration is notified. The sequence must not silently wrap to the beginning.
### Individual Practice
```text
User
 ↓
Question Bank
 ↓
Select content
 ↓
Submission
 ↓
Grade when applicable
 ↓
Personal progress
```
Individual practice does not require a group Assignment.
### Group Submission
```text
Open Assignment
      ↓
Verify user and group access
      ↓
Create or resume Submission
      ↓
Auto-save
      ↓
Submit
      ↓
Grade when applicable
      ↓
Update progress
      ↓
Award XP / update streak
```
Repeated requests must not create duplicate rewards.
## 9. Skill-Specific Architecture
Reading and Listening follow the common flow `Question Bank → skill UI → Submission → backend grading → Result / Progress`.
Listening additionally resolves media references from Object Storage; large audio is not stored in relational rows.
Writing follows:
```text
Writing Prompt → Editor → Draft / Auto-save → Submission → History / Progress
```
This flow must work without AI. MVP 3 adds an optional `Submitted Writing → AI evaluation → Estimated result` branch. AI failure must not invalidate or roll back the Submission.
## 10. Content Import Architecture
Crawler and persistence responsibilities remain separated:
```text
External Source
 ↓
Crawler
 ↓
Raw Data
 ↓
Normalizer
 ↓
Validator
 ↓
Normalized JSON
 ↓
Import Process
 ↓
Database / Object Storage
```
The crawler must not write directly into the main application database.
The import boundary validates required fields, structure, duplicates, content types, and media references before persistence.
PDF is treated as an ingestion source, not as the end-user exercise format.
## 11. AI Integration Boundary
AI is limited to Writing evaluation in the current product scope.
The web application owns Submission lifecycle, authorization, evaluation state, result persistence, retry orchestration, and presentation. The AI subsystem owns preprocessing, model loading, inference, structured predictions, and model/version identity.
```text
Next.js Application
 ↓
Versioned Evaluation Request
 ↓
AI Writing Subsystem
 ↓
Validated Structured Result
 ↓
Next.js Application
 ↓
Persist / Display
```
Training pipelines and model internals belong in `ai-architecture.md`.
## 12. Authorization and Privacy
Authorization is enforced by the backend:
```text
Authenticate
 ↓
Load resource
 ↓
Check ownership / membership
 ↓
Check role when required
 ↓
Execute operation
```
Only authorized roles may manage group planning.
A user must belong to the relevant group to access its Assignment.
Users may access only their own private Submission details unless explicitly permitted.
Frontend visibility is not authorization.

The browser is never authoritative for:

```text
user_id
role
group membership
group ownership
XP amount
academic score
late status
deadline
assignment eligibility
quarter boundaries
AI evaluation ownership
```

These values are resolved, calculated, or verified on the server when they affect protected behavior.

Group-visible data is limited to approved progress signals such as identity, XP, streak, completion, ranking, and allowed activity. Detailed scores, Writing content, study-time details, Submission history, and personal progress remain private.
## 13. Consistency, Time, and Jobs
Operations that produce related state changes must avoid contradictory partial state.
Examples:
```text
Submit work
→ mark Submission submitted
→ update progress
→ award XP
```
```text
Generate Assignment
→ advance content progression
→ create notifications
```
Detailed transaction strategy belongs in `database-design.md`.
The current default timezone is:
```text
Asia/Bangkok
```

Time handling follows these architecture rules:

```text
Absolute instants       → persisted as timezone-aware timestamps
Calendar-only values    → persisted as dates
User/group timezone     → stored as an IANA timezone identifier
Business date decisions → calculated server-side
```

The backend is authoritative for assignment dates, deadlines, late status, streak boundaries, and quarterly boundaries.
The client must not independently decide these rules from its local clock.
Retryable operations such as assignment generation, reward awarding, and AI evaluation should be idempotent where appropriate.
## 14. Error Handling and Observability
User-facing errors include invalid credentials, unauthorized actions, invalid invite codes, invalid Submission state, and unsupported files.
They should return clear messages without exposing internal details.
Operational errors include scheduler failure, content exhaustion, storage failure, import failure, and AI evaluation failure.
These should be logged and surfaced through Admin Monitoring where relevant.
Structured logs may include:
```text
timestamp
level
module
request_id
user_id when appropriate
group_id when appropriate
message
error information
```
Logs must not contain passwords, secrets, raw session tokens, private keys, or full Writing submissions by default.
## 15. Deployment and Scaling

The initial deployment is:

```text
┌────────────────────────────────┐
│             Vercel             │
│                                │
│ Next.js Application            │
│ ├─ React UI                    │
│ ├─ Server boundaries           │
│ ├─ Application/domain services │
│ └─ Protected cron trigger      │
└────────────┬─────────────┬─────┘
             │             │
             ▼             ▼
     ┌──────────────┐  ┌───────────────┐
     │ PostgreSQL   │  │ Supabase      │
     │ on Supabase  │  │ Storage       │
     └──────────────┘  └───────────────┘

MVP 3:
Next.js Application ─────────→ AI Writing Runtime
```

Vercel is the initial web-hosting and scheduled-trigger provider.
Supabase is the initial managed PostgreSQL and object-storage provider.

Provider choice does not change domain ownership:

```text
Vercel Cron
→ triggers scheduler execution

Assignment Scheduler service
→ owns scheduler business behavior
```

A dedicated worker, queue, distributed cache, or additional service should be introduced only when real runtime needs justify it.

Scaling priority remains:

```text
keep the modular monolith
→ optimize PostgreSQL access
→ use object storage / CDN
→ separate long-running jobs when justified
→ scale AI independently
→ extract services only for concrete operational reasons
```

Microservices are not an initial goal.

## 16. System-Level Security
The architecture requires:
- HTTPS in deployed environments.
- Secrets outside source control.
- Input validation at backend boundaries.
- Treat browser input, Server Action input, Route Handler input, uploads, crawler/import data, and AI subsystem output as untrusted until validated.
- Uploaded-file validation.
- Server-side authorization before protected resource access.
- Restricted administrative operations.
- Validation of crawler/import data before persistence.
- Separation of AI estimates from authoritative academic truth.
Detailed implementation rules belong in `../rules/security.md`.
## 17. Architecture Invariants
Unless an explicit architecture decision changes them:
- The system supports individual and group learning.
- Group Study Plans create shared group Assignments.
- Content progression remains sequential rather than adaptive.
- Detailed academic results remain private.
- Backend authorization is authoritative.
- Business rules do not live exclusively in the frontend or directly inside transport handlers.
- Server Actions and Route Handlers delegate reusable behavior to application/domain services.
- The browser does not access application PostgreSQL tables directly.
- Structured application state belongs in PostgreSQL.
- Large media belongs outside the relational database.
- Retryable background work should avoid duplicate outcomes.
- Background failures must be observable.
- Writing works without AI.
- AI is limited to Writing evaluation.
- AI failure does not invalidate a Submission.
- AI output is an estimate, not an official IELTS result.
## 18. Decisions Intentionally Deferred

The following remain intentionally deferred until implementation evidence justifies them:

- Dedicated queue or worker technology.
- Distributed cache such as Redis.
- Service extraction beyond the modular monolith.
- Long-term hosting changes beyond the initial Vercel/Supabase deployment.
- Dedicated observability provider.
- AI serving framework.
- AI model family.
- AI training framework.
- AI compute or GPU provider.
- AI deployment provider.
- Exact AI transport or queue mechanism.

These decisions should be driven by concrete runtime, research, or operational needs and recorded in ADRs when they materially affect future work.

## 19. Related Documentation
```text
../product/project-overview.md   → product identity and boundaries
../product/modules.md            → detailed module requirements
../product/roadmap.md            → milestones and development order
./database-design.md             → database architecture
./ai-architecture.md             → AI architecture
../decisions/                    → ADRs
../rules/                        → engineering rules
../project-memory/               → current implementation state
```
