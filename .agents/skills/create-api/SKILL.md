---
name: create-api
description: Use when adding or changing an explicit HTTP Route Handler or server-facing API boundary in AIELTS.
---

# Create API

## Purpose
Create a thin, secure HTTP boundary that delegates to an AIELTS application use case instead of embedding business rules in transport code.

## Use When
Use for an actual HTTP boundary:
- Route Handler required by a caller.
- Protected cron trigger.
- Future AI-service communication.
- Callback/integration endpoint.

For normal internal UI mutations, first consider a Server Action/server-side boundary.

## Required Reading
- AGENTS.md
- docs/architecture/system-design.md
- docs/rules/coding-standards.md
- docs/rules/security.md
- docs/rules/testing.md

## Boundary
```text
HTTP request → Route Handler → validation → authentication / authorization
→ application service → domain / persistence → safe response
```

## Workflow

### 1. Confirm HTTP is necessary
Identify the caller and why an explicit HTTP contract is required.
Do not create REST endpoints for every internal UI mutation by default.

### 2. Identify the owning use case
Find or define the application service that owns the operation.

### 3. Validate untrusted input
Use Zod for identifiers, enums, strings, bounds, dates, and nested payloads.

### 4. Authenticate and authorize server-side
```text
resolve Better Auth session → load resource → verify ownership/membership
→ verify role when required → execute
```

### 5. Return safe responses
Expected application errors may map to: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, INVALID_INPUT, INVALID_STATE, CONFLICT.

Never expose stack traces, SQL, secrets, tokens, or provider credentials.

## Done
```text
[ ] HTTP boundary is justified.
[ ] Contract is minimal and explicit.
[ ] Runtime validation exists.
[ ] Authentication/authorization is server-side.
[ ] Handler delegates to an application service.
[ ] Responses do not leak internal/private data.
```

## Do Not
- Build an API layer for every internal mutation.
- Put reusable domain workflows in Route Handlers.
- Trust final business values from the browser.
