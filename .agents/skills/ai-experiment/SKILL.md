---
name: ai-experiment
description: Use when designing, running, evaluating, or documenting an AIELTS Writing AI research experiment involving datasets, baselines, training, evaluation, or model promotion.
---

# AI Experiment

## Purpose
Run Writing-evaluation research as reproducible experiments without coupling notebooks, datasets, checkpoints, or model internals to the production TypeScript application.

## Scope
Allowed:
- dataset construction / cleaning
- baseline models
- transformer/deep-learning experiments
- criterion-level scoring
- overall band estimation
- structured feedback research
- model comparison / promotion evaluation

Out of scope without a product decision:
- Reading/Listening AI
- AI-generated questions or study plans
- adaptive learning/recommendations

## Required Reading
- AGENTS.md
- docs/architecture/ai-architecture.md
- docs/product/modules.md
- docs/rules/security.md

## Invariants
```text
AI failure != Writing submission failure
research artifacts != production dependencies
model internals stay behind a versioned contract
AI results are estimates, not official IELTS results
```

## Workflow

### 1. Define one hypothesis
Write a falsifiable question with a comparison or evaluation target.

### 2. Identify dataset/version
Record source/version, Task 1/Task 2 coverage, labels, cleaning state, split, and limitations.

### 3. Protect split integrity
Maintain at least: train, validation, test.
Remove/handle duplicates. Prevent essay leakage across splits.

### 4. Establish a baseline
Before claiming improvement, compare with an appropriate baseline on the same split.

### 5. Define metrics before evaluation
Choose metrics appropriate to band/criterion prediction before evaluating the candidate.

### 6. Record experiment configuration
Capture: experiment ID/name, model/checkpoint, dataset version, random seed, training/evaluation parameters.

### 7. Decide outcome
Use one of:
```text
REJECT
ITERATE
CANDIDATE_FOR_PROMOTION
```

Training completion alone is not promotion.

### 8. Preserve the production boundary
When promoted, maintain:
```text
Writing Submission → optional Evaluation Job → AI Service → versioned model
→ structured result → contract validation → web-app persistence/display
```

## Checklist
```text
[ ] Hypothesis is explicit.
[ ] Dataset/split is identifiable and leakage-aware.
[ ] Baseline is declared.
[ ] Metrics are defined consistently.
[ ] Promotion is explicit, not automatic.
[ ] Production contract is independent from model internals.
```

## Do Not
- Make Writing submission depend on AI availability.
- Expand AI scope without a product decision.
- Present predicted bands as official IELTS results.
