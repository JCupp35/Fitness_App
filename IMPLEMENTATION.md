# Fitness Plan Maker - Implementation

## Product Goal
Build a single-page web app that collects fitness intake data and generates a workout plan via an Archia agent. Users can create, read, update, and delete plans locally.

## Current Architecture
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS v4 + shadcn/ui component primitives
- Persistence: `localStorage` via `src/services/planStorage.ts`
- Plan generation: Archia Cloud Responses API via `src/services/planGenerator.ts`
- Testing: Vitest + React Testing Library

## Data Model
### Intake model
- `gender` (optional): `"male" | "female"`
- `height`: `{ value: number, unit: "in" | "cm" }`
- `weight`: `{ value: number, unit: "lb" | "kg" }`
- `goal`: `"build_muscle" | "lose_weight" | "endurance" | "general_fitness"`
- `daysPerWeek`: `1..7`
- `workoutLocation`: `"home" | "gym"`
- `homeEquipment`: `{ pullUpBar: boolean, dipStation: boolean }`

### Plan model
- `id`: string
- `createdAt`: ISO timestamp
- `input`: intake snapshot
- `title`: string
- `days`: `Array<{ day: string, focus: string, exercises: string[] }>`
- `notes`: string

## Validation Rules
- Height and weight must be numeric and positive.
- Goal is required.
- `daysPerWeek` must be an integer from 1 to 7.
- Workout location is required.
- Home equipment defaults to false/false when non-home flow is used.

## Current User Flow
1. User selects unit system once at the top (Imperial default).
2. User fills intake form including optional gender.
3. Height input mode depends on selected system:
   - Imperial: dropdown from `4ft 0in` to `7ft 0in` (default `5ft 9in`).
   - Metric: numeric cm input.
4. If the unit system is changed, only height and weight are reset to system defaults.
5. If location is Home, pull-up bar and dip station toggles are shown.
6. User clicks Generate Plan.
7. App calls `POST /v1/responses` using `model: "agent:<name>"`.
8. App validates and parses strict JSON response (`title`, `days`, `notes`).
9. Plan is saved to localStorage if generation succeeds.
10. User can edit plan title/notes inline and delete plans.

## Archia Setup
1. Create a `.env.local` file with:
   - `VITE_ARCHIA_BASE_URL=https://registry.archia.app` (optional; defaults to this value)
   - `VITE_ARCHIA_TOKEN=<workspace_api_key>` (required)
   - `VITE_ARCHIA_AGENT_NAME=<exact agent name>` (required)
2. Run `npm run dev` and submit intake form data.

## Known Limitations
- API key is configured client-side for velocity (not production-safe).
- Generation fails closed: no local fallback plan is created when API/generation fails.
- No backend or authentication.
- Unit system switch does not convert values; it resets height/weight by design.
- No export/share flow yet.

## Milestones
1. Add backend proxy for secure token handling.
2. Add server-side persistence and user accounts.
3. Add plan history/versioning and regenerate flow.
4. Add nutrition and progressive overload options.
