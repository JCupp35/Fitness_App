# AGENT Working Notes

## Decision Log
- 2026-02-13: Persistence for v1 is browser localStorage (`fitness_plan_maker.v1.plans`).
- 2026-02-13: App structure is single-page (form + generated plans list).
- 2026-02-14: Migrated stack to Vite + TypeScript.
- 2026-02-14: Adopted shadcn/ui-style component primitives with Tailwind CSS v4.
- 2026-02-14: Migrated test runner to Vitest.

## Current Assumptions
- User runs app locally with `npm run dev`.
- No backend is required for v1.
- Archia API credentials are provided via Vite env vars.

## Open Questions
- Should generated plans include progression over multiple weeks?
- Should we enforce stricter constraints based on goal (for example minimum days)?

## Next Iteration Tasks
1. Add API proxy/backend for secure token handling.
2. Add authenticated server-side persistence.
3. Add loading/error telemetry for generation and API failures.
4. Expand editable fields beyond title and notes.
5. Add user-friendly toasts and accessibility audit.

## Change History
- v1 bootstrap created with CRUD flow, validation, generation, and baseline tests.
- 2026-02-14 migration updated build, typing, UI primitives, and test tooling.
