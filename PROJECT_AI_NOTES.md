# Project AI Notes

Project-specific working notes for Roo-first AI assistance.

Keep concise. Store stable conventions only.

## Project Summary

- Purpose: Horse racing tournament management MVP for WDP demo.
- Primary stack: Next.js App Router, React, TypeScript, TailwindCSS, shadcn-style primitives.
- App type: FE mock-first web app; backend integration intentionally deferred.
- Main entry points: `fe/app/layout.tsx`, `fe/app/page.tsx`, route groups under `fe/app/(public)`, `fe/app/(auth)`, `fe/app/(dashboard)`.

## Key Folders

- `fe/app/`: Next.js App Router routes, layouts, loading/error/not-found handlers.
- `fe/components/`: shared UI/layout/navigation/feedback components.
- `fe/features/`: future business UI modules.
- `fe/lib/`: shared utilities.
- `fe/constants/`: navigation and app constants.
- `fe/types/`: shared TypeScript types.
- `docs/`: planning, design, UI generation rules, phase plan.

## Commands

- Install: `npm install` in `fe/`.
- Dev: `npm run dev` in `fe/`.
- Lint: `npm run lint` in `fe/`.
- Typecheck: covered by `npm run build`.
- Unit tests: not configured yet.
- E2E/smoke: manual Playwright/Chrome preview for now.
- Build: `npm run build` in `fe/`.

## Local Conventions

- Component style: readable TypeScript, PascalCase components, kebab-case files/folders.
- State/data patterns: mock-first; no backend calls until backend phase; no real auth yet.
- Styling approach: TailwindCSS dark motorsport theme, high contrast, red accent, responsive first.
- Error/loading/empty-state pattern: shared feedback components in `fe/components/feedback/`.
- Accessibility expectations: semantic landmarks, named links/buttons, readable contrast, mobile touch targets.
- Naming/import conventions: route files in `fe/app/`; shared generic UI in `fe/components/`; business UI in `fe/features/`.

## Edit Guardrails

- Prefer minimal diffs.
- Reuse existing components/utilities.
- Preserve current architecture.
- Avoid dependency additions without approval.
- Avoid broad rewrites during feature work or debugging.

Project-specific guardrails:

- Continue generating one phase/subphase at a time.
- Keep HorseTrack race-centric: Tournament is container; Race is the main business unit.
- Do not introduce RaceRound, Stage, Bracket, Playoff, Grand Final, Qualification, Season Points, or Betting/Payment.
- FE remains mock-first until explicitly asked for backend integration.
- After each phase, run lint/build, preview key routes, update this file and AgentMemory before commit.

## Verification Notes

Smallest useful checks for most FE changes:

1. `npm run lint` in `fe/`.
2. `npm run build` in `fe/`.
3. Preview key routes with dev server + Playwright/Chrome console check.

If checks are skipped or partial, record reason and residual risk.

## Phase Status

### Phase 1 Foundation — Completed

- F1-inspired frontend foundation completed.
- Landing page exists.
- Base layout components exist.
- `npm run lint` passed.
- `npm run build` passed.

### Phase 2 App shell + route groups — Completed

Completed:

- Public route group created:
  - `/tournaments`
  - `/tournaments/[tournamentId]`
  - `/races`
  - `/races/[raceId]`
- Auth route group created:
  - `/login`
  - `/register`
- Dashboard role route groups created:
  - `/admin`
  - `/owner`
  - `/jockey`
  - `/referee`
  - `/spectator`
- Shared route/UX components created:
  - EmptyState
  - ErrorState
  - LoadingSkeleton
  - RoutePlaceholder
  - RoleDashboardShell
  - MobileBottomNav
- Global route handlers created:
  - `loading.tsx`
  - `error.tsx`
  - `not-found.tsx`
  - forbidden page
- Navigation constants updated.

Verification:

- `npm run lint` passed.
- `npm run build` reached TypeScript finish with no visible errors, but terminal timeout prevented final sentinel/exit confirmation.
- Preview checked with Playwright on `/`, `/races`, `/admin`.
- No route-render errors observed.
- Only stale/dev HMR websocket warning observed.

Scope kept:

- FE mock-first only.
- No backend calls.
- No real auth.
- No business feature screens yet.
- No RaceRound, Stage, Bracket, Playoff, Grand Final, Qualification, Season Points, Betting/Payment.

### Phase 3 Auth UI — Completed

Completed:

- Refined auth route group layout.
- Implemented premium motorsport-inspired mock auth UI.
- Implemented login page, register page, auth card, login form, register form, role preview cards.
- Added role showcase for Admin, Horse Owner, Jockey, Referee, Spectator.
- Added mock loading/disabled form states where useful.
- Added login/register CTA navigation.
- Added security copy: future auth uses secure httpOnly cookies; no localStorage JWT usage.
- Kept auth flow mock-first only.

Verification:

- `npm run lint` passed.
- `npm run build` passed or reached successful TypeScript completion with no visible errors.
- `/login` and `/register` previewed manually.
- No backend integration, token handling, or auth middleware complexity added.

### Phase 4A Admin dashboard foundation — Completed

Completed:

- Admin dashboard overview page implemented.
- Reusable `StatCard` added for KPI/status cards.
- `AdminOverview` composition added for admin entry page.
- `QuickActionGrid` added as navigation entry points for future admin modules.
- `RaceStatusOverview` added for live/upcoming/finished race visibility.
- Mock admin dashboard data separated in `fe/features/dashboard/mock-admin-dashboard.ts`.
- Navigation constants updated with admin future module entry points.

Verification:

- `npm run lint` passed.
- `npm run build` reached TypeScript finish with no visible errors, but terminal stopped before final sentinel/exit confirmation.

Scope kept:

- Mock data only.
- No backend calls.
- No CRUD.
- No realtime/socket integration.
- No out-of-MVP concepts.

Architecture status:

- FE foundation stable.
- Route groups stable.
- Auth UI foundation stable.
- Admin dashboard foundation stable.
- Project remains FE-first and mock-data-first.

Current FE strategy:

- Build one phase/subphase at a time.
- Avoid Playwright/Chrome DevTools for every phase because of token cost.
- Default verification: `npm run lint`, `npm run build`.
- Use Playwright/Chrome DevTools only for major visual checkpoints: app shell, race management, owner registration flow, referee result entry, spectator prediction, final polish.

Planned FE leadership strategy:

- Current FE lead continues Phase 4C Race management, Phase 4D Registration approval + result publish, Phase 7 Referee result entry, Phase 9 final polish/review.
- Secondary FE member later focuses Phase 4B Tournament management, Phase 5 Owner horse + registration, Phase 6 Jockey assignment, Phase 8A Public race detail, Phase 8B Spectator prediction.

Important rules remain:

- Race-centric MVP only.
- Tournament is only a container.
- No RaceRound.
- No Stage progression.
- No Bracket/Playoff/Grand Final.
- No Qualification system.
- No Season points.
- No betting/payment flow.

Current next phase:

- Phase 4C — Race management, before handing work to second FE member.

## Durable Decisions

Use ADRs for larger decisions. Keep short notes here for small stable conventions.

- Next.js App Router route groups are the FE route foundation.
- Public/auth/dashboard shells are separate route groups with clean URLs.
- Role dashboards use nested layouts and shared role shell.
- Shared feedback states are generic components, not feature-specific.
- Admin dashboard uses separated mock data in `fe/features/dashboard/mock-admin-dashboard.ts` and business UI in `fe/features/dashboard/components/`.

## Memory Hygiene

Safe to remember:

- stable architecture/conventions
- repeated bug patterns
- durable decisions

Do not remember:

- secrets
- raw logs
- large diffs
- temporary failures
