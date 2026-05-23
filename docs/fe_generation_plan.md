# Frontend Generation Plan — HorseTrack

## Source of truth

Use these docs as canonical input for frontend generation:

- `docs/topic.md`
- `docs/planning_fe.md`
- `docs/design.md`
- `docs/ui_generation_rules.md`
- `docs/frontend_generation_prompt.md`
- `PROJECT_AI_NOTES.md`

## Current status

- Phase 1 Foundation is DONE.
- F1-inspired frontend foundation is completed.
- `fe/app/globals.css` has dark motorsport theme.
- Base layout components exist:
  - `fe/components/layout/app-header.tsx`
  - `fe/components/layout/app-sidebar.tsx`
  - `fe/components/layout/page-header.tsx`
- Landing page exists.
- `npm run lint` passed.
- `npm run build` passed.
- `.roo/` is local-only and ignored by git.

## Non-negotiable generation rules

- MVP-first.
- Race-centric UI.
- Tournament is only a container.
- Race is the main business unit.
- Use mock data first.
- Do not implement backend integration yet.
- Keep UI reusable and consistent with the design system.
- Do not generate the full app at once.
- Generate one phase or subphase at a time.
- After every phase/subphase, run:
  - `npm run lint`
  - `npm run build`
- After visual phases/subphases, run preview and inspect UI.
- Follow Next.js App Router routes in `fe/app/`.
- Keep shared generic UI in `fe/components/`.
- Keep business UI in `fe/features/`.
- Use TailwindCSS + shadcn/ui style primitives.
- Keep naming kebab-case for files/folders, PascalCase for components.

## Strictly OUT OF MVP

Do not generate or imply these flows in MVP:

- RaceRound
- Stage progression
- Bracket
- Playoff
- Grand Final
- Qualification system
- Season points
- Advanced leaderboard aggregation
- Payment/betting flow

## Recommended generation cycle

Generate one phase/subphase → Preview → Chrome DevTools review → Playwright responsive test → FE Reviewer pass → Fix → Commit

Use this cycle per phase/subphase:

1. Generate only the current phase/subphase.
2. Keep data mocked and local.
3. Run `npm run lint`.
4. Run `npm run build`.
5. For visual phases/subphases, run preview/dev server.
6. Inspect primary routes with Chrome DevTools.
7. Run Playwright responsive smoke test for mobile/tablet/desktop.
8. Use FE Reviewer for UI quality, accessibility, consistency.
9. Fix only current phase/subphase issues.
10. Commit with the checkpoint message listed below.

---

## Phase 1: Foundation — DONE

### Goal

Establish the visual foundation, base layout shell, and first public entry point for HorseTrack.

### Scope

- Dark motorsport design foundation.
- Base global styles.
- Reusable app layout primitives.
- Landing page.
- Initial navigation constants/types.
- Validate lint/build baseline.

### Files/routes to create or update

Already completed:

- `fe/app/globals.css`
- `fe/app/layout.tsx`
- `fe/app/page.tsx`
- `fe/components/layout/app-header.tsx`
- `fe/components/layout/app-sidebar.tsx`
- `fe/components/layout/page-header.tsx`
- `fe/types/navigation.ts`
- `fe/constants/navigation.ts`

### Main reusable components

- `AppHeader`
- `AppSidebar`
- `PageHeader`
- Base buttons/cards from `fe/components/ui/`

### Mock data needed

- Landing page race highlights.
- Featured tournaments.
- Race status examples.
- Role CTA cards.

### Acceptance criteria

- Dark motorsport theme applied globally.
- Landing page renders without runtime errors.
- Base header/sidebar/page header components compile.
- Routes use Next.js App Router.
- No backend integration.
- `npm run lint` passes.
- `npm run build` passes.

### Suggested Roo mode

- Architect Lite for validation notes.
- FE Reviewer for UI consistency review.
- Debugger only if lint/build/runtime fails.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect created files.
- chrome-devtools: visual inspect landing page.
- playwright: smoke responsive viewport checks.

### Git commit checkpoint message

`feat(fe): establish F1-inspired frontend foundation`

---

## Phase 2: App shell + route groups

### Goal

Create the Next.js App Router shell and role route groups without implementing business flows yet.

### Scope

- Public route group shell.
- Auth route group shell.
- Dashboard route group shell.
- Role layouts for admin, owner, jockey, referee, spectator.
- Placeholder pages for route map.
- Shared empty/loading/error/not-found UX.
- Navigation alignment with existing `AppHeader`, `AppSidebar`, and `PageHeader`.

### Files/routes to create or update

- `fe/app/not-found.tsx`
- `fe/app/error.tsx`
- `fe/app/loading.tsx`
- `fe/app/forbidden/page.tsx`
- `fe/app/(public)/layout.tsx`
- `fe/app/(public)/tournaments/page.tsx`
- `fe/app/(public)/tournaments/[tournamentId]/page.tsx`
- `fe/app/(public)/races/page.tsx`
- `fe/app/(public)/races/[raceId]/page.tsx`
- `fe/app/(auth)/layout.tsx`
- `fe/app/(auth)/login/page.tsx`
- `fe/app/(auth)/register/page.tsx`
- `fe/app/(dashboard)/layout.tsx`
- `fe/app/(dashboard)/admin/layout.tsx`
- `fe/app/(dashboard)/admin/page.tsx`
- `fe/app/(dashboard)/owner/layout.tsx`
- `fe/app/(dashboard)/owner/page.tsx`
- `fe/app/(dashboard)/jockey/layout.tsx`
- `fe/app/(dashboard)/jockey/page.tsx`
- `fe/app/(dashboard)/referee/layout.tsx`
- `fe/app/(dashboard)/referee/page.tsx`
- `fe/app/(dashboard)/spectator/layout.tsx`
- `fe/app/(dashboard)/spectator/page.tsx`
- `fe/components/feedback/empty-state.tsx`
- `fe/components/feedback/error-state.tsx`
- `fe/components/feedback/loading-skeleton.tsx`
- `fe/components/navigation/mobile-bottom-nav.tsx`
- `fe/constants/navigation.ts`

### Main reusable components

- `AppHeader`
- `AppSidebar`
- `PageHeader`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `MobileBottomNav`
- `StatusBadge`

### Mock data needed

- Role navigation items.
- Placeholder dashboard stats per role.
- Public race/tournament cards for shell routes.

### Acceptance criteria

- Route groups compile and preserve clean URLs.
- Public, auth, dashboard, and role layouts are visually distinct but consistent.
- Placeholder pages clearly state phase/status.
- No backend calls.
- No auth middleware complexity yet unless already existing.
- No full business screens yet.
- No RaceRound/stage/bracket routes.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for landing, public race list, admin dashboard, mobile role shell.

### Suggested Roo mode

- Architect Lite for route scope confirmation.
- FE Implementer for creating route groups and shells.
- FE Reviewer after implementation.
- Debugger if route/build issues occur.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: verify route files and folder structure.
- chrome-devtools: inspect shell layout, nav, console.
- playwright: responsive route smoke test.

### Git commit checkpoint message

`feat(fe): add app shell and route groups`

---

## Phase 3: Auth UI

### Goal

Create polished mock-first authentication UI for login/register and role entry flow.

### Scope

- Auth layout refinement.
- Login form UI.
- Register form UI.
- Role selection/role explanation blocks.
- Mock session/role redirect placeholder only.
- Guest-only UX copy without real auth integration.
- Security copy: future auth uses httpOnly cookie, not localStorage JWT.

### Files/routes to create or update

- `fe/app/(auth)/layout.tsx`
- `fe/app/(auth)/login/page.tsx`
- `fe/app/(auth)/register/page.tsx`
- `fe/features/auth/components/auth-card.tsx`
- `fe/features/auth/components/login-form.tsx`
- `fe/features/auth/components/register-form.tsx`
- `fe/features/auth/components/role-preview-card.tsx`
- `fe/features/auth/types.ts`
- `fe/features/auth/mock-auth-data.ts`

### Main reusable components

- `AuthCard`
- `LoginForm`
- `RegisterForm`
- `RolePreviewCard`
- Existing `Button`
- Form field wrappers if needed

### Mock data needed

- Roles: Admin, Horse Owner, Jockey, Referee, Spectator.
- Demo credentials copy only, no real credential storage.
- Auth feature highlights.

### Acceptance criteria

- Login/register routes render responsive forms.
- Forms have labels, focus states, disabled/loading mock states.
- No real API call.
- No JWT/localStorage handling.
- Clear CTA links between login/register.
- Consistent motorsport dark visual style.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for desktop/mobile auth pages.

### Suggested Roo mode

- FE Implementer for UI.
- FE Reviewer for accessibility/form quality.
- Debugger if form hydration/build issues occur.
- Architect Lite only for auth scope adjustments.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect auth feature files.
- chrome-devtools: inspect forms, console, accessibility basics.
- playwright: auth page responsive smoke and keyboard tab flow.

### Git commit checkpoint message

`feat(fe): add mock-first auth UI`

---

## Phase 4A: Admin dashboard foundation

### Goal

Create a focused admin overview that acts as the entry point for race-centric admin work.

### Scope

- Admin overview page.
- Stat cards for tournaments, races, registrations, results.
- Quick actions for create tournament, create race, review registrations, review results.
- Navigation entry points to later admin subphases.
- No CRUD forms yet.

### Files/routes to create or update

- `fe/app/(dashboard)/admin/page.tsx`
- `fe/components/data-display/stat-card.tsx`
- `fe/features/dashboard/components/admin-overview.tsx`
- `fe/features/dashboard/components/quick-action-grid.tsx`
- `fe/features/dashboard/mock-admin-dashboard.ts`
- `fe/constants/navigation.ts`

### Main reusable components

- `StatCard`
- `AdminOverview`
- `QuickActionGrid`
- `PageHeader`
- `StatusBadge`

### Mock data needed

- Admin KPI counts.
- Upcoming/live/finished race summary.
- Pending registration count.
- Results waiting for publish count.

### Acceptance criteria

- Admin dashboard gives clear next actions.
- Race status is visually prominent.
- Links target planned admin routes.
- No backend integration.
- No tournament/race CRUD implemented in this subphase.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for admin dashboard desktop/tablet.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for dashboard clarity.
- Debugger if layout/build issues occur.
- Architect Lite only for scope confirmation.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect dashboard feature files.
- chrome-devtools: inspect admin overview and console.
- playwright: admin dashboard responsive smoke.

### Git commit checkpoint message

`feat(fe): add admin dashboard foundation`

---

## Phase 4B: Tournament management

### Goal

Build tournament list/detail/create/edit UI as a simple container workflow for races.

### Scope

- Tournament list.
- Tournament detail with race list placeholder/summary.
- Tournament create/edit UI.
- Tournament status display.
- Keep tournament as container only.

### Files/routes to create or update

- `fe/app/(dashboard)/admin/tournaments/page.tsx`
- `fe/app/(dashboard)/admin/tournaments/new/page.tsx`
- `fe/app/(dashboard)/admin/tournaments/[tournamentId]/page.tsx`
- `fe/features/tournaments/components/tournament-card.tsx`
- `fe/features/tournaments/components/tournament-form.tsx`
- `fe/features/tournaments/components/tournament-table.tsx`
- `fe/features/tournaments/components/tournament-detail-panel.tsx`
- `fe/features/tournaments/mock-tournaments.ts`

### Main reusable components

- `TournamentCard`
- `TournamentForm`
- `TournamentTable`
- `TournamentDetailPanel`
- `PageHeader`
- `StatusBadge`
- `EmptyState`

### Mock data needed

- Tournaments with draft/open/closed statuses.
- Race counts per tournament.
- Simple date/location metadata.

### Acceptance criteria

- Admin can browse tournament list and detail with mock data.
- Create/edit form is UI-only.
- Tournament detail lists races/links only; no stages/rounds.
- No backend integration.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for tournament list/detail/form.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for form/list quality.
- Debugger if form route/build issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect tournament feature files.
- chrome-devtools: inspect list/detail/form UI.
- playwright: tournament route smoke.

### Git commit checkpoint message

`feat(fe): add admin tournament management UI`

---

## Phase 4C: Race management

### Goal

Build admin race list/detail/schedule/status and participant view using mock data.

### Scope

- Race list.
- Race create/edit UI.
- Race detail.
- Race schedule/status display.
- Race participants view.
- Race status timeline.
- Assignment overview placeholder only if needed for continuity.

### Files/routes to create or update

- `fe/app/(dashboard)/admin/races/page.tsx`
- `fe/app/(dashboard)/admin/races/new/page.tsx`
- `fe/app/(dashboard)/admin/races/[raceId]/page.tsx`
- `fe/app/(dashboard)/admin/races/[raceId]/participants/page.tsx`
- `fe/app/(dashboard)/admin/races/[raceId]/assignments/page.tsx`
- `fe/features/races/components/race-card.tsx`
- `fe/features/races/components/race-form.tsx`
- `fe/features/races/components/race-table.tsx`
- `fe/features/races/components/race-detail-panel.tsx`
- `fe/features/races/components/race-schedule-card.tsx`
- `fe/features/races/components/race-status-timeline.tsx`
- `fe/features/races/components/participant-table.tsx`
- `fe/features/races/mock-races.ts`
- `fe/components/ui/status-badge.tsx`

### Main reusable components

- `RaceCard`
- `RaceForm`
- `RaceTable`
- `RaceDetailPanel`
- `RaceScheduleCard`
- `RaceStatusTimeline`
- `ParticipantTable`
- `StatusBadge`

### Mock data needed

- Races with scheduled/live/finished/result_published status.
- Race participants with horse, owner, jockey, lane/order.
- Referee assignment summary.
- Race schedule times and location.

### Acceptance criteria

- Race is visually emphasized as the core object.
- Admin can navigate race list/detail/participants with mock data.
- Race schedule/status are clear.
- Participant view is tied to one race.
- No result publish/registration approval in this subphase.
- No backend integration.
- No RaceRound/stage/bracket routes.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for race list/detail/participants.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for race-centric UI quality.
- Debugger if dynamic route/table issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect race feature files.
- chrome-devtools: inspect race UI and console.
- playwright: race management route smoke.

### Git commit checkpoint message

`feat(fe): add admin race management UI`

---

## Phase 4D: Registration approval + result publish

### Goal

Build admin review workflows for race registrations and race results using mock data.

### Scope

- Registration review table.
- Approve/reject dialogs.
- Need-more-info UI if useful.
- Race result review.
- Result publish flow.
- Race ranking display.

### Files/routes to create or update

- `fe/app/(dashboard)/admin/registrations/page.tsx`
- `fe/app/(dashboard)/admin/races/[raceId]/results/page.tsx`
- `fe/features/race-registrations/components/registration-table.tsx`
- `fe/features/race-registrations/components/approval-dialog.tsx`
- `fe/features/race-registrations/components/registration-status-badge.tsx`
- `fe/features/race-registrations/mock-registrations.ts`
- `fe/features/race-results/components/race-result-manager.tsx`
- `fe/features/race-results/components/race-ranking-table.tsx`
- `fe/features/race-results/components/publish-result-dialog.tsx`
- `fe/features/race-results/mock-results.ts`

### Main reusable components

- `RegistrationTable`
- `ApprovalDialog`
- `RegistrationStatusBadge`
- `RaceResultManager`
- `RaceRankingTable`
- `PublishResultDialog`
- `StatusBadge`

### Mock data needed

- Pending/approved/rejected/need_more_info registrations.
- Draft/referee_confirmed/published race results.
- Race rankings per race only.
- Reject reason examples.

### Acceptance criteria

- Admin can review registrations with mock approve/reject dialogs.
- Reject action requires reason in UI.
- Result publish action is disabled unless result is referee-confirmed.
- Race ranking belongs to a single race only.
- No backend integration.
- No advanced leaderboard aggregation.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for registration review and result publish pages.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for action safety and table/dialog UX.
- Debugger if dialog/table state issues occur.
- Architect Lite only for workflow scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect registration/result feature files.
- chrome-devtools: inspect dialogs, table UX, console.
- playwright: approval and publish smoke path.

### Git commit checkpoint message

`feat(fe): add registration approval and result publish UI`

---

## Phase 5: Owner horse + race registration

### Goal

Build owner-facing horse portfolio and race registration flow using mock data.

### Scope

- Owner dashboard summary.
- Horse list/create/detail UI.
- Horse approval status display.
- Available races list/detail.
- Register horse to race form.
- Owner registration status tracking.
- Owner jockey assignment overview placeholder if needed for next phase handoff.

### Files/routes to create or update

- `fe/app/(dashboard)/owner/page.tsx`
- `fe/app/(dashboard)/owner/horses/page.tsx`
- `fe/app/(dashboard)/owner/horses/new/page.tsx`
- `fe/app/(dashboard)/owner/horses/[horseId]/page.tsx`
- `fe/app/(dashboard)/owner/races/page.tsx`
- `fe/app/(dashboard)/owner/races/[raceId]/page.tsx`
- `fe/app/(dashboard)/owner/races/[raceId]/register/page.tsx`
- `fe/app/(dashboard)/owner/registrations/page.tsx`
- `fe/features/horses/components/horse-card.tsx`
- `fe/features/horses/components/horse-form.tsx`
- `fe/features/horses/components/horse-status-badge.tsx`
- `fe/features/horses/mock-horses.ts`
- `fe/features/race-registrations/components/race-registration-form.tsx`
- `fe/features/race-registrations/components/eligible-horse-select.tsx`
- `fe/features/race-registrations/components/registration-status-badge.tsx`
- `fe/features/race-registrations/mock-registrations.ts`
- `fe/features/races/components/race-card.tsx` reuse/update if needed
- `fe/features/races/components/race-detail-panel.tsx` reuse/update if needed

### Main reusable components

- `HorseCard`
- `HorseForm`
- `HorseStatusBadge`
- `RaceRegistrationForm`
- `EligibleHorseSelect`
- `RegistrationStatusBadge`
- `RaceCard`
- `RaceDetailPanel`
- `EmptyState`
- `StatusBadge`

### Mock data needed

- Owner horses with pending/approved/rejected statuses.
- Available races open for registration.
- Ineligible horse examples.
- Registration states: pending, approved, rejected, need_more_info.
- Race capacity/slots.

### Acceptance criteria

- Owner can visually follow: horse portfolio → race detail → register horse → registration status.
- Horse must show approval status before registration.
- Register UI clearly shows eligible vs ineligible horses.
- Registration status page has status badges and next-step copy.
- No backend integration.
- No payment/betting flow.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for owner routes on mobile/tablet/desktop.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for flow clarity/responsiveness.
- Debugger if form/state issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: check feature reuse and mock placement.
- chrome-devtools: inspect owner flow and responsive cards/forms.
- playwright: owner registration smoke path.

### Git commit checkpoint message

`feat(fe): add owner horse and race registration UI`

---

## Phase 6: Jockey assignment

### Goal

Build jockey assignment workflow for owner and jockey using mock data.

### Scope

- Owner jockey assignment management.
- Jockey assignment inbox.
- Assignment detail view.
- Accept/reject mock actions.
- Jockey race schedule.
- Mobile-first jockey dashboard/action center.

### Files/routes to create or update

- `fe/app/(dashboard)/owner/jockey-assignments/page.tsx`
- `fe/app/(dashboard)/jockey/page.tsx`
- `fe/app/(dashboard)/jockey/assignments/page.tsx`
- `fe/app/(dashboard)/jockey/assignments/[assignmentId]/page.tsx`
- `fe/app/(dashboard)/jockey/schedule/page.tsx`
- `fe/features/jockey-assignments/components/jockey-search.tsx`
- `fe/features/jockey-assignments/components/jockey-assignment-form.tsx`
- `fe/features/jockey-assignments/components/assignment-inbox.tsx`
- `fe/features/jockey-assignments/components/assignment-card.tsx`
- `fe/features/jockey-assignments/components/assignment-status-badge.tsx`
- `fe/features/jockey-assignments/components/race-schedule-list.tsx`
- `fe/features/jockey-assignments/mock-assignments.ts`

### Main reusable components

- `JockeySearch`
- `JockeyAssignmentForm`
- `AssignmentInbox`
- `AssignmentCard`
- `AssignmentStatusBadge`
- `RaceScheduleList`
- `MobileBottomNav`
- `StatusBadge`

### Mock data needed

- Jockey list with availability.
- Assignments: pending, accepted, rejected.
- Race schedule items.
- Horse + race pairings.
- Conflict example for overlapping race time as display-only warning.

### Acceptance criteria

- Owner sees jockey assignment statuses.
- Jockey sees mobile-first inbox and schedule.
- Accept/reject actions are mock-only with clear feedback.
- Time conflict warning can display but no real validation backend.
- Jockey route feels usable on mobile.
- No backend integration.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for mobile jockey routes and owner assignment page.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for mobile-first UX.
- Debugger if state/routing issues occur.
- Architect Lite only for flow changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect assignment feature boundaries.
- chrome-devtools: mobile viewport check for jockey inbox/schedule.
- playwright: mobile responsive smoke and action button checks.

### Git commit checkpoint message

`feat(fe): add jockey assignment UI`

---

## Phase 7: Referee result entry

### Goal

Build referee workflow for assigned races, pre-race checks, violation logging, and result entry using mock data.

### Scope

- Referee dashboard/action center.
- Assigned race list.
- Race checklist/detail.
- Violation log minimal UI.
- Result entry form.
- Referee report summary.
- Tablet-first sticky action layout.

### Files/routes to create or update

- `fe/app/(dashboard)/referee/page.tsx`
- `fe/app/(dashboard)/referee/assignments/page.tsx`
- `fe/app/(dashboard)/referee/races/[raceId]/page.tsx`
- `fe/app/(dashboard)/referee/races/[raceId]/violations/page.tsx`
- `fe/app/(dashboard)/referee/races/[raceId]/result-entry/page.tsx`
- `fe/app/(dashboard)/referee/reports/page.tsx`
- `fe/features/referee-reports/components/race-checklist.tsx`
- `fe/features/referee-reports/components/violation-quick-add.tsx`
- `fe/features/referee-reports/components/violation-list.tsx`
- `fe/features/referee-reports/components/result-entry-form.tsx`
- `fe/features/referee-reports/components/referee-report-summary.tsx`
- `fe/features/referee-reports/mock-referee-data.ts`
- `fe/features/race-results/components/race-ranking-table.tsx` reuse/update if needed

### Main reusable components

- `RaceChecklist`
- `ViolationQuickAdd`
- `ViolationList`
- `ResultEntryForm`
- `RefereeReportSummary`
- `RaceRankingTable`
- `RaceStatusTimeline`
- `StatusBadge`

### Mock data needed

- Referee assigned races.
- Participants with horse/jockey lane/order.
- Race statuses: scheduled/live/finished.
- Violation examples.
- Result entry rows with rank/time/status.
- Referee confirmation state.

### Acceptance criteria

- Referee can navigate assigned race → checklist → violations/result entry.
- Result entry UI is enabled only for mock finished race.
- Confirm result state is clearly distinct from published state.
- Tablet-first layout uses large buttons and sticky action bar.
- No backend integration.
- Race ranking remains per race only.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for referee tablet viewport.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for tablet usability and form clarity.
- Debugger if dynamic route/form issues occur.
- Architect Lite only for workflow changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect referee feature files.
- chrome-devtools: tablet viewport, console, sticky actions.
- playwright: referee result entry smoke path.

### Git commit checkpoint message

`feat(fe): add referee result entry UI`

---

## Phase 8A: Public race browsing + detail

### Goal

Build public race discovery and detail views with live status and published results using mock data.

### Scope

- Public tournament/race browse refinement.
- Public race list.
- Public race detail.
- Live race view.
- Published result/ranking display.
- CTA to login for spectator prediction.

### Files/routes to create or update

- `fe/app/(public)/tournaments/page.tsx`
- `fe/app/(public)/tournaments/[tournamentId]/page.tsx`
- `fe/app/(public)/races/page.tsx`
- `fe/app/(public)/races/[raceId]/page.tsx`
- `fe/features/live-race/components/live-race-tracker.tsx`
- `fe/features/live-race/components/participant-live-table.tsx`
- `fe/features/races/components/race-card.tsx` reuse/update if needed
- `fe/features/race-results/components/race-ranking-table.tsx` reuse/update if needed
- `fe/features/live-race/mock-live-races.ts`

### Main reusable components

- `RaceCard`
- `LiveRaceTracker`
- `ParticipantLiveTable`
- `RaceRankingTable`
- `RaceStatusTimeline`
- `StatusBadge`

### Mock data needed

- Public tournaments.
- Public races: upcoming/live/finished/result_published.
- Race participants.
- Published race result/ranking.

### Acceptance criteria

- Public `/races/[raceId]` shows public-only race data.
- Published result/ranking appears only when mock status allows.
- Guest CTA points to login/spectator prediction route.
- Result/ranking belongs to a single race.
- No backend integration.
- No betting/payment flow.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for public race list/detail.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for public UX/accessibility.
- Debugger if route/render issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect public/live-race files.
- chrome-devtools: public UI, console, responsive.
- playwright: public race browsing/detail smoke.

### Git commit checkpoint message

`feat(fe): add public race browsing and detail UI`

---

## Phase 8B: Spectator prediction flow

### Goal

Build authenticated spectator prediction screens using mock data.

### Scope

- Spectator dashboard.
- Spectator race list/detail.
- Prediction panel.
- Prediction option cards.
- Prediction countdown/lock state.
- Prediction history.

### Files/routes to create or update

- `fe/app/(dashboard)/spectator/page.tsx`
- `fe/app/(dashboard)/spectator/races/page.tsx`
- `fe/app/(dashboard)/spectator/races/[raceId]/page.tsx`
- `fe/app/(dashboard)/spectator/predictions/page.tsx`
- `fe/features/predictions/components/prediction-panel.tsx`
- `fe/features/predictions/components/prediction-countdown.tsx`
- `fe/features/predictions/components/prediction-option-card.tsx`
- `fe/features/predictions/components/prediction-history-table.tsx`
- `fe/features/predictions/mock-predictions.ts`

### Main reusable components

- `PredictionPanel`
- `PredictionCountdown`
- `PredictionOptionCard`
- `PredictionHistoryTable`
- `RaceCard`
- `LiveRaceTracker`
- `StatusBadge`

### Mock data needed

- Prediction options.
- User prediction status.
- Prediction open/locked/resolved examples.
- Spectator race list items.

### Acceptance criteria

- Spectator route shows prediction actions/status.
- Prediction lock state is visually clear.
- Lock copy references mock server time, not browser time.
- Prediction history is readable and responsive.
- No backend integration.
- No betting/payment flow.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for spectator mobile/desktop routes.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for spectator UX/responsiveness.
- Debugger if local state issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect predictions feature files.
- chrome-devtools: spectator UI and console.
- playwright: spectator prediction smoke.

### Git commit checkpoint message

`feat(fe): add spectator prediction flow UI`

---

## Phase 8C: Notifications + live polish

### Goal

Add lightweight notification UI and polish live race feedback for demo readiness.

### Scope

- Notification dropdown/list.
- Unread badge UI.
- Race event feed.
- Live race tracker polish.
- Basic notification routes/placeholders for roles if needed.
- No real Socket.IO integration yet; mock event data only.

### Files/routes to create or update

- `fe/app/(dashboard)/spectator/notifications/page.tsx`
- `fe/features/notifications/components/notification-dropdown.tsx`
- `fe/features/notifications/components/notification-list.tsx`
- `fe/features/notifications/components/unread-badge.tsx`
- `fe/features/notifications/mock-notifications.ts`
- `fe/features/live-race/components/race-event-feed.tsx`
- `fe/features/live-race/components/live-race-tracker.tsx` update if needed
- `fe/components/layout/app-header.tsx` update if notification dropdown is added globally

### Main reusable components

- `NotificationDropdown`
- `NotificationList`
- `UnreadBadge`
- `RaceEventFeed`
- `LiveRaceTracker`
- `StatusBadge`

### Mock data needed

- Notifications for race started, race finished, result published.
- Unread/read notification states.
- Race event timeline entries.

### Acceptance criteria

- Notification UI is visible and reusable.
- Unread badge has clear state.
- Race event feed improves live race context.
- No real realtime/socket integration.
- No backend integration.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected for notification dropdown/list and live race polish.

### Suggested Roo mode

- FE Implementer for UI generation.
- FE Reviewer for polish/accessibility.
- Debugger if header/dropdown state issues occur.
- Architect Lite only for scope changes.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect notification/live-race feature files.
- chrome-devtools: dropdown behavior, console, responsive.
- playwright: notification/live race smoke.

### Git commit checkpoint message

`feat(fe): add notifications and live race polish`

---

## Phase 9: Polish + responsive + testing

### Goal

Stabilize UI quality, responsiveness, accessibility, and build confidence before backend integration.

### Scope

- UI consistency pass across all phases/subphases.
- Responsive fixes for mobile/tablet/desktop.
- Empty/loading/error state coverage.
- Accessibility pass: labels, contrast, keyboard focus, touch targets.
- Route smoke tests.
- Visual inspection for key demo flows.
- Performance sanity check for large pages.
- Remove dead placeholders that confuse MVP.
- Update docs if route/scope changed.

### Files/routes to create or update

Update as needed, phase-scoped:

- `fe/app/**/page.tsx`
- `fe/app/**/layout.tsx`
- `fe/components/**`
- `fe/features/**/components/**`
- `fe/features/**/mock-*.ts`
- `docs/fe_generation_plan.md` if final route scope changes

Optional test files if testing stack exists or is added with approval:

- `fe/tests/**`
- `fe/e2e/**`

### Main reusable components

Audit and normalize:

- `AppHeader`
- `AppSidebar`
- `PageHeader`
- `MobileBottomNav`
- `StatusBadge`
- `RaceCard`
- `RaceStatusTimeline`
- `RaceRankingTable`
- `PredictionPanel`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `DataTable`
- `ConfirmDialog`

### Mock data needed

- Ensure mock data covers:
  - empty states
  - loading demonstrations if local state used
  - rejected/disabled states
  - scheduled/live/finished/result_published races
  - pending/approved/rejected registrations
  - pending/accepted/rejected assignments
  - prediction open/locked/resolved

### Acceptance criteria

- All core routes render without runtime console errors.
- Key demo flow is visually coherent:
  1. Landing/public race browse.
  2. Login/register mock UI.
  3. Admin overview/tournament/race/approval/result mock UI.
  4. Owner horse/register flow mock UI.
  5. Jockey assignment flow mock UI.
  6. Referee result entry mock UI.
  7. Public race detail + spectator prediction + notifications mock UI.
- Responsive checks pass at mobile, tablet, desktop.
- Important controls have accessible names/labels.
- Touch targets are acceptable on mobile.
- No OUT OF MVP concepts appear in UI labels/routes/components.
- `npm run lint` passes.
- `npm run build` passes.
- Preview inspected after final polish.

### Suggested Roo mode

- FE Reviewer for comprehensive quality pass.
- FE Implementer for scoped fixes.
- Debugger for failing checks/runtime bugs.
- Architect Lite for final plan/doc alignment only.

### Suggested skills

- frontend-design
- frontend-quality
- react-next-performance
- webapp-testing

### Suggested MCP usage

- filesystem: inspect final files and route coverage.
- chrome-devtools: console, responsive, Lighthouse-style checks if useful.
- playwright: route smoke and responsive tests.

### Git commit checkpoint message

`chore(fe): polish responsive UI and testing readiness`

---

## Recommended next prompts after this plan

### Phase 2 App shell + route groups prompt

```txt
You are FE Implementer.

Implement Phase 2: App shell + route groups for HorseTrack.

Use `docs/fe_generation_plan.md` as the phase plan.
Use these as source of truth:
- `docs/topic.md`
- `docs/planning_fe.md`
- `docs/design.md`
- `docs/ui_generation_rules.md`
- `docs/frontend_generation_prompt.md`
- `PROJECT_AI_NOTES.md`

Current status:
- Phase 1 Foundation is DONE.
- F1-inspired frontend foundation is completed.
- `fe/app/globals.css` has dark motorsport theme.
- Base layout components exist:
  - `fe/components/layout/app-header.tsx`
  - `fe/components/layout/app-sidebar.tsx`
  - `fe/components/layout/page-header.tsx`
- Landing page exists.
- `npm run lint` passed.
- `npm run build` passed.

Implement only Phase 2:
- App shell + route groups.
- Public/auth/dashboard/role layouts.
- Placeholder pages for route map.
- Shared empty/loading/error UI.
- Mock data only.
- No backend integration.
- No full business screens yet.
- No RaceRound, Stage progression, Bracket, Playoff, Grand Final, Qualification system, Season points, Advanced leaderboard aggregation, Payment/betting flow.

After implementation:
- run `npm run lint`
- run `npm run build`
- run preview/dev server if possible
- inspect UI with Chrome DevTools
- run Playwright responsive smoke if available

Expected response:
- changed files
- created components/routes
- verification results
- known gaps/next phase notes
```

### Phase 4A Admin dashboard foundation prompt

```txt
You are FE Implementer.

Implement only Phase 4A: Admin dashboard foundation for HorseTrack.

Use `docs/fe_generation_plan.md` as the phase plan.
Generate only:
- admin overview
- stat cards
- quick actions
- navigation entry points

Use mock data only. Do not implement tournament/race CRUD, registration approval, result publish, backend integration, or OUT OF MVP flows.

After implementation, run `npm run lint` and `npm run build`, then inspect the admin dashboard UI.
```

### Phase 8A Public race browsing + detail prompt

```txt
You are FE Implementer.

Implement only Phase 8A: Public race browsing + detail for HorseTrack.

Use `docs/fe_generation_plan.md` as the phase plan.
Generate only:
- public race list
- public race detail
- live race view
- published result/ranking
- login CTA for spectator prediction

Use mock data only. Do not implement spectator prediction actions, notifications, backend integration, betting/payment, or OUT OF MVP flows.

After implementation, run `npm run lint` and `npm run build`, then inspect public race routes in preview.
```
