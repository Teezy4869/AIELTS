# AIELTS Together — Project Overview
## 1. Project Identity
**AIELTS Together** is a desktop-first web application for individual and small-group IELTS study.
The product focuses on:
- Reading.
- Listening.
- Writing.
Speaking is outside the current scope.
The application supports both individual practice and group-based learning.
AI is an important later direction, but it is limited to Writing evaluation and is not required for the core product to operate.
---
## 2. Problem Statement
IELTS learners often use separate tools for practice, planning, progress tracking, group coordination, and motivation.
For small study groups, this creates repeated manual work:
- Deciding what to study.
- Assigning exercises.
- Reminding members.
- Checking completion.
- Tracking consistency.
AIELTS Together connects these activities into one learning flow:
```text
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
Progress
```
A study plan should become actual learning activity instead of remaining a schedule that members must coordinate manually.
---
## 3. Product Vision
AIELTS Together aims to provide a structured environment where IELTS learners can study together without manually coordinating every activity.
The product should allow a group to:
1. Define a shared IELTS goal.
2. Create a recurring study plan.
3. Receive exercises according to that plan.
4. Complete Reading, Listening, or Writing activities.
5. Track completion and progress.
6. Maintain consistency through lightweight motivation features.
The central product idea is:
> **Turn a shared IELTS study plan into a continuous cycle of assignments, submissions, progress, and motivation.**
AIELTS Together is not intended to replace every IELTS learning resource. Its main role is to organize learning activity around a clear routine and make progress visible over time.
---
## 4. Target Users
Primary users:
- People studying IELTS independently.
- Small groups studying IELTS together.
- Learners who want a structured routine.
- Learners who want to track consistency and progress.
Group roles:
- Owner.
- Admin.
- Member.
Owners and admins manage the shared learning structure. Members follow the plan, receive assignments, complete activities, and track progress.
The application is not designed around large classes, institutional LMS workflows, or teacher-led course management.
---
## 5. Core Product Experience
The main group-learning flow is:
```text
Create or join a group
        ↓
Define a shared goal
        ↓
Create a study plan
        ↓
System generates assignments
        ↓
Members complete activities
        ↓
Submissions are recorded
        ↓
Progress and XP are updated
```
Users may also practice supported IELTS content individually.
The product therefore supports two complementary modes:
```text
Individual practice
Group-based study
```
Both modes use the same learning content while submissions and progress preserve the relevant context.
---
## 6. Product Principles
### Desktop first
The primary experience is designed for desktop use, especially Reading, Listening, Writing, planning, and progress tracking.
### Simple scheduling
Study Plans support Daily and Weekly schedules. Complex recurrence is outside the current scope.
### Shared group assignments
Assignments generated from a group Study Plan apply to the whole group. Personalized member schedules are not supported.
### Predictable content progression
Learning content is consumed in a defined sequence. The system does not choose exercises based on ability, topic, difficulty, or previous mistakes.
### Private academic results
Group learning provides shared accountability without exposing detailed personal academic results. Progress indicators may be visible; detailed scores and Writing content remain private.
### Writing works without AI
Writing must remain fully usable before AI Writing Evaluation exists.
### Narrow AI responsibility
AI is currently limited to Writing evaluation. Expansion into other areas requires a separate product decision.
### Motivation over competition
Gamification should reward consistency, completion, and on-time participation rather than high IELTS performance.
---
## 7. High-Level Scope
### In scope
- Authentication and user profiles.
- Small study groups.
- Shared goals and Study Plans.
- Automatic and manual group assignments.
- Question Bank and submissions.
- Reading, Listening, and Writing practice.
- Personal progress tracking.
- XP, streaks, badges, and quarterly ranking.
- Lightweight Team Activity.
- In-web notifications.
- Content import and basic administration.
- File and media storage.
- AI-assisted Writing evaluation as a later capability.
### Explicitly out of scope
- Speaking.
- Peer review.
- Realtime chat.
- Private messaging.
- Free-form comments.
- Adaptive learning.
- AI-generated study plans or questions.
- AI Reading or Listening analysis.
- Complex recurring schedules.
- Individualized group assignments.
- Public detailed IELTS results.
Detailed feature boundaries belong in `modules.md`.
---
## 8. MVP Success Definition
The first meaningful product milestone is reached when this cycle works end to end:
```text
User creates a group
        ↓
Group defines a learning goal
        ↓
A Study Plan is configured
        ↓
The system creates assignments
        ↓
Members complete or submit work
        ↓
The system records progress
        ↓
XP and completion status are updated
```
The core product should be useful before advanced features such as AI Writing Evaluation are introduced.
The MVP should demonstrate that AIELTS Together can transform a shared study plan into real, trackable learning activity with minimal manual coordination.
---
## 9. Documentation Boundaries
This document defines the high-level identity, purpose, experience, scope, and product principles of AIELTS Together.
It intentionally does not define module-level implementation details or technical architecture.
```text
Detailed product modules
→ ./modules.md
Development phases and priorities
→ ./roadmap.md
Overall technical architecture
→ ../architecture/system-design.md
Database structure
→ ../architecture/database-design.md
AI system design
→ ../architecture/ai-architecture.md
```
When information overlaps, this file remains the source for **what the product is and why it exists**, while specialized documents define the details.
