# AIELTS Together — Testing Rules

## 1. Purpose
This document defines how AIELTS Together verifies product behavior, architecture invariants, privacy, persistence, and retry safety.
Baseline:
```text
Unit/service      → Vitest
React components  → React Testing Library + Vitest
End-to-end        → Playwright
Database tests    → PostgreSQL
```

## 2. Principles
1. Test behavior, not implementation trivia.
2. Highest-risk rules receive strongest coverage.
3. Use real PostgreSQL behavior when persistence semantics matter.
4. Negative/failure paths are required for important workflows.
5. Prefer a small set of high-value E2E tests over exhaustive browser tests.

## 3. Test layers
```text
Pure domain/unit
→ application service
→ PostgreSQL integration
→ React component
→ end-to-end
```
Choose the lowest layer that proves the behavior correctly.

## 4. Unit tests
Use for deterministic logic such as:
- Schedule interpretation.
- Late status.
- Quarter key.
- XP calculation.
- State transition validation.
- Content sequence selection.
- Normalization/mapping.
Avoid mocking pure functions unnecessarily.

## 5. Service tests
Use for application use cases such as:
```text
createGroup
updateStudyPlan
generateScheduledAssignments
submitWork
awardXP
requestWritingEvaluation
```
Verify preconditions, authorization outcome, state changes, side effects, and failure handling.

## 6. PostgreSQL integration tests
Use real PostgreSQL for:
- Unique membership/constraint behavior.
- One-active-goal rules if DB-enforced.
- Cursor uniqueness.
- Assignment/member-state integrity.
- XP idempotency.
- Transaction rollback.
- `jsonb` persistence behavior when relevant.
- AI evaluation versioned persistence.
Do not use SQLite as a substitute for PostgreSQL-specific behavior.

## 7. Component tests
Use RTL to test what users observe:
- Form errors.
- Enabled/disabled states.
- Answer interaction.
- Editor word count.
- Submission confirmation.
- Accessible labels/focus.
- Permission-driven UI from already-authorized server data.
Do not make Tailwind class strings the main assertion unless they encode required behavior.

## 8. E2E scope
MVP 1 critical journey:
```text
register/login
→ create or join group
→ create goal/study plan
→ generate/open assignment
→ submit Writing
→ update completion/XP
```
MVP 2 adds representative Reading/Listening and leaderboard/team flows.
MVP 3 adds the AI evaluation result flow.
Do not duplicate every service edge case in Playwright.

## 9. Authentication tests
Cover:
- Registration with email + username + password.
- Login by email.
- Login by username.
- Invalid credentials.
- Protected access without session.
- Logout behavior.
Test project integration, not Better Auth internals.

## 10. Authorization tests
Every protected domain needs negative tests.
Examples:
- Non-member cannot access group Assignment.
- Member cannot perform admin/owner actions.
- User cannot read another user's private Submission.
- Group member cannot read another user's detailed scores/Writing.
- Client-provided role/user ID cannot escalate access.
For each important positive permission path, include at least one forbidden path.

## 11. Group and planning tests
Cover:
- Group create/join.
- Membership uniqueness.
- Role constraints.
- Ownership transfer transaction.
- At most one active Goal.
- DAILY behavior.
- WEEKLY weekday behavior.
- Unsupported recurrence rejection.

## 12. Scheduler tests
Scheduler is high priority.
### Normal generation
```text
active plan
→ correct next content
→ one Assignment
→ member states created
→ cursor advances
→ notification created
```
### Retry
```text
run twice
→ no duplicate Assignment
→ cursor advances once
```
### Exhaustion
```text
next sequence missing
→ no Assignment
→ cursor unchanged
→ operational error recorded
```
### Transaction failure
```text
assignment insert fails
→ cursor does not advance
```
### Time
Use explicit timezone-aware test input rather than machine-local time.

## 13. Question Bank / import tests
Reject:
- Missing passage/questions/answers.
- Duplicate sequence.
- Invalid question type.
- Missing required media.
- Invalid JSON shape.
- Question/answer mismatch.
Crawler extraction tests remain separate from normalized import persistence tests.

## 14. Submission tests
Cover:
- Create/resume draft.
- Auto-save.
- Submit.
- Late submission.
- Individual practice (`assignment_id == null`).
- Group assignment (`assignment_id != null`).
- Assignment/content mismatch.
- Non-member rejection.
- Retry without duplicate reward.
Submitted historical work must not be silently overwritten by later draft operations.

## 15. Reading / Listening grading tests
For supported answer types, cover correct, incorrect, empty, normalization rules when applicable, number-correct calculation, and reference-band conversion.
Listening should also test protected media access where relevant.

## 16. Writing tests
Writing must pass without AI enabled.
Verify:
- Prompt opens.
- Draft saves/resumes.
- Word count updates.
- Submission succeeds without AI.
- User can review own history.
- Other users cannot access private Writing content.

## 17. XP / gamification tests
Cover:
- Correct reward amount.
- On-time bonus.
- Duplicate prevention after retry.
- Group-specific leaderboard contribution.
- Historical XP across quarter changes.
- One-time badge duplicate prevention.
Verify authoritative XP transactions, not only cached totals.

## 18. Privacy tests
Group-facing APIs/pages must not expose:
```text
detailed Reading scores
detailed Listening scores
Writing text
Writing band / AI criterion scores
detailed study time
detailed private progress
```
Test response payloads, not only hidden UI.

## 19. Notification tests
High-value events:
- Assignment created.
- Content exhausted.
- XP earned.
- Badge earned.
- AI evaluation completed/failed.
Where duplicates matter, test retry/idempotency.

## 20. AI integration tests
Test the application/AI contract separately from model quality.
```text
valid result           → validated + persisted with versions
invalid result shape   → evaluation failure
AI timeout             → Submission remains valid
AI service failure     → evaluation failed, Submission unchanged
retry                   → traceable result/job behavior
```
Model-quality evaluation belongs in AI research, not normal web tests.

## 21. Migration tests
For meaningful schema changes:
- Apply migration to test PostgreSQL.
- Confirm existing representative data remains valid/readable.
- Verify new constraints.
- Run affected integration tests.
For staged migrations, test compatible intermediate states when practical.

## 22. Test data
Fixtures must be synthetic, deterministic, and small.
Do not commit real credentials, private essays, or production-derived personal data.
Create factories/builders only when repetition justifies them.

## 23. Mocking
Mock external boundaries, not core rules.
Reasonable mocks:
```text
storage provider
future AI transport
external crawler source
clock/time source
```
Do not mock PostgreSQL when the test exists to prove database correctness.

## 24. Time tests
Use explicit clocks/timestamps for:
- Same-day deadline.
- Late boundary.
- Weekday schedule.
- Streak boundary.
- Quarter transition.
- Timezone conversion.
Tests must not depend on the developer machine timezone.

## 25. Failure-path rule
Important workflows need at least one failure-path test when failure can leave contradictory state.
Examples: transaction failure, storage failure, content exhaustion, invalid import, invalid AI result, forbidden access.

## 26. Naming
Test names should describe behavior, e.g.:
```text
rejects a member attempting to update another member's role
```
not `test role update 2`.

## 27. CI verification
Conceptual pipeline:
```text
install
→ lint
→ typecheck
→ unit/service tests
→ PostgreSQL integration tests
→ build
→ selected E2E tests
```
Exact GitHub Actions YAML belongs in CI configuration.

## 28. Local verification
Run the smallest focused tests first, then broader checks.
Example:
```text
scheduler change
→ scheduler tests
→ DB integration tests
→ typecheck
→ broader test suite
```

## 29. Regression rule
Important bug fixes should add a regression test when practical, especially for authorization bypass, duplicate XP/assignment, time-boundary errors, privacy leaks, or submission corruption.

## 30. Avoid low-value testing
Do not over-test library internals, trivial getters, static class strings, framework behavior already guaranteed by Next.js/React, or exact call counts that do not represent an invariant.

## 31. Minimum expectation by change
```text
Pure domain rule               → unit test
Application service            → service test
Constraint/transaction         → PostgreSQL integration
Component interaction          → RTL
Critical cross-layer journey   → Playwright
Important bug                  → regression test
```

## 32. Definition of tested
```text
[ ] Important positive path is covered.
[ ] Important forbidden/failure path is covered.
[ ] PostgreSQL is used when DB semantics matter.
[ ] Authorization/privacy is verified server-side.
[ ] Retry/idempotency is covered when relevant.
[ ] Time behavior is deterministic when relevant.
[ ] The test would fail for the bug/behavior it protects.
[ ] Relevant CI checks pass.
```
