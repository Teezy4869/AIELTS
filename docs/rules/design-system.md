# AIELTS Together — Design System Rules

## 1. Purpose
This document defines UI implementation rules for AIELTS Together, a desktop-first IELTS learning web app.
Baseline:
```text
React
Next.js App Router
Tailwind CSS
project-owned shadcn/ui components
```
shadcn/ui is a component foundation, not the product design authority.

## 2. Design principles
1. Study first: prioritize concentration and task completion over decoration.
2. Desktop first: optimize Reading, Listening, Writing, planning, and dashboards for desktop.
3. Consistency over novelty: reuse tokens, components, spacing, and interaction patterns.
4. Privacy-aware: group UI must not expose detailed private academic data.
5. Motivation over competition: XP/streak/badges should encourage consistency, not shame or over-competition.

## 3. UI foundation
```text
Project design rules
→ semantic tokens
→ Tailwind
→ project-owned shadcn/ui primitives/components
→ domain/page compositions
```
Do not treat default shadcn styles as the final design system.

## 4. Tokens
Define and reuse semantic tokens for:
- Background / foreground.
- Muted surfaces/text.
- Border.
- Primary action.
- Success / warning / destructive / information.
- Focus ring.
- Radius.
- Spacing.
- Typography scale.
Avoid one-off hard-coded values when a semantic token exists.

Current foundation conventions preserve the accepted editorial direction:

- Color roles use `--canvas`, `--surface`, `--surface-muted`, `--ink`,
  `--muted`, `--line`, `--brand`, `--accent`, `--warm`, `--destructive`,
  `--information`, and `--focus-ring`.
- The visual language uses sharp controls/cards (`--radius-sharp` and
  `--radius-control`) with strong border and offset-shadow treatment.
- Spacing roles are `--space-page`, `--space-section`, `--space-card`, and
  `--space-control`; use the existing Tailwind spacing scale when it maps to
  the same established rhythm.
- `--font-display` is reserved for page and section headings; body copy uses
  `--font-body`.

## 5. Color
Use semantic meaning rather than arbitrary color names in product logic.
Do not rely on color alone for status. Pair color with text/icon/state.
Never use color or score visualizations to leak private academic information in group views.

## 6. Themes
Support:
```text
light
dark
system
```
Reusable components must remain legible in light and dark modes. Avoid theme-specific one-off components.

The application shell starts in `system` mode and lets the user cycle through
system, dark, and light preferences. Persisting a preference is deferred until
there is an established settings boundary.

## 7. Typography
Use a restrained hierarchy:
```text
Page title
Section heading
Card heading
Body
Supporting text
Label / metadata
```
Long Reading passages and Writing prompts require comfortable line height and readable width.

## 8. Spacing
Use a consistent spacing scale:
```text
page padding
→ section gap
→ card padding
→ control gap
→ inline gap
```
Dashboards may be denser; study workspaces should favor readability.

## 9. Application layout
Use a consistent shell for primary navigation, current context/group, page title/actions, and main content.
Dashboards should use bounded readable widths. Skill workspaces may use more width when content needs it.

## 10. Reading workspace
Desktop default:
```text
┌──────────────────────────┬──────────────────────────┐
│ Passage                  │ Questions                │
│                          │                          │
│ Reading content          │ Answer interaction       │
└──────────────────────────┴──────────────────────────┘
```
Passage/questions should remain independently readable. Clearly show unanswered state. Keep submit visible but not distracting.

## 11. Listening workspace
Prioritize audio controls, playback state, questions, and answer inputs.
Do not add decorative audio visualizations without learning value.
Transcript visibility must follow product rules and should not appear early when prohibited.

## 12. Writing workspace
Prioritize prompt, Task 1 image when applicable, editor, word count, autosave/save state, and submit.
There is no mandatory exam timer in current scope. Do not design the experience around a forced countdown.
The editor should support long multi-session writing.

## 13. Forms
Use consistent labels, required indicators, help text, validation messages, disabled/loading states, and focus behavior.
Field errors appear near the field. Placeholder text must not be the only label.

## 14. Buttons/actions
Use clear hierarchy:
```text
Primary
Secondary
Ghost/subtle
Destructive
```
Normally one area has one obvious primary action. Significant destructive actions require explicit wording and confirmation.

## 15. Cards
Use cards for meaningful grouped units such as dashboard summaries, assignments, group/member summaries, progress, and settings.
Do not wrap every content block in a card.

## 16. Tables/lists
Use tables for structured comparison such as members, assignment status, leaderboard, and admin lists.
Use lists/cards when richer interaction or responsive stacking is needed.
Group tables must not include private score/Writing columns.

## 17. Statuses
Represent statuses consistently with text + badge/icon where useful.
Examples:
```text
ACTIVE
PAUSED
SUBMITTED
LATE
MISSED
DISABLED
FAILED
```
Do not create different visual meanings for the same status across modules.

The shared status badge owns both the visible label and its treatment. Its
current status vocabulary is `active`, `in-progress`, `upcoming`, `complete`,
`paused`, `late`, `missed`, and `failed`; text remains visible so status is
never communicated by color alone.

## 18. Empty states
An empty state should explain:
1. What is missing.
2. Why it matters.
3. What the user can do next.
Avoid bare “No data” screens.

## 19. Loading states
Preserve layout where practical. Avoid full-page spinners for small local operations.
For mutations, prevent duplicate submissions/destructive actions when necessary and show pending feedback.

## 20. Error states
Explain what action failed without exposing internal technical details. Offer retry/next step when useful.
Admin error views may be more diagnostic but still never reveal secrets.

## 21. Notifications
In-web notifications should be concise and contextual: assignment, deadline, XP, badge, reaction, AI result/failure, content exhaustion.
Link to the relevant destination where useful. Avoid turning every event into noisy notification UI.

## 22. Group privacy
Group UI may show:
```text
name
avatar
XP
streak
assignment completion
completion rate
quarter rank
approved activity
```
Do not show detailed Reading/Listening scores, Writing text/band, AI criterion scores, detailed study time, or private progress. Tooltips and hover states must follow the same rule.

## 23. Gamification
Use restrained emphasis.
- Reward consistency and completion.
- Avoid shame-oriented visuals for missed tasks.
- Do not make low rank a destructive/error state.
- Keep academic results separate from leaderboard ranking.

## 24. Team Activity
UI supports approved system events and fixed reactions only.
Do not add affordances for free-form posts/comments, realtime chat, private messages, or image uploads unless product scope explicitly changes.

## 25. Accessibility
Reusable UI must support keyboard navigation, visible focus, semantic labels, sufficient contrast, screen-reader-friendly forms, and non-color-only status communication.
Do not remove focus outlines without an accessible replacement.

## 26. Responsive behavior
Desktop is primary, but smaller layouts must degrade gracefully.
Two-column skill layouts may stack/switch modes, tables may scroll/simplify, navigation may collapse, and primary actions remain reachable.
Do not shrink content until it becomes unreadable.

## 27. Component ownership
```text
shared UI primitives       → shared component area
domain-specific components → owning module
page composition            → route/page area
```
Do not move a component to global shared space merely because it is used twice; share only when the abstraction is stable and domain-neutral.

## 28. shadcn/ui usage
- Keep source-owned components in the repository.
- Adapt them to project tokens.
- Use one consistent primitive base for new components.
- Do not mix multiple component libraries for the same primitive responsibility without reason.
Project rules override library defaults.

## 29. Icons and motion
Use one icon system consistently where practical. Icons should support, not replace, unfamiliar action text.
Use motion sparingly for state transitions, dialogs, and collapsible navigation. Avoid distracting animation in learning workspaces and respect reduced-motion preferences where possible.

## 30. Localization
Supported UI languages:
```text
vi
en
```
Avoid scattering hard-coded user-facing strings once localization infrastructure exists. Layouts must tolerate different label lengths.
Date/time display respects locale/timezone, while protected business rules remain server-authoritative.

## 31. Density
- Dashboards: moderate density.
- Reading/Listening/Writing: focus and legibility.
- Admin: denser operational layout is acceptable.
Do not force one density model across all product areas.

## 32. Review checklist
```text
[ ] Uses project tokens/patterns.
[ ] Works in light and dark themes.
[ ] Primary action is clear.
[ ] Keyboard/focus behavior is usable.
[ ] Status is not color-only.
[ ] Group view does not expose private academic data.
[ ] Desktop learning workflow remains readable.
[ ] Empty/loading/error states are handled.
[ ] Existing component reused when appropriate.
[ ] UI does not introduce out-of-scope social/exam behavior.
```

## 33. Summary
The interface should feel:
```text
focused
structured
calm
consistent
study-oriented
accessible
privacy-aware
```
