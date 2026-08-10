# AIELTS Together — AI Architecture
## 1. Purpose and Scope
This document defines the high-level architecture of the AI subsystem in AIELTS Together.
AI is used only for **Writing Evaluation**. Writing itself must remain fully usable without AI.
This file defines stable boundaries for data, training, inference, versioning, failure handling, and product integration.
It does not define final model choice, hyperparameters, database schema details, frontend implementation, or experiment results.
### In scope
Writing band estimation, criterion-level scoring, structured feedback, evaluation jobs, inference/versioning, retry and failure handling.
### Out of scope
Reading/Listening AI, plan/assignment/question generation, adaptive learning, recommendations, progress analysis, and gamification.
Any expansion beyond Writing Evaluation requires a separate product decision.
---
## 2. Core Architecture Invariant
The critical rule is:
```text
AI failure != Writing submission failure
```
The product flow is:
```text
Writing Prompt
      ↓
Writing Submission
      ↓
Submission Stored
      ↓
Optional AI Evaluation
      ↓
AI Result
```
A Writing submission becomes valid through the normal application workflow. AI evaluation is an additional process and must not be part of the transaction that accepts the submission.
---
## 3. System Boundary
The web application owns authentication, authorization, submission lifecycle, persistence, notifications, retries, and result display. The AI subsystem owns evaluation processing, inference, structured output, and AI-specific failures.
```text
User
 ↓
AIELTS Web Application
 ↓
Writing Submission
 ↓
Evaluation Request
 ↓
AI Service
 ↓
Versioned Model
 ↓
Structured Result
 ↓
AIELTS Web Application
```
The AI service must not own user authentication, group authorization, XP calculation, submission ownership, or product permissions.

### Technology boundary

The main product application uses:

```text
TypeScript
Next.js
PostgreSQL
```

The AI research workstream and future AI runtime are expected to use the Python ecosystem.

This is a language/runtime direction only. The final training framework, inference framework, model family, serving framework, queue technology, compute provider, and deployment provider remain experiment-driven and intentionally deferred.

Integration between the main application and AI subsystem occurs through a versioned evaluation contract rather than shared model internals.

---
## 4. AI Lifecycle
The AI lifecycle is separated into research/training and production/inference.
```text
RESEARCH / TRAINING
Dataset
  ↓
Cleaning + Preprocessing
  ↓
Training
  ↓
Evaluation
  ↓
Candidate Model
  ↓
Approved Model Artifact
```
```text
PRODUCTION / INFERENCE
Approved Model Artifact
  ↓
AI Service
  ↓
Evaluation Request
  ↓
Structured Result
```
Research artifacts do not become production dependencies automatically. Promotion must be intentional.
---
## 5. Dataset Architecture
Expected logical fields: prompt, essay, task type, overall band, Task Achievement/Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy, and feedback when available.
Dataset principles: reliable labels, consistent rubric, duplicate removal, provenance where available, Task 1/Task 2 separation when useful, and no essay leakage across splits.
Minimum split:
```text
Training
Validation
Test
```
The test set should remain isolated from routine experimentation.
---
## 6. Data Preparation Boundary
Research-time preparation may include text normalization, duplicate detection, invalid-record filtering, label validation, task-type normalization, feature extraction, and dataset splitting.
Only preprocessing required during inference should be packaged with the production AI service.
The production web application must not depend on notebooks, training scripts, or experiment-specific preprocessing.
---
## 7. Training Architecture
Training should support experimentation rather than assume one final model.
```text
Dataset
  ↓
Baseline Models
  ↓
Improved Models
  ↓
Evaluation
  ↓
Candidate Model
  ↓
Promotion Decision
```
Possible baselines include TF-IDF, engineered features, tree-based models, and sentence embeddings with regression. Advanced experiments may include transformer fine-tuning, multi-task learning, smaller language models, LoRA/QLoRA, or separate Task 1 and Task 2 models. These remain research options.
---
## 8. Model Promotion and Versioning
Production promotion requires reproducible evaluation, acceptable validation/test performance, stable inference, a known contract, and explicit versioning. Every stored result must be traceable to the model that produced it.
Minimum metadata:
```text
model_version
evaluation_version
created_at
```
Future metadata may include dataset version, rubric version, or artifact checksum.
Old results must remain attributable to their original model version after later models are deployed.
---
## 9. Inference Architecture
```text
Writing Submission
        ↓
Evaluation Request
        ↓
Evaluation Job
        ↓
AI Service
        ↓
Inference Preprocessing
        ↓
Model Inference
        ↓
Post-processing
        ↓
Structured Result
```
The exact queue, broker, runtime, and transport mechanism are intentionally deferred.
The stable requirement is that AI evaluation remains separable from the Writing submission transaction.
---
## 10. Evaluation Job Lifecycle
Recommended conceptual states:
```text
PENDING
GRADING
GRADED
GRADING_FAILED
```
Success:
```text
PENDING → GRADING → GRADED
```
Failure:
```text
PENDING → GRADING → GRADING_FAILED
```
A failed evaluation never invalidates the original Writing submission.
Retry may be triggered by a temporary service failure, timeout, unavailable model service, transient infrastructure error, or administrator action.
Retry targets the evaluation job and must not create duplicate submissions.
Repeated failures should be visible through Admin Monitoring.
---
## 11. Input Contract
The AI service should receive only data required for Writing evaluation.
Conceptual input:
```json
{
  "submissionId": "...",
  "taskType": "TASK_2",
  "prompt": "...",
  "essay": "...",
  "requestedEvaluationVersion": "..."
}
```
The service should not require unrelated user-profile, group, XP, leaderboard, or progress data.
The exact contract may evolve but should be versioned when compatibility can change.
---
## 12. Output Contract
AI output should be structured rather than returned only as free-form text.
Conceptual result:
```json
{
  "overallBand": 6.0,
  "taskResponse": 6.0,
  "coherenceCohesion": 6.0,
  "lexicalResource": 5.5,
  "grammar": 5.5,
  "feedback": []
}
```
For Academic Task 1, Task Achievement may replace Task Response.
The web product should depend on this stable contract, not on model internals.

The main application must validate AI output against the expected evaluation contract before accepting it as a successful result or persisting product-visible fields.

AI subsystem output is therefore treated as external subsystem input at the application boundary rather than as implicitly trusted data.

---
## 13. Result Semantics
User-facing wording must identify results as estimates:
```text
AI-estimated band
Band ước tính từ AI
```
AI output must not be presented as an official IELTS score, certified examiner result, or guaranteed exam prediction.
Band estimation and feedback generation may be separate:
```text
Essay
 ├── Band Estimation
 └── Feedback Generation
```
or unified:
```text
Essay
  ↓
Unified Evaluation Model
  ↓
Band + Structured Feedback
```
The choice should be driven by experiment quality and maintainability.
---
## 14. Research vs Production Boundary
Research may contain:
```text
datasets/
notebooks/
experiments/
training/
evaluation/
checkpoints/
```
Production should contain only stable assets:
```text
approved model artifact
inference code
stable preprocessing
input/output contract
runtime monitoring
```
Only evaluated and intentionally promoted artifacts cross into production.
Local experimentation is expected because the project also serves as an AI-learning project, but local checkpoints and notebooks are development resources, not production dependencies.
---
## 15. Persistence Boundary
The main application database remains the source of truth for Writing submissions, product-visible evaluation state, stored AI results, and model/evaluation version references.
The AI service must not become an independent source of truth for product data.
Temporary runtime storage is allowed when needed, but detailed tables and relationships belong in `database-design.md`.
---
## 16. Failure Handling and Observability
The AI subsystem should distinguish operationally between invalid request, inference error, runtime exception, timeout, service unavailable, and post-processing failure.
At product level these may map to a manageable `GRADING_FAILED` state.
The system should preserve the Writing submission, record failure information, allow retry when appropriate, and never return incomplete output as a successful evaluation.
Useful metadata includes request/submission IDs, model/evaluation version, start/completion time, result status, error category, and retry count.
Sensitive essay content should not be duplicated unnecessarily in logs.
---
## 17. Runtime Principle
AI evaluation should continue separately after the Writing submission is accepted; no specific latency target is fixed yet.
```text
Submit Writing → Submission accepted → AI evaluation continues separately
```
---
## 18. Security, Privacy, and Deployment Boundary
The AI subsystem receives only the minimum information required for Writing evaluation and does not need passwords, authentication credentials, group membership, XP history, or personal progress history.
Writing access follows main-application authorization rules; detailed security rules belong in `docs/rules/security.md`.
The AI subsystem is expected to use Python when implementation begins.

It may run as a separate internal runtime or on separate compute. The architecture does not lock the project to an AI serving framework, provider, GPU platform, or transport mechanism; only the logical application/AI boundary and versioned contract are fixed.
---
## 19. Architecture Constraints
Unless changed by an explicit architecture decision:
1. Writing works without AI.
2. AI is limited to Writing Evaluation.
3. AI failure does not invalidate a submission.
4. AI inference is separable from the submission transaction.
5. Product data remains owned by the main application.
6. Model internals remain behind a stable evaluation contract.
7. AI results are versioned.
8. AI results are presented as estimates.
9. Research artifacts do not automatically become production artifacts.
10. Model choice remains experiment-driven.
11. AI subsystem output is contract-validated by the main application before persistence.
12. The AI workstream may use Python without making the main TypeScript application depend on Python research artifacts.
---
## 20. Decisions Intentionally Deferred
The following remain intentionally deferred: final model family; training/inference frameworks; queue technology; compute requirements; learning rate, batch size and epochs; final dataset size; feedback strategy; shared vs separate Task 1/Task 2 models; and deployment provider.
These decisions should be based on experiments, implementation evidence, or ADRs rather than early assumptions.
---
## 21. Relationship to Other Documents
```text
Product-level AI scope
→ ../product/modules.md
AI release timing
→ ../product/roadmap.md
Overall system architecture
→ ./system-design.md
AI-related persistence
→ ./database-design.md
AI experiments and current state
→ ../project-memory/ai.md
Major architecture decisions
→ ../decisions/
```
This file is the source of truth for **how the AI subsystem fits into AIELTS Together**, while model-specific experiments remain outside it.
---
## 22. Summary
The AI architecture is intentionally narrow:
```text
Writing Submission
        ↓
Optional Evaluation Job
        ↓
AI Service
        ↓
Versioned Model
        ↓
Structured AI Result
```
Its central invariant is:
```text
AI failure != Writing submission failure
```
The architecture separates product from model internals, submission from evaluation, research from production, and stable contracts from experimental implementation.
