# Frontend Generation Master Prompt

Use these files as source of truth:

- `docs/topic.md`
- `docs/planning_fe.md`
- `docs/design.md`
- `docs/ui_generation_rules.md`

Generate frontend UI for HorseTrack — Horse Racing Tournament Management System MVP.

## Business model

Tournament is only a container.

Each Tournament has many independent Races.

Race is the main business unit.

Each Race has:

- participants
- jockey assignment
- referee
- live status
- result
- ranking

Do not create RaceRound, Stage, Bracket, Playoff, Grand Final, Qualification, or Season Point flow.

## Design direction

Create a premium motorsport racing dashboard inspired by Formula 1 visual energy, but do not copy Formula 1 logo, brand assets, proprietary fonts, or exact layouts.

Use:

- dark background
- red accent `#E10600`
- dark surfaces `#15151E`, `#1C1C25`, `#303037`
- white text
- bold headings
- sharp cards
- clean spacing
- race-status feeling
- responsive layouts

## Tech

Use:

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react
- TanStack Query only when needed
- React Hook Form + Zod only for forms
- Socket.IO Client only for live/realtime UI placeholder

## Current repo

Frontend folder: `/fe`  
Docs folder: `/docs`  
Backend folder: `/be`

## Output rules

Generate frontend UI only.
Use mock data.
Do not implement backend logic.
Do not create fake API complexity.
Do not over-engineer state management.
Keep components clean and reusable.
Follow route structure from `planning_fe.md`.

## Module to generate

[PASTE MODULE NAME HERE]

## Expected response

After generating, summarize:

- changed files
- created components
- how to run/check

## Testing rule update:

Do not use Playwright/Chrome DevTools for every phase because it is token-expensive.
Default verification:

- npm run lint
- npm run build

## Use Playwright/Chrome DevTools only for important visual or flow checkpoints:

- App shell/route groups
- Admin race management
- Owner race registration
- Referee result entry
- Spectator prediction
- Final polish/testing
