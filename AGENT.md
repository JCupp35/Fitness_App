# AGENT Working Notes

## Decision Log
- 2026-02-13: Chosen stack is Create React App + JavaScript.
- 2026-02-13: Persistence for v1 is browser localStorage (`fitness_plan_maker.v1.plans`).
- 2026-02-13: App structure is single-page (form + generated plans list).
- 2026-02-13: Tailwind CSS v4 selected, integrated with CLI build/watch flow for CRA.
- 2026-02-13: Unit toggle enabled (height: in/cm, weight: lb/kg).
- 2026-02-13: Plan generation is deterministic local mock until AI integration is defined.

## Current Assumptions
- User runs app locally with `npm start`.
- No backend is required for v1.
- AI integration contract will be defined in a later iteration.

## Open Questions
- What exact input/output schema should the AI agent accept and return?
- Should generated plans include progression over multiple weeks?
- Should we enforce stricter constraints based on goal (for example minimum days)?

## Next Iteration Tasks
1. Define AI generation interface in `src/services/planGenerator.js`.
2. Add API client layer and fallback behavior.
3. Add loading/error UI states for generation.
4. Expand editable fields beyond title and notes.
5. Add user-friendly empty/error toasts and accessibility audit.

## Change History
- v1 bootstrap created with CRUD flow, validation, deterministic plan generator, and baseline tests.
