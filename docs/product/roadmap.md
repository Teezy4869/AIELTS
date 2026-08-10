# AIELTS Together — Product Roadmap
## 1. Purpose
This document defines the development sequence of AIELTS Together.
It answers:
- What should be built first.
- Which capabilities belong to each milestone.
- What each milestone must prove.
- Which dependencies must exist before later work begins.
Detailed module behavior belongs in `modules.md`. Technical implementation belongs in architecture and engineering documentation.
---
## 2. Roadmap Principles
### Build the core product before advanced features
The first priority is to make the main learning cycle work end to end:
```text
Group → Goal → Study Plan → Assignment → Submission → Progress
```
### AI must not block the product
Writing must work without AI. AI Writing Evaluation is a later integration milestone.
### Prefer dependency order
Modules should be implemented when their dependencies are ready.
```text
Study Plan → Assignment → Scheduler
Question Bank → Submission → Skill modules
```
### Keep the first release narrow
The first milestone should validate the complete product loop rather than maximize feature count.
---
# 3. MVP 1 — Core Learning Platform
## Goal
Prove that AIELTS Together can convert a group learning plan into trackable learning activity.
```text
Create group
   ↓
Define goal
   ↓
Configure Study Plan
   ↓
Generate assignment
   ↓
Submit work
   ↓
Update progress and XP
```
## Included modules
- Authentication.
- User Profile.
- Group.
- Goal.
- Study Plan.
- Question Bank.
- Assignment.
- Assignment Scheduler.
- Submission.
- Writing without AI.
- Basic Progress Tracking.
- Basic Gamification.
- In-web Notification.
- Content Import Pipeline.
- Minimal Admin Monitoring.
- File & Media Storage.
## Required outcome
At the end of MVP 1:
- A user can register and log in.
- A user can create or join a group.
- A group can define a goal and Study Plan.
- The system can create group assignments.
- A member can complete or submit Writing work.
- Submission history is stored.
- Progress and XP are updated.
- In-web notifications work.
- Content can be imported and disabled when needed.
## Deferred
- Full Reading experience.
- Full Listening experience.
- Quarterly Leaderboard.
- Team Activity.
- AI Writing Evaluation.
---
# 4. MVP 2 — Reading, Listening, and Group Motivation
## Goal
Expand the platform into a complete Reading, Listening, and Writing study environment.
## Reading
- Reading player.
- Supported question types.
- Auto-save.
- Automatic grading.
- Result review.
- Reading history.
## Listening
- Listening player.
- Audio playback.
- Auto-save.
- Automatic grading.
- Transcript review when available.
- Listening history.
## Progress and group motivation
- Study time by skill.
- Reading and Listening trends.
- Improved completion statistics.
- Quarterly Leaderboard.
- Team Activity.
- Fixed reactions.
- Expanded badges and streaks.
## Required outcome
At the end of MVP 2:
- Reading works in individual and group contexts.
- Listening works in individual and group contexts.
- Reading and Listening are graded automatically.
- Study activity updates progress tracking.
- Quarterly XP ranking works.
- Team Activity provides group presence without chat.
---
# 5. MVP 3 — AI Writing Evaluation
## Goal
Add AI-assisted Writing evaluation without making Writing dependent on AI.
```text
Writing Submission
        ↓
AI Evaluation
        ↓
Estimated Band
        ↓
Structured Feedback
```
Writing submission remains valid even when AI evaluation fails.
## AI workstream
### Stage 1 — Dataset
Build and clean a dataset containing:
- Prompt and essay.
- Task type.
- Overall band.
- Four IELTS Writing criteria.
- Feedback when available.
Required work includes cleaning, deduplication, reliable labels, and train/validation/test separation.
### Stage 2 — Baseline models
Establish simple baselines for comparison, such as feature-based, TF-IDF, tree-based, or embedding-based regression.
Exact model choices belong in AI research documentation.
### Stage 3 — Deep-learning experiments
Potential directions include transformer fine-tuning, regression/classification, multi-task learning, smaller language models, and parameter-efficient fine-tuning.
### Stage 4 — Feedback generation
Evaluate structured Writing feedback. Band estimation and feedback generation may remain separate if this improves evaluation and reliability.
## Product integration
The product must:
- Store AI evaluation state.
- Handle failures cleanly.
- Allow retry.
- Display estimated band clearly.
- Display structured feedback.
- Never present AI output as an official IELTS result.
## Required outcome
At the end of MVP 3:
- Submitted Writing can be evaluated by AI.
- Results are stored separately from the submission.
- Failure does not invalidate the submission.
- Users can view AI-estimated band and feedback.
- Admin monitoring surfaces AI failures.
---
# 6. Recommended Development Order
```text
01. Authentication
02. User Profile
03. Group
04. Goal
05. Study Plan
06. Question Bank
07. Assignment
08. Assignment Scheduler
09. Submission
10. Writing
11. Progress Tracking
12. Gamification
13. Notification
14. Content Import Pipeline
15. Admin Monitoring
16. File & Media Storage
17. Reading
18. Listening
19. Quarterly Leaderboard
20. Team Activity
21. AI Dataset Work
22. AI Writing Evaluation
```
This order is based on dependency rather than user-facing importance.
---
# 7. Dependency View
## Product foundation
```text
Authentication → User Profile → Group
```
## Planning and assignment
```text
Group → Goal → Study Plan → Assignment → Assignment Scheduler
```
## Content and skills
```text
Question Bank → Assignment → Submission → Writing / Reading / Listening
```
## Progress and motivation
```text
Submission → Progress Tracking → Gamification → Leaderboard / Team Activity
```
## AI
```text
Writing → Submission → Dataset / AI Research → AI Writing Evaluation
```
---
# 8. Parallel Workstreams
## Web Product Track
```text
Auth → Group → Planning → Assignment → Submission
→ Writing → Reading → Listening → Progress → Gamification
```
## AI Research Track
```text
Dataset → Cleaning → Baseline → Fine-tuning → Evaluation → Feedback
```
The two tracks integrate only when the AI system is ready for product testing.
---
# 9. Milestone Exit Criteria
### MVP 1
```text
Create group → configure plan → generate assignment
→ submit work → update progress and XP
```
### MVP 2
Reading and Listening are usable in both individual and group contexts, and group motivation features are functional.
### MVP 3
AI Writing results can be generated, stored, displayed, retried, and monitored without making Writing dependent on AI availability.
---
# 10. Scope Change Rule
Capabilities such as Speaking, peer review, realtime chat, adaptive learning, AI-generated plans/questions, individualized group assignments, or complex scheduling require an explicit product-scope decision.
When milestone scope changes:
1. Update `modules.md`.
2. Update this roadmap.
3. Update relevant architecture documentation.
4. Record an ADR when the change is architecturally significant.
---
# 11. Documentation Boundaries
This document answers:
> When should each product capability be built, and what must each milestone achieve?
```text
Product identity and principles
→ ./project-overview.md
Detailed module behavior
→ ./modules.md
System architecture
→ ../architecture/system-design.md
Database design
→ ../architecture/database-design.md
AI implementation architecture
→ ../architecture/ai-architecture.md
```
