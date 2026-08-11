# AIELTS Together — Security Rules

## 1. Purpose
This document defines engineering security rules for authentication, authorization, private academic data, validation, sessions, persistence, media, secrets, jobs, imports, and AI boundaries.

## 2. Trust model
Treat as untrusted until validated/authorized:
```text
browser input
Server Action payloads
Route Handler payloads
query parameters
cookies/client state
file uploads
crawler/import data
external service responses
AI subsystem output
```
Requests originating from the project UI are not automatically trusted.

## 3. Authentication
Authentication uses Better Auth with database-backed secure cookie sessions.
```text
Browser
→ HttpOnly session cookie
→ Next.js server
→ Better Auth session validation
→ authenticated user
```
Rules:
- Passwords are never stored/logged in plaintext.
- Credential hashing and session persistence are Better Auth responsibilities.
- Protected operations validate the session server-side.
- Do not create a second parallel JWT/session system without an explicit architecture decision.

## 4. Registration and login
Current behavior:
```text
Registration → email + username + password
Login        → email or username + password
```
MVP excludes email verification, social login, and email-based password recovery.
Identity uniqueness follows the configured authentication contract.

## 5. Authorization
Authorization is server-authoritative.
```text
authenticate
→ load resource
→ verify ownership/membership
→ verify role when required
→ execute operation
```
Frontend visibility is not authorization.
Never trust browser-provided user ID, role, ownership, XP, score, deadline, late status, assignment eligibility, quarter, or AI evaluation ownership.

## 6. Group authorization
- Owner-only operations must verify current ownership.
- Owner/Admin planning or manual-assignment actions must verify active role.
- Members may access only groups/assignments where active membership exists.
- Submission access remains scoped to the submitting user unless product rules explicitly permit otherwise.

## 7. Private academic data
Private by default:
```text
detailed Reading scores
detailed Listening scores
Writing text
Writing band / AI criterion scores
detailed study time
detailed personal progress
Submission history
```
Group-visible data is limited to approved signals such as display name, avatar, XP, streak, completion, completion rate, rank, and approved Team Activity.
Server/API payloads must enforce this boundary; hidden UI alone is insufficient.

## 8. Input validation
Use Zod at untrusted application boundaries. Validate shape, required fields, enum/status values, lengths, numeric bounds, dates, and identifiers as appropriate.
Validation occurs before domain logic. Database constraints still enforce persistent integrity.

## 9. Safe errors
User-facing responses must not expose stack traces, raw SQL, DB connection strings, provider credentials, raw session tokens, secrets, or internal exception dumps.
Return stable, minimal error messages/codes.

## 10. Session security
- Use secure + HttpOnly cookie settings in deployed environments.
- Do not expose raw session tokens to client JavaScript unnecessarily.
- State-changing protected actions validate a server-side session.
- Logout must invalidate the relevant session behavior.
- Do not rely only on client auth state.

## 11. Request mutation safety
- Avoid state-changing GET requests.
- Keep framework/auth-library origin/CSRF protections enabled unless there is a reviewed reason not to.
- Explicit HTTP mutation endpoints validate method, input, authentication, and authorization.

## 12. Secrets
Secrets remain outside source control and logs.
Examples: DB credentials, Better Auth secret, Supabase service credentials, storage secrets, cron secret, future AI-service credentials.
`.env.example` documents names only. Rotate any secret that is accidentally exposed.

## 13. Database security
- Browser never directly accesses application PostgreSQL tables.
- DB credentials are server-only.
- Use parameterized queries/raw SQL when needed.
- Preserve FK/unique/check constraints where practical.
- Use transactions for consistency-sensitive workflows.
Supabase is infrastructure, not the product authorization layer.

## 14. Object storage security
- Access storage through a project adapter/capability.
- Persist durable bucket/key metadata, not expiring signed URLs as identity.
- Private media requires server authorization before signed/authorized delivery.
- Possession of a URL does not replace authorization.

## 15. Upload validation
Validate expected MIME/type, size, supported media format, and extension/type consistency where practical.
Do not trust browser-provided filename or MIME alone.
Temporary crawler assets are not automatically user-accessible.

## 16. Content import security
Crawler output is untrusted and cannot write directly to core tables.
```text
crawler
→ raw data
→ normalizer
→ validator
→ import process
→ database/storage
```
Reject malformed content. Never execute scripts/code embedded in imported material.

## 17. Rich/HTML content
Prefer structured JSON rendering.
If imported HTML-like markup is needed, sanitize before rendering.
Avoid `dangerouslySetInnerHTML` unless sanitized and justified.

## 18. Password handling
Do not log, duplicate, or store password copies in product profile/domain tables.
Password changes must follow Better Auth's authenticated flow and credential contract.

## 19. Abuse-sensitive endpoints
Design these so rate limiting can be added when needed:
```text
login
registration
invite-code attempts
uploads
admin actions
future AI evaluation requests
```
Do not add distributed rate-limit infrastructure prematurely.

## 20. Scheduler security
```text
Vercel Cron
→ protected scheduler trigger
→ Assignment Scheduler service
```
Verify trigger authenticity using the deployment-supported mechanism. Job logic still enforces invariants/idempotency. Do not expose a freely invokable scheduler endpoint.

## 21. XP / reward integrity
XP is calculated on the server from authoritative state.
Never accept a final XP amount from the browser.
Use durable uniqueness/idempotency to prevent duplicate rewards after retry.
Leaderboard data derives from authoritative XP history.

## 22. Time integrity
The server is authoritative for assignment business date, deadline, late state, streak boundaries, and quarter boundaries.
Persist timezone as an IANA identifier and absolute instants as timezone-aware timestamps.
Client clocks are never protected business truth.

## 23. Logging privacy
Logs may include operational IDs such as request/user/group/submission/job IDs when useful.
Do not log full essays, full answer payloads by default, passwords, session tokens, secrets, or private keys.
Temporary sensitive debug logging must be minimized and removed after use.

## 24. Admin monitoring
Admin pages require explicit admin authorization.
Expose only operational detail needed for diagnosis; never expose raw credentials/secrets.
Do not let admin UI become an undocumented bypass around normal privacy rules.

## 25. AI data minimization
The AI subsystem receives only data needed for Writing evaluation:
```text
submission ID
task type
prompt
essay
evaluation/version metadata
```
Do not send passwords, session tokens, group roles, XP history, detailed progress history, or unrelated profile data.

## 26. AI output validation
AI output is untrusted external-subsystem input.
Before persistence validate contract shape, required fields, score ranges, and model/evaluation version metadata.
Invalid/partial output becomes evaluation failure, not a successful result.
AI results are estimates, not official IELTS results.

## 27. AI failure isolation
Invariant:
```text
AI failure != Writing submission failure
```
Writing submission commits independently. AI timeouts/service errors must not roll back or invalidate the Submission. Retries target evaluation work only.

## 28. Dependency security
Prefer current stack capabilities. Avoid abandoned security-sensitive dependencies and duplicate auth/validation/storage stacks.
Review maintenance, security, and breaking changes before major dependency upgrades.

## 29. Environment separation
Development, test, and production should use separate resources/credentials where practical.
Automated tests must never run against production data.
Fixtures must not contain real credentials or private user data.

## 30. Data lifecycle
Logical deletion/archival must remove active access or future scheduling while preserving required history.
Destructive operations require explicit authorization and should not silently break historical integrity.

## 31. Security review triggers
Perform focused review for changes to authentication, authorization, roles, Submission access, private-result visibility, uploads/storage, scheduler triggers, admin pages, AI transport, secret handling, or any external-data boundary.

## 32. Security checklist
```text
[ ] Session resolved server-side.
[ ] Resource authorization enforced server-side.
[ ] Client identity/role not trusted.
[ ] Input runtime-validated.
[ ] DB constraints/transactions protect integrity.
[ ] Private academic data not exposed.
[ ] Media access authorized where required.
[ ] Secrets not logged/committed.
[ ] Retryable protected effects cannot duplicate.
[ ] Time-sensitive rules are server-authoritative.
[ ] External/AI output validated before persistence.
```

## 33. Prohibited patterns
```text
Authorize only by hiding UI.
Trust user_id/role from browser.
Expose application tables directly to browser code.
Store plaintext credentials.
Commit secrets.
Store expiring signed URLs as durable identity.
Render unsanitized imported HTML.
Let crawler write directly to core tables.
Let AI output bypass validation.
Let AI failure invalidate Writing.
Use client time as deadline/XP/streak truth.
```
