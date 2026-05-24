# FE Team Collaboration Rules — HorseTrack

## Context

HorseTrack frontend is ready for parallel FE work.

Completed baseline:

- Phase 1 Foundation: DONE
- Phase 2 App shell: DONE
- Phase 3 Auth UI: DONE
- Phase 4A Admin dashboard: DONE
- Phase 4C Race management: DONE

Current strategy:

- FE is mock-first only.
- Backend/API integration is not required yet.
- Generate and implement one phase/subphase at a time.
- Race is the main business unit.
- Tournament is only a container for independent races.

## 1. Team workflow

### Branch naming

Use short, scoped branch names:

- `fe/phase-4d-registration-results`
- `fe/phase-4b-tournaments`
- `fe/phase-5-owner-registration`
- `fe/phase-6-jockey-assignment`
- `fe/phase-7-referee-result-entry`
- `fe/phase-8a-public-races`
- `fe/phase-8b-spectator-prediction`
- `fe/phase-9-polish`

### Branch scope

- One phase or subphase per branch.
- Do not mix unrelated modules in one branch.
- Do not generate or rewrite the full app.
- Keep diffs small and reviewable.
- Prefer incremental UI composition over broad rewrites.

### Commits

- Commit small logical changes.
- Suggested format:
  - `feat(fe): add owner race registration UI`
  - `fix(fe): align race table responsive layout`
  - `docs(fe): update phase notes`
- Avoid giant commits with mixed routing, styling, mock data, and docs changes.

### Notes after major changes

After major phase/subphase work, update stable notes:

- `PROJECT_AI_NOTES.md`
- Relevant docs only if route/scope/convention changed

Record:

- What was completed
- Verification result
- Scope kept/changed
- Any residual risk

## 2. Ownership rules

### FE Lead owns

- Frontend architecture
- Route/layout boundaries
- Design system consistency
- Shared components
- Review quality gate
- Final decisions for shared abstractions
- Updates touching high-risk shared files

### Secondary FE owns

- Assigned feature modules
- Feature-local mock data
- Feature-local business components
- Page composition inside assigned phase/subphase
- Local responsive/accessibility checks

### Shared component rule

Before creating a component:

1. Check existing shared components in `fe/components`.
2. Check existing business components in `fe/features/<feature>/components`.
3. Reuse or extend nearby patterns.
4. Create new shared components only if generic across multiple features.
5. Keep feature-specific UI inside the feature folder.

## 3. Files that should not be changed casually

Do not edit these without FE Lead review/approval:

- `fe/app/globals.css`
- `fe/app/layout.tsx`
- `fe/components/layout/*`
- `fe/constants/navigation.ts`
- `docs/topic.md`
- `docs/planning_fe.md`
- `docs/design.md`

Allowed only when:

- The assigned phase requires it.
- The change is minimal.
- Impact on existing routes/components is checked.
- Notes are updated if architecture/design scope changes.

## 4. Folder convention

Use this structure consistently:

- Generic shared UI → `fe/components`
- Business components → `fe/features/<feature>/components`
- Mock data → `fe/features/<feature>/mock-*.ts`
- Feature-local types → `fe/features/<feature>/types.ts`
- Shared types → `fe/types`
- Shared constants → `fe/constants`
- Shared utilities → `fe/lib`

Page files in `fe/app` should mostly compose feature/shared components.

Rules:

- No random business components directly inside page folders.
- No feature mock data directly inside page folders.
- No duplicated helper/type files when a feature boundary already exists.
- Page files may contain simple composition only.

## 5. Component rules

- Use TypeScript.
- Component names use PascalCase.
- Component filenames use kebab-case.
- Props must be reusable and readable.
- Prefer explicit prop types over loose `any`.
- Keep client components minimal; add `"use client"` only when state, event handlers, forms, dialogs, charts, or browser APIs are required.
- Use existing loading/error/empty patterns.
- Add accessible labels for forms, icon buttons, dialogs, and navigation.

Do not duplicate existing race components:

- Do not create another `RaceCard`.
- Do not create another `RaceTable`.
- Do not create another generic `StatusBadge`.
- Reuse existing race components from `fe/features/races/components`.
- Reuse shared `StatusBadge` from `fe/components/ui/status-badge.tsx`.
- Domain-specific status mapping can live near each feature.

## 6. Styling rules

Design direction:

- F1-inspired dark motorsport UI
- Premium racing dashboard feel
- High contrast
- Strong red accent for priority actions/status
- Clean spacing
- Race-status-focused visuals

Rules:

- Use design tokens/classes already defined in `fe/app/globals.css`.
- Follow the design system in `docs/design.md`.
- Do not introduce random colors.
- Do not overuse red outside primary CTA, key status, danger, or alert moments.
- Do not copy Formula 1 assets, logo, official layout, or proprietary fonts.
- Do not use heavy glassmorphism.
- Use subtle shadows/borders only where useful.
- Responsive by default.
- Mobile touch targets must stay usable.
- Tables/cards must remain readable on mobile/tablet.

## 7. Scope rules

Strictly do not create or imply these MVP concepts:

- RaceRound
- Stage
- Bracket
- Playoff
- Grand Final
- Qualification
- Season points
- Advanced tournament progression
- Complex multi-race leaderboard aggregation
- Betting/payment
- Backend/API integration unless explicitly assigned
- Socket/realtime integration unless explicitly assigned
- Real auth/token handling unless explicitly assigned

Use correct wording:

- Use “Race” instead of “round/stage”.
- Use “Race result” instead of “qualification”.
- Use “Race schedule” instead of “tournament stage”.
- Use “Race ranking” for ranking inside one race.
- Tournament leaderboard is optional/simple only.

## 8. Verification rules

Default checks after FE code changes:

```bash
npm run lint
npm run build
```

Run commands inside `fe/`.

Docs-only changes may skip lint/build, but final response must say checks were skipped because no FE runtime code changed.

Use Playwright/Chrome DevTools only for important checkpoints:

- Race management
- Owner registration flow
- Referee result entry
- Spectator prediction
- Final polish

For visual checkpoints, inspect:

- Console errors
- Responsive desktop/tablet/mobile
- Keyboard/focus basics
- Form labels and button names
- Empty/loading/error state behavior

## 9. PR/review checklist

Before PR/review, confirm:

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No duplicate components.
- [ ] Mock data is separated from UI.
- [ ] Components are in correct folders.
- [ ] Existing shared/race components reused where possible.
- [ ] Responsive behavior checked.
- [ ] Accessible labels/names exist.
- [ ] No out-of-MVP concepts.
- [ ] Consistent spacing/colors.
- [ ] No backend/API calls.
- [ ] No real auth/token handling.
- [ ] No copied Formula 1 assets/logo/fonts.
- [ ] Notes updated after major changes.

## 10. Recommended task split

### FE Lead

Recommended ownership:

- Phase 4D: Registration approval + result publish
- Phase 7: Referee result entry
- Phase 9: Polish + responsive + testing
- Review/architecture across all FE branches
- Shared component/design-system decisions

Reason:

- These phases touch higher-risk workflows, review gates, result state, shared UX, and final consistency.

### Secondary FE

Recommended ownership:

- Phase 4B: Tournament management
- Phase 5: Owner horse + race registration
- Phase 6: Jockey assignment
- Phase 8A: Public race browsing + detail
- Phase 8B: Spectator prediction

Reason:

- These can be developed as feature modules using existing layout/race components and isolated mock data.

## 11. Collaboration handoff format

Each FE member should include this in branch/PR notes:

```txt
Scope:
- Phase/subphase:
- Routes touched:
- Feature folders touched:

Reused:
- Shared components:
- Race components:

Mock data:
- Files:

Verification:
- npm run lint:
- npm run build:
- Visual check if any:

Scope guard:
- No backend/API calls:
- No out-of-MVP concepts:
- Notes updated if needed:
```

## 12. Default rule

When unsure:

1. Keep Race as the core object.
2. Keep Tournament as container only.
3. Reuse existing components first.
4. Keep data mocked and local.
5. Ask FE Lead before touching shared architecture/design files.
