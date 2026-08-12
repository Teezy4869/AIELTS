---
name: ai-experiment
description: Use when designing, running, evaluating, or documenting an AIELTS Writing AI research experiment involving datasets, baselines, training, evaluation, reproducibility, or model promotion.
---

# AI Experiment

## Purpose
Run Writing-evaluation research as reproducible experiments without coupling notebooks, datasets, checkpoints, or model internals to the production TypeScript application.

## Scope
Allowed:
```text
dataset construction / cleaning
baseline models
transformer/deep-learning experiments
criterion-level scoring
overall band estimation
structured feedback research
model comparison / promotion evaluation
```

Out of scope without a product decision:
```text
Reading/Listening AI
AI-generated questions or study plans
adaptive learning/recommendations
gamification/progress AI
```

## Required Reading
- `AGENTS.md`
- `docs/architecture/ai-architecture.md`
- `docs/product/modules.md`
- `docs/product/roadmap.md`
- `docs/rules/workflow.md`
- `docs/rules/security.md`
- `docs/rules/testing.md`
- Relevant `docs/project-memory/ai.md` when it exists.

Use `references/` only for experiment-specific conventions not owned by authoritative project docs.

## Invariants
```text
AI failure != Writing submission failure
research artifacts != production dependencies
web application owns product state
model internals stay behind a versioned contract
AI results are estimates, not official IELTS results
```

## Workflow

### 1. Define one hypothesis
Write a falsifiable question with a comparison or evaluation target.
Example:
```text
Does candidate B reduce criterion-level MAE versus baseline A?
```

Do not start with only “try model X”.

### 2. Identify dataset/version
Record source/version, Task 1/Task 2 coverage, labels, cleaning state, split, and limitations.
Expected logical fields may include:
```text
prompt
essay
task type
overall band
Task Achievement / Task Response
Coherence and Cohesion
Lexical Resource
Grammatical Range and Accuracy
feedback when available
```

### 3. Protect split integrity
Maintain at least:
```text
train
validation
test
```

Requirements:
- Remove/handle duplicates.
- Prevent essay leakage across splits.
- Keep the test set isolated from routine iteration.
- Preserve Task 1/Task 2 distinction where useful.
- Record provenance when available.

Do not repeatedly tune against the held-out test set.

### 4. Establish a baseline
Before claiming improvement, compare with an appropriate baseline on the same split and compatible metrics.
Possible baselines:
```text
TF-IDF + linear/regression
engineered features
tree-based models
sentence embeddings + regression
```

Exact model choice remains experiment-driven.

### 5. Define metrics before evaluation
Choose metrics appropriate to band/criterion prediction or feedback quality before evaluating the candidate.
Report enough detail to compare models consistently; do not rely on one cherry-picked aggregate metric.

Model-quality evaluation is separate from normal web integration tests.

### 6. Make preprocessing reproducible
Record text normalization, filtering, deduplication, label normalization, tokenization/features, split seed/version, and other transformations.
Only inference-required preprocessing may later cross into production runtime.

### 7. Record experiment configuration
Capture material configuration:
```text
experiment ID/name
model/checkpoint
code revision when available
dataset version
random seed
training/evaluation parameters
environment/dependency version when material
```

Do not rely on unreproducible notebook state.

### 8. Run inside the research boundary
Research may contain:
```text
datasets/
notebooks/
experiments/
training/
evaluation/
checkpoints/
```

Do not import these directly into the production TypeScript application.

### 9. Evaluate against baseline
Report validation results, final test results only when appropriate, criterion-level behavior, overall results, limitations, and cost/latency observations when relevant.
Use the same split and compatible metrics for comparison.

### 10. Inspect failure cases
Sample errors for:
```text
regression toward the mean
criterion inconsistency
Task 1/Task 2 imbalance
length/topic/source bias
leakage suspicion
unstable output structure
invalid score ranges
edge-case failures
```

Do not redefine product truth based on model behavior.

### 11. Record a durable result
A completed experiment record should contain:
```text
hypothesis
experiment ID
dataset/version
model/configuration
metrics
baseline comparison
failure modes / limitations
conclusion
next decision
```

Project memory may summarize durable current AI state; it is not a raw experiment log.

### 12. Decide outcome
Use one of:
```text
REJECT
ITERATE
CANDIDATE_FOR_PROMOTION
```

Training completion alone is not promotion.
A production candidate requires reproducible evaluation, acceptable validation/test behavior, stable inference, a known request/result contract, and explicit version identity.

### 13. Preserve the production boundary
When promoted, maintain:
```text
Writing Submission
→ optional Evaluation Job
→ AI Service
→ versioned model
→ structured result
→ contract validation
→ web-app persistence/display
```

Minimum traceability:
```text
model_version
evaluation_version
created/completed time
```

The AI service receives only evaluation-required data, never credentials, sessions, group roles, XP history, or unrelated profile data.

### 14. Validate model output
Treat AI output as untrusted external input.
Validate required fields, score ranges, task-specific criterion semantics, version metadata, and structured feedback shape.
Invalid/partial output is an evaluation failure, not success.

## Checklist
```text
[ ] Hypothesis is explicit.
[ ] Dataset/split is identifiable and leakage-aware.
[ ] Baseline is declared.
[ ] Metrics are defined consistently.
[ ] Preprocessing/configuration is reproducible.
[ ] Test-set use is disciplined.
[ ] Failure cases were inspected.
[ ] Result/limitations are recorded.
[ ] Promotion is explicit, not automatic.
[ ] Production contract is independent from model internals.
[ ] AI output remains an estimate.
```

## Do Not
- Make Writing submission depend on AI availability.
- Expand AI scope without a product decision.
- Send credentials/sessions/XP/unrelated profile data to AI.
- Let notebooks/checkpoints become implicit production dependencies.
- Promote without versioned reproducible evaluation.
- Tune repeatedly on the held-out test set.
- Present predicted bands as official IELTS results.
