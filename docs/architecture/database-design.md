# AIELTS Together — Database Design
## 1. Purpose
This document defines the logical database design for AIELTS Together. It is the source of truth for persistent domain entities, relationships, cardinality, constraints, indexes, JSON usage, lifecycle, and AI Writing persistence.
It does not define frontend structure, API routes, deployment topology, AI model internals, training hyperparameters, or concrete migration commands.
---
## 2. Design Goals
The database should provide:
- Clear data ownership.
- Strong referential integrity.
- Simple MVP queries.
- Predictable scheduler behavior.
- Preservation of learning history.
- Compatibility with later AI Writing evaluation.
- Minimal duplication of authoritative data.
Core relational domains:
```text
User Group Goal StudyPlan Assignment ContentItem Submission Progress XP Notification AIEvaluation
```
---

## 4. Database Technology Baseline

The persistence baseline is:

```text
Database product          → PostgreSQL
Managed provider          → Supabase PostgreSQL
Application data access   → Drizzle ORM
Schema definition         → Drizzle schema in application code
Migration tooling         → Drizzle Kit
Migration artifacts       → Version-controlled SQL
Variable JSON structures  → PostgreSQL jsonb by default
```

This document remains the logical source of truth for persistent data design.

Drizzle-specific schema syntax, generated migration SQL, connection configuration, and concrete migration commands belong in implementation code and migration workflows rather than this document.

Supabase is the initial PostgreSQL provider; application domain code must not depend on direct browser access to Supabase tables.

---
## 5. Database Principles
### 3.1 Relational core
Business entities, ownership, lifecycle, and authorization relationships should be relational.
### 3.2 JSON only for variable structures
Approved examples:
```text
content_json answer_key_json answer_data payload_json feedback_json
```
Do not hide IDs, status, sequence numbers, deadlines, XP amounts, model versions, or frequently filtered fields inside JSON.
### 3.3 Preserve history
Prefer `DISABLED`, `ARCHIVED`, status changes, or anonymization over destructive deletion for learning history.
### 3.4 Explicit foreign keys
Important relationships should be database-enforced where practical.
### 3.5 Recomputable summaries
Cached totals are allowed, but authoritative history should remain available where practical.
---
## 5. High-Level Domain Model
```text
AuthUser
 ├─ UserProfile
 ├─ GroupMembership ── Group
 │                     ├─ Goal ── StudyPlan
 │                     ├─ Assignment ── ContentItem
 │                     ├─ GroupContentCursor
 │                     └─ TeamActivity
 ├─ Submission ──────── Assignment
 ├─ StudySession
 ├─ XPTransaction
 ├─ BadgeAward
 ├─ Notification
 └─ AIEvaluation via Submission
```
Core product flow:
```text
Group → Goal → Study Plan → Assignment → Submission → Progress / XP
```
---
# Part I — Identity and User Domain
## 6. Authentication Persistence Boundary

Authentication-specific persistence is owned by Better Auth through the configured database adapter.

Conceptually:

```text
Authentication persistence
├── Auth User
├── Account / Credential
├── Session
└── Verification metadata when required
```

AIELTS product/domain persistence depends on the stable authenticated user identifier but does not define the internal password or session representation itself.

Core rules:

- Authentication credentials are never stored in plaintext.
- Password hashing and credential representation are owned by the authentication library.
- Session persistence is owned by the authentication library.
- The authenticated user ID remains stable because product entities reference it.
- Email and username uniqueness must satisfy the configured authentication contract.
- Registration requires email, username, and password.
- Login accepts email or username with password.
- Exact Better Auth table shape is library/adapter-owned and should not be duplicated here as a manually maintained schema contract.

Conceptual relationship:

```text
Better Auth
├── auth user
├── account / credential
└── session

auth user.id
    ↓
AIELTS domain tables
```

---
## 7. User Profile---
## 7. User Profile
```text
user_profiles( user_id, display_name, avatar_url, current_band, target_band, expected_exam_date,
weekly_study_hours_goal, language, timezone, total_xp, current_streak, created_at, updated_at )
```
Relationship:
```text
AuthUser 1 ─── 1 UserProfile
```
Supported languages:
```text
vi en
```
Initial timezone default:
```text
Asia/Bangkok
```
`user_profiles.user_id` references the authenticated user identifier managed by Better Auth.

`total_xp` and `current_streak` may be cached. XP history remains authoritative in `xp_transactions`.
---
# Part II — Group Domain
## 8. Group
```text
groups( id, name, description, owner_user_id, invite_code, status, created_at, updated_at )
```
Status:
```text
ACTIVE ARCHIVED DELETED
```
Constraints:
- Every active group has one owner.
- Active invite code is unique.
- Owner must be an active member.
---
## 9. Group Membership
```text
group_memberships( id, group_id, user_id, role, joined_at, status, updated_at )
```
Role:
```text
OWNER ADMIN MEMBER
```
Status:
```text
ACTIVE LEFT REMOVED
```
Recommended uniqueness:
```text
UNIQUE(group_id, user_id)
```
---
## 10. Group Settings
```text
group_settings( group_id, allow_member_invites, allow_late_submission, leaderboard_enabled, team_activity_enabled, created_at, updated_at )
```
Relationship:
```text
Group 1 ─── 1 GroupSettings
```
Not included:
- Custom XP rules.
- Advanced result privacy rules.
- Chat configuration.
---
# Part III — Goal and Planning Domain
## 11. Goal
```text
goals( id, group_id, target_band, start_date, end_date, status, created_by_user_id, created_at, updated_at )
```
Status:
```text
ACTIVE COMPLETED CANCELLED
```
Constraint:
```text
At most one ACTIVE goal per group
```
---
## 12. Study Plan
```text
study_plans( id, goal_id, group_id, schedule_type, timezone, status, created_by_user_id, created_at, updated_at )
```
Schedule type:
```text
DAILY WEEKLY
```
Status:
```text
ACTIVE PAUSED COMPLETED CANCELLED
```
MVP relationship:
```text
Goal 1 ─── 1 active StudyPlan
```
---
## 13. Study Plan Item
```text
study_plan_items( id, study_plan_id, weekday, skill, task_type, quantity, sort_order, created_at, updated_at )
```
For `WEEKLY`, `weekday` is one of:
```text
MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY
```
For `DAILY`, `weekday` may be null.
Skill:
```text
READING LISTENING WRITING
```
Task type:
```text
READING LISTENING WRITING_TASK_1 WRITING_TASK_2
```
Default `quantity` is `1`.
Complex recurrence is outside the current scope.
---
## 14. Group Content Cursor
Each group has independent sequential progression.
```text
group_content_cursors( id, group_id, skill, task_type, next_sequence_number, created_at, updated_at )
```
Uniqueness:
```text
UNIQUE(group_id, skill, task_type)
```
Example:
```text
Group A Reading next      = 12 Listening next    = 8 Writing Task 1    = 15 Writing Task 2    = 9
```
---
# Part IV — Question Bank Domain
## 15. Content Item
```text
content_items( id, skill, task_type, sequence_number, title, content_json, answer_key_json,
source_url, source_name, status, created_at, updated_at )
```
Status:
```text
ACTIVE DISABLED
```
Recommended uniqueness:
```text
UNIQUE(skill, task_type, sequence_number)
```
Source metadata remains internal for duplicate detection, crawler debugging, correction, and verification.
---
## 16. Content JSON
Examples:
```json
{"passage":"...","questions":[]}
```
```json
{"questions":[],"transcript":"..."}
```
```json
{"prompt":"...","imageUrl":"..."}
```
```json
{"prompt":"..."}
```
The MVP should not force Reading, Listening, and Writing into one rigid relational question schema.
---
## 17. Answer Key
`answer_key_json` is used primarily for Reading and Listening.
Writing does not require an answer key, so the field may be null.
---
## 18. Media Assets

Large media binaries remain outside PostgreSQL and are stored in Supabase Storage.

The durable database identity of a stored object should be based on provider-independent storage metadata rather than an expiring signed URL.

If content requires dedicated media metadata, use:

```text
media_assets(
  id,
  content_id,
  media_type,
  storage_provider,
  bucket,
  storage_key,
  duration_seconds,
  file_size_bytes,
  codec,
  mime_type,
  created_at,
  updated_at
)
```

Initial provider:

```text
storage_provider = SUPABASE
```

Rules:

- `storage_key` and bucket/namespace identify the durable stored object.
- Do not store short-lived signed URLs as authoritative persistent data.
- Signed URLs are generated at runtime after authorization when private media is requested.
- Public URLs may be derived when an asset is intentionally public, but the durable storage identity remains the storage location metadata.
- The application should access storage through a storage capability/adapter rather than coupling domain logic directly to Supabase APIs.

This table remains optional in the earliest MVP when simple content-level storage references are sufficient.

---
# Part V — Assignment Domain---
# Part V — Assignment Domain
## 19. Assignment
```text
assignments( id, group_id, study_plan_id, study_plan_item_id, content_id, skill, task_type, assigned_at,
due_at, status, generated_by, created_by_user_id, created_at, updated_at )
```
Generated by:
```text
AUTO ADMIN
```
Status:
```text
SCHEDULED ACTIVE CLOSED ARCHIVED
```
Product constraint:
```text
One Assignment → one whole Group
```
Selected-member assignments are not supported.
---
## 20. Assignment Member State
```text
assignment_member_states( id, assignment_id, user_id, status, started_at, completed_at, created_at, updated_at )
```
Status:
```text
NOT_STARTED IN_PROGRESS SUBMITTED LATE MISSED
```
Uniqueness:
```text
UNIQUE(assignment_id, user_id)
```
This table supports group completion views without exposing detailed academic results.
---
# Part VI — Submission Domain
## 21. Submission
```text
submissions( id, user_id, content_id, assignment_id nullable, skill, task_type, status, answer_data, score
nullable, band_estimate nullable, started_at, last_activity_at, submitted_at, graded_at, created_at,
updated_at )
```
Context:
```text
assignment_id IS NOT NULL → group assignment assignment_id IS NULL     → individual practice
```
Core status:
```text
DRAFT SUBMITTED GRADED LATE
```
AI state should live in `ai_evaluations`, not in the core Submission lifecycle.
---
## 22. Answer Data
Reading / Listening example:
```json
{"answers":{"1":"TRUE","2":"B","3":"environment"}}
```
Writing example:
```json
{"text":"..."}
```
Draft state may also be preserved in `answer_data`.
---
## 23. Automatic Score
`score` is mainly used for Reading and Listening.
The MVP may store number-correct or a simple normalized score.
Any band conversion must be described as a reference, not an official IELTS result.
---
## 24. Writing Data
Writing reuses `submissions`.
Writing-specific data includes:
```text
task_type answer_data.text
```
`word_count` may become a dedicated column if frequently queried.
Writing remains valid without AI.
---
# Part VII — Progress and Study Time
## 25. Study Session
```text
study_sessions( id, user_id, submission_id nullable, assignment_id nullable, skill, started_at,
last_activity_at, ended_at, active_seconds, created_at, updated_at )
```
Supports:
- Personal study-time reports.
- Time by skill.
- Weekly totals.
- Session debugging.
Writing may stop accumulating time after inactivity. Exact heartbeat implementation belongs outside this file.
---
## 26. Progress Aggregates
Progress should initially be derived from:
```text
assignments assignment_member_states submissions study_sessions xp_transactions
```
Avoid aggregate tables until query cost justifies them.
---
# Part VIII — Gamification Domain
## 27. XP Transaction
```text
xp_transactions( id, user_id, group_id nullable, amount, reason, reference_type, reference_id, quarter_key, earned_at, created_at )
```
Example reasons:
```text
READING_COMPLETED LISTENING_COMPLETED WRITING_TASK_1_SUBMITTED WRITING_TASK_2_SUBMITTED ON_TIME_BONUS STREAK_7_DAY STREAK_30_DAY BADGE_REWARD
```
Only XP associated with a group contributes to that group's leaderboard.
---
## 28. Quarter Key
Format:
```text
2026-Q1 2026-Q2 2026-Q3 2026-Q4
```
Keep both `quarter_key` and `earned_at`.
---
## 29. Badge
```text
badges( id, code, name, description, status, created_at )
```
Examples:
```text
FIRST_ASSIGNMENT STREAK_7 STREAK_30 FIRST_READING FIRST_LISTENING FIRST_WRITING PERFECT_WEEK QUARTER_FINISHER
```
---
## 30. Badge Award
```text
badge_awards( id, badge_id, user_id, group_id nullable, awarded_at, created_at )
```
One-time badge types should be protected against duplicate awards.
---
## 31. Streak State
Current streak may be cached in `user_profiles`.
A full streak-history table is not required initially.
---
# Part IX — Leaderboard and Team Activity
## 32. Quarterly Leaderboard
The leaderboard should initially be derived from `xp_transactions`.
Conceptual query:
```text
SUM(amount) GROUP BY user_id WHERE group_id = ? AND quarter_key = ?
```
A permanent leaderboard table is unnecessary for the MVP.
---
## 33. Team Activity
```text
team_activities( id, group_id, actor_user_id, type, reference_type, reference_id, payload_json, created_at, archived_at )
```
Types:
```text
ASSIGNMENT_COMPLETED STREAK_REACHED BADGE_EARNED RANK_CHANGED GROUP_MILESTONE ASSIGNMENT_CREATED
```
Activity payload must not expose private academic details.
---
## 34. Activity Reaction
```text
activity_reactions( id, activity_id, user_id, reaction_type, created_at )
```
Allowed reactions:
```text
CONGRATS GREAT_JOB KEEP_GOING KEEP_STREAK ALMOST_THERE LETS_GO
```
Recommended uniqueness:
```text
UNIQUE(activity_id, user_id, reaction_type)
```
Free-form reaction text is not supported.
---
# Part X — Notification Domain
## 35. Notification
```text
notifications( id, user_id, type, payload_json, read_at, created_at, expires_at )
```
Types may include:
```text
ASSIGNMENT_CREATED DEADLINE_APPROACHING ASSIGNMENT_OVERDUE XP_EARNED BADGE_EARNED REACTION_RECEIVED
GROUP_MILESTONE CONTENT_EXHAUSTED AI_GRADING_COMPLETED AI_GRADING_FAILED
```
MVP delivery:
```text
IN_WEB
```
---
# Part XI — AI Persistence Boundary
## 36. AI Evaluation
AI Writing evaluation is separate from Submission.
```text
ai_evaluations( id, submission_id, status, model_name, model_version, evaluation_version, overall_band,
task_response, coherence_cohesion, lexical_resource, grammatical_range_accuracy, feedback_json, error_code,
error_message, requested_at, started_at, completed_at, created_at, updated_at )
```
Relationship:
```text
Submission 1 ─── N AIEvaluation
```
Multiple rows support retry, model upgrades, and historical traceability.
---
## 37. AI Evaluation Status
```text
PENDING RUNNING COMPLETED FAILED CANCELLED
```
Invariant:
```text
AI failure != Submission failure
```
---
## 38. AI Result Versioning
Persist:
```text
model_name model_version evaluation_version completed_at
```
Historical results remain interpretable after model changes.
---
## 39. AI Feedback
`feedback_json` may evolve over time.
Example:
```json
{
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "criterionFeedback": {}
}
```
Frequently filtered criterion scores remain dedicated columns.
---
# Part XII — Import and Operations
## 40. Content Import
Crawler output must not write directly into `content_items`.
Recommended persistence:
```text
content_import_batches( id, source_name, source_reference, status, total_items, successful_items,
failed_items, started_at, completed_at, created_at ) content_import_errors( id, batch_id,
source_item_reference, error_code, message, payload_json, created_at )
```
Batch status:
```text
PENDING RUNNING COMPLETED PARTIAL FAILED
```
Typical errors include missing passage, missing answers, duplicate sequence, invalid schema, missing media, and duplicate source URL.
---
## 41. System Job Tracking
Minimal operational tracking:
```text
system_jobs( id, type, status, started_at, completed_at, error_message, metadata_json, created_at )
```
Types may include:
```text
ASSIGNMENT_SCHEDULER CONTENT_IMPORT AI_EVALUATION
```
This does not replace a real job queue.
---
# Part XIII — Indexing Strategy
## 42. Recommended Indexes
Indexes should follow real access patterns: joins, dashboards, scheduler queries, status/deadline filters, and sequential content lookup.
```text
authentication identity indexes → Better Auth schema / adapter contract
group_memberships(group_id), group_memberships(user_id), group_memberships(group_id, status)
goals(group_id, status), study_plans(group_id, status), study_plan_items(study_plan_id)
group_content_cursors(group_id, skill, task_type)
content_items(skill, task_type, status), content_items(skill, task_type, sequence_number), content_items(source_url)
assignments(group_id, status), assignments(group_id, due_at), assignments(due_at, status)
assignment_member_states(user_id, status), assignment_member_states(assignment_id, user_id)
submissions(user_id, created_at), submissions(user_id, skill, submitted_at), submissions(assignment_id)
study_sessions(user_id, started_at), study_sessions(user_id, skill, started_at)
xp_transactions(user_id, earned_at), xp_transactions(group_id, quarter_key, earned_at)
notifications(user_id, read_at, created_at), team_activities(group_id, created_at)
ai_evaluations(submission_id), ai_evaluations(status, requested_at), ai_evaluations(model_version)
```
Potential `UNIQUE(user_id, assignment_id)` should only be enforced if one submission per assignment is confirmed.
# Part XIV — Constraints and Integrity
## 44. Core Uniqueness
Recommended:
```text
authentication identity uniqueness → Better Auth schema / adapter contract
group_memberships(group_id, user_id) group_content_cursors(group_id, skill, task_type)
content_items(skill, task_type, sequence_number) assignment_member_states(assignment_id, user_id)
```
---
## 45. Group Ownership Integrity
A group owner must be an active member.
Ownership transfer should update both:
```text
groups.owner_user_id group_memberships.role
```
in one transaction.
---
## 46. Assignment Membership Integrity
Assignments apply to all active group members at creation time.
Whether users joining later receive old assignments is intentionally deferred and must be decided consistently before implementation.
---
## 47. Submission Integrity
A Submission belongs to:
```text
one User one ContentItem zero or one Assignment
```
If `assignment_id` exists:
- Assignment content must match `content_id`.
- User must belong to the assignment group.
- Skill and task type must remain consistent.
These require service validation in addition to foreign keys.
---
## 48. Content Exhaustion Integrity
When no ACTIVE content exists at the next sequence:
- Do not loop.
- Do not silently reset cursor.
- Do not create invalid Assignment.
- Record an operational error.
Assignment creation and cursor advancement should be transactional.
---
# Part XV — Transaction Boundaries
## 49. Assignment Generation
Conceptual transaction:
```text
Read cursor
→ Find next content
→ Create assignment
→ Create member states
→ Advance cursor
→ Commit
```
Failure must roll back cursor and assignment changes together.
---
## 50. Submission Completion
Conceptual transaction:
```text
Persist submission
→ Update member state
→ Award eligible XP
→ Create activity / notification
→ Commit
```
Retryable operations should be idempotent.
---
## 51. XP Idempotency
Prefer source references:
```text
reference_type = SUBMISSION reference_id   = <submission_id> reason         = WRITING_TASK_2_SUBMITTED
```
A uniqueness constraint may prevent duplicate XP awards.
---
# Part XVI — Data Lifecycle
## 52. Lifecycle Rules
- Auth user: authentication lifecycle is coordinated with Better Auth-managed identity persistence; product deletion/anonymization rules belong in `security.md` and must preserve required historical integrity.
- Group: logical deletion disables future scheduling but retains historical assignments, submissions, XP, and AI results.
- Content: broken content normally becomes `DISABLED` instead of being deleted.
- Submission: drafts are mutable; submitted work is historical learning data and should not normally be destructively rewritten.
- XP: transactions are append-oriented; quarter boundaries do not delete historical XP.
- AI Evaluation: create new evaluation rows for new model runs when traceability matters.
# Part XVII — JSON and Privacy Rules
## 58. JSON Boundaries
Approved JSON fields: `content_items.content_json`, `content_items.answer_key_json`, `submissions.answer_data`, `notifications.payload_json`, `team_activities.payload_json`, `ai_evaluations.feedback_json`, `content_import_errors.payload_json`, and `system_jobs.metadata_json`.

Under the PostgreSQL baseline, these fields use `jsonb` by default.
Keep IDs, status, skill, task type, sequence number, deadline, XP amount, quarter key, AI status, and model version as normal columns.
## 59. Visibility Boundary
Group-visible data: display name, avatar, XP, streak, assignment completion state, completion rate, and quarterly rank.
Private academic data: detailed Reading/Listening scores, Writing text, Writing band estimate, AI criterion scores, detailed study-time history, and detailed progress reports.
Database and API authorization must preserve this boundary.
# Part XIX — Migration Principles
## 62. Migration Strategy

Schema changes must be version controlled, reviewable, reproducible, and tested.

Baseline tooling:

```text
Schema definition
→ Drizzle schema

Migration generation
→ Drizzle Kit

Migration artifact
→ version-controlled SQL

Normal lifecycle
→ change schema
→ generate migration
→ inspect SQL
→ test migration
→ apply migration
```

Prefer additive evolution:

```text
add nullable field
→ deploy compatible code
→ backfill
→ tighten constraint
→ remove obsolete field later
```

Production schema changes must use committed migrations. Direct schema push is not the normal production migration path.

Exact migration commands, local database workflow, rollback checks, and CI execution belong in the database migration skill/workflow.
# Part XX — Initial Entity Inventory
## 63. MVP 1 Tables
```text
Better Auth-managed authentication tables
user_profiles groups group_memberships group_settings goals study_plans study_plan_items
group_content_cursors content_items assignments assignment_member_states submissions study_sessions
xp_transactions badges badge_awards notifications content_import_batches content_import_errors system_jobs
```
## 64. MVP 2 Additions
Likely additions:
```text
team_activities activity_reactions media_assets
```
Reading and Listening reuse the same core content, assignment, submission, and study-session structures.
## 65. MVP 3 Addition
```text
ai_evaluations
```
A dedicated AI model registry is not required initially.
---
# Part XXI — ERD Summary
## 66. Logical ERD
```text
AuthUser
├─ 1 UserProfile
├─ N GroupMembership ── N Group
├─ N Submission
├─ N StudySession
├─ N XPTransaction
├─ N BadgeAward
└─ N Notification

Group
├─ N GroupMembership
├─ 1 GroupSettings
├─ N Goal
├─ N StudyPlan
├─ N GroupContentCursor
├─ N Assignment
└─ N TeamActivity

Goal ── 1 active StudyPlan
StudyPlan ── N StudyPlanItem
StudyPlan ── N Assignment
ContentItem ── N Assignment
ContentItem ── N Submission
Assignment ── N AssignmentMemberState
Assignment ── N Submission
Submission ── N AIEvaluation
```
## 67. Authoritative Data by Concern
```text
Authentication         → Better Auth-managed auth tables
Product user profile     → user_profiles
Membership / roles    → group_memberships
Group objective       → goals
Recurring schedule    → study_plans + study_plan_items
Content progression   → group_content_cursors
Learning content      → content_items
Assigned work         → assignments
Member completion     → assignment_member_states
User work             → submissions
Study time            → study_sessions
XP history            → xp_transactions
Badges                → badges + badge_awards
Notifications         → notifications
Team events           → team_activities + activity_reactions
AI Writing results    → ai_evaluations
```
---
# 68. Decisions Intentionally Deferred

Do not over-specify these before implementation evidence exists:

- Exact Drizzle schema file organization.
- Exact migration naming convention.
- Exact PostgreSQL enum-vs-check-constraint choices when both remain reasonable.
- Exact ID-generation strategy where not required by domain behavior.
- Connection-pool configuration.
- Partitioning.
- Sharding.
- Read replicas.
- Materialized leaderboard tables.
- Analytics warehouse.
- Event sourcing.
- Vector database.
- Dedicated AI model registry.

These are unnecessary for the current project scale or should be chosen from implementation evidence.
---
# 69. Documentation Boundaries
This document answers:
> How is AIELTS Together data structured, related, constrained, indexed, and retained?
Related documentation:
```text
Product identity and scope
→ ../product/project-overview.md

Detailed module behavior
→ ../product/modules.md

Development sequence
→ ../product/roadmap.md

Overall system architecture
→ ./system-design.md

AI model and serving architecture
→ ./ai-architecture.md

Database migration workflow
→ ../../.agents/skills/database-migration/SKILL.md
```
Boundary rule:
```text
system-design.md   = component boundaries, runtime topology, and technology baseline
database-design.md = PostgreSQL persistent data model, ownership, integrity, and migration principles
ai-architecture.md = AI lifecycle, training, serving, and model boundary
```
