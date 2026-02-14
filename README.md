# Fitness Plan Maker

React app for generating and managing personalized workout plans.

## Stack
- React 19
- Vite 7
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui-style component primitives in `src/components/ui`
- Vitest + React Testing Library

## Environment
Create `/Users/justincupp/Desktop/Archia-Hackathon-2026/.env.local` with:

```bash
VITE_ARCHIA_BASE_URL=https://registry.archia.app
VITE_ARCHIA_AGENT_NAME=Fitness-Plan-Generator
VITE_ARCHIA_TOKEN=<your_workspace_api_key>
# optional
VITE_DEBUG_ARCHIA=true
```

## Scripts
- `npm run dev`: start local dev server
- `npm run dev:archia-debug`: start dev server with Archia debug logging
- `npm run test`: run test suite once
- `npm run test:watch`: run tests in watch mode
- `npm run build`: type-check and build production assets to `dist/`
- `npm run preview`: preview production build

## Local Run
1. `npm install`
2. `npm run dev`
3. Open the local URL printed by Vite (usually `http://localhost:5173`)

## Deploy
- Build command: `npm run build`
- Publish directory: `dist`
