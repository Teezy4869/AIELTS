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
- Future external API.

For normal internal UI mutations, first consider a Server Action/server-side boundary.

## Required Reading
- `AGENTS.md`
- `docs/architecture/system-design.md`
- `docs/rules/coding-standards.md`
- `docs/rules/security.md`
- `docs/rules/testing.md`
- Owning product/DB/AI document when applicable.

## Boundary
```text
HTTP request
→ Route Handler
→ validation
→ authentication / authorization
→ application service
→ domain / persistence
→ safe response
```

## Workflow

### 1. Confirm HTTP is necessary
Identify the caller and why an explicit HTTP contract is required.
Do not create REST endpoints for every internal UI mutation by default.

### 2. Identify the owning use case
Find or define the application service that owns the operation, e.g.:
```text
createGroup()
updateStudyPlan()
createManualAssignment()
submitWork()
generateScheduledAssignments()
requestWritingEvaluation()
```

Do not implement the workflow directly in the handler.

### 3. Define a minimal contract
Specify:
- method and path;
- path/query/body inputs;
- authentication requirement;
- success shape;
- expected error shapes.

Do not expose raw database rows or provider-specific structures without an intentional contract.

### 4. Validate untrusted input
Use Zod for identifiers, enums, strings, bounds, dates, and nested payloads as applicable.
Do not use blind casts for request bodies.

### 5. Authenticate and authorize server-side
Protected flow:
```text
resolve Better Auth session
→ load resource
→ verify ownership/membership
→ verify role when required
→ execute
```

Never trust client-provided user IDs, roles, ownership, XP, score, deadline, or eligibility.

### 6. Delegate
The handler should primarily:
```text
parse → validate → resolve identity → call service → map result/error
```

Avoid coordinating raw DB writes, XP, notifications, storage, and formatting directly in one handler.

### 7. Return safe responses
Expected application errors may map to:
```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
INVALID_INPUT
INVALID_STATE
CONFLICT
CONTENT_EXHAUSTED
```

Never expose stack traces, SQL, secrets, tokens, connection data, or provider credentials.

### 8. Protect mutations
- Avoid state-changing GET requests.
- Keep framework/auth origin/CSRF protections enabled.
- Make retryable effects idempotent when duplication matters.
- For cron routes, verify trigger authenticity before invoking scheduler logic.

### 9. Preserve privacy
Group-facing payloads must not expose another member's detailed Reading/Listening scores, Writing text/band, AI criteria, detailed study time, or private progress/submission history.
Filter at the server boundary, not only in UI.

### 10. Test
Cover as applicable:
```text
valid request
invalid input
missing/invalid session
forbidden role/resource
expected conflict/state error
retry/idempotency
privacy of response shape
```

Prefer service/integration tests for domain rules and endpoint tests for transport behavior.

### 11. Verify
Run focused tests plus relevant lint/typecheck/build checks.
Review whether the handler is thin, validated, authorized, safe, and reusable through its service.

## Done
```text
[ ] HTTP boundary is justified.
[ ] Contract is minimal and explicit.
[ ] Runtime validation exists.
[ ] Authentication/authorization is server-side.
[ ] Handler delegates to an application service.
[ ] Responses do not leak internal/private data.
[ ] Retryable effects are safe where needed.
[ ] Positive + failure/forbidden tests exist as needed.
[ ] Relevant verification passes.
```

## Do Not
- Build an API layer for every internal mutation.
- Put reusable domain workflows in Route Handlers.
- Trust final business values from the browser.
- Return raw persistence/provider objects by accident.
- Add a second API/transport stack without a concrete architecture decision.
