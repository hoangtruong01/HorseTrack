# HorseTrack Runtime & Code Verification Report

Generated: 2026-06-11

Scope: code/runtime verification of `docs/audit/HorseTrack_Full_Flow_Audit.md`. No app source code changed. Backend lint was intentionally skipped because `be/package.json` defines `lint` with `--fix`.

## 1. Summary

Repo structure confirmed: `fe/`, `be/`, `mobi/`, `docs/` exist.

Stacks:

| Area | Stack | Evidence |
|---|---|---|
| Frontend | Next.js 16.2.9, React 19.2.4, TypeScript, Tailwind 4, React Query | `fe/package.json` |
| Backend | NestJS 11, Mongoose 9, MongoDB, Passport JWT/local, Swagger, Helmet, Socket.io | `be/package.json`, `be/src/main.ts` |
| Mobile | Expo 54, Expo Router 6, React Native 0.81.5, React 19.1 | `mobi/package.json` |

API base URL:

- Backend global prefix: `/api/v1` in `be/src/main.ts`.
- Backend default port: `3000`.
- Frontend dev port: `3001`.
- Frontend `fe/lib/api-client.ts` uses `NEXT_PUBLIC_API_URL ?? "http://localhost:3000"`, then appends `/api/v1`.
- Many `fe/app/api/**` proxy routes hardcode `http://localhost:3000/api/v1`.

Auth/session:

- Backend issues JWT `accessToken` and `refreshToken` in `be/src/auth/auth.service.ts`.
- Frontend stores tokens in HttpOnly cookies `access_token` and `refresh_token` via `fe/app/api/auth/*` routes.
- Client API reads token through `GET /api/auth/token`, then sends Bearer token to backend.

Role/RBAC:

- Backend roles enum: `admin`, `owner`, `jockey`, `referee`, `spectator`, `counter_staff` in `be/src/users/schemas/user.schema.ts`.
- Backend RBAC uses `JwtAuthGuard`, `RolesGuard`, and `@Roles(...)`.
- Frontend middleware role-gates only `/admin`, `/owner`, `/jockey`, `/referee`.

Context gap: `AGENTS.md` asks to read `MASTER_GUIDE.md`, but that file is not present at repo root during this check.

## 2. Commands Run

| Command | Result | Notes |
|---|---|---|
| `cd be && npm run build` | PASS | `nest build` completed. Matches Hermes. |
| `cd be && npm test -- --runInBand` | PASS | 3 suites, 11 tests passed. Matches Hermes. |
| `cd be && npm run lint` | SKIPPED | Required skip: script is `eslint ... --fix`, may modify code. |
| `cd fe && npm run lint` | FAIL | 3 errors, 17 warnings. Errors all in `fe/app/(dashboard)/spectator/page.tsx`. Matches Hermes. |
| `cd fe && npm run build` | FAIL | Turbopack failed with 3 module resolution errors: `date-fns`, `date-fns/locale`, `react-day-picker`. Matches build symptom, but package.json nuance differs. |
| `cd mobi && npx tsc --noEmit` | FAIL | Missing installed `expo-image-picker`; typed route errors for `/competitor/*`, `/operations/*`. Matches Hermes. |
| `cd fe && npm ls date-fns react-day-picker --depth=0` | FAIL | `fe@0.1.0` shows empty dependency tree. Packages are declared in `package.json` but absent from `node_modules`. |
| `cd mobi && npm ls expo-image-picker --depth=0` | FAIL | Declared in `mobi/package.json` but absent from `node_modules`. |

## 3. Confirmed Critical Blockers

1. FE build blocker confirmed: `date-fns`, `date-fns/locale`, `react-day-picker` cannot resolve from `fe/components/ui/date-picker.tsx` and `fe/components/ui/calendar.tsx`.
2. FE lint blocker confirmed: 3 `no-explicit-any` errors in `fe/app/(dashboard)/spectator/page.tsx`.
3. Mobile typecheck blocker confirmed: missing installed `expo-image-picker` plus invalid Expo typed route hrefs.
4. Frontend RBAC gap confirmed: `/spectator`, `/counter-staff`, `/profile`, `/settings` not protected by `fe/middleware.ts`.
5. Public guest flow placeholder confirmed: public tournaments/races pages use `RoutePlaceholder` and mock labels instead of live backend API.
6. API URL hardcoding confirmed: many `fe/app/api/**` routes use `http://localhost:3000/api/v1`.

Nuance different from Hermes:

- `date-fns` and `react-day-picker` are already listed in `fe/package.json`; they are missing from `fe/node_modules` install state.
- `expo-image-picker` is already listed in `mobi/package.json`; it is missing from `mobi/node_modules` install state.
- Backend guard decorators that appear before constructors are class decorators, not constructor decorators, in checked files. No constructor-level `@UseGuards(...)` bug was confirmed.

## 4. Frontend Build Check

Result: FAIL.

Exact main errors:

- `./components/ui/date-picker.tsx:3:1 Module not found: Can't resolve 'date-fns'`
- `./components/ui/date-picker.tsx:4:1 Module not found: Can't resolve 'date-fns/locale'`
- `./components/ui/calendar.tsx:3:1 Module not found: Can't resolve 'react-day-picker'`

Import evidence:

| File | Import |
|---|---|
| `fe/components/ui/date-picker.tsx:3` | `import { format, parseISO } from "date-fns";` |
| `fe/components/ui/date-picker.tsx:4` | `import { vi } from "date-fns/locale";` |
| `fe/components/ui/calendar.tsx:3` | `import { DayPicker } from "react-day-picker";` |

Dependency state:

| Package | In `fe/package.json` | In `fe/node_modules` | Result |
|---|---:|---:|---|
| `date-fns` | Yes, `^3.6.0` | No | Build fails |
| `react-day-picker` | Yes, `^8.10.2` | No | Build fails |

Suggested later fix: run an approved dependency restore/install in `fe`, then rerun `npm run build`. Do not change code unless dependency restore still fails.

## 5. Frontend Lint Check

Result: FAIL.

Errors:

| File | Line | Problem | Suggested type | Effort |
|---|---:|---|---|---|
| `fe/app/(dashboard)/spectator/page.tsx` | 21 | `useState<any>(null)` for `dashboardStats` | Use a concrete dashboard stats interface matching `dashboardApi.getSpectatorStats()` response | S |
| `fe/app/(dashboard)/spectator/page.tsx` | 74 | `(statusOrder as any)[a.status]` | Type `statusOrder` as `Record<RaceItem["status"], number>` or `Partial<Record<string, number>>` | S |
| `fe/app/(dashboard)/spectator/page.tsx` | 75 | `(statusOrder as any)[b.status]` | Same as line 74 | S |

Warnings also exist: unused imports/vars and `next/no-img-element`, but the blocking lint errors are only the 3 `any` findings above.

## 6. Backend Build/Test Check

Backend build: PASS.

Backend tests: PASS.

Observed result:

```text
Test Suites: 3 passed, 3 total
Tests:       11 passed, 11 total
```

Backend lint: not run by requirement. Script is unsafe for audit-only mode:

```json
"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
```

## 7. Mobile Typecheck Check

Result: FAIL.

Main errors:

| File | Error |
|---|---|
| `mobi/app/(owner)/horses.tsx:6` | Cannot find module `expo-image-picker` |
| `mobi/app/(tabs)/profile.tsx:70` | `"/competitor/dashboard"` rejected by Expo Router typed routes |
| `mobi/app/(tabs)/profile.tsx:89` | `"/operations/referee/assigned-races"` rejected |
| `mobi/app/(tabs)/profile.tsx:91` | `"/operations/counter/scan"` rejected |
| `mobi/app/competitor/dashboard.tsx:68,79,90` | `/competitor/*` hrefs rejected |
| `mobi/app/operations/referee/assigned-races.tsx:125,133,141` | `/operations/referee/*` hrefs rejected |

Dependency nuance: `expo-image-picker` is declared in `mobi/package.json` as `~17.0.11`, but `npm ls expo-image-picker --depth=0` is empty and `node_modules/expo-image-picker` does not exist.

## 8. Frontend RBAC/Middleware Check

`fe/middleware.ts` currently protects:

| Route prefix | Required role |
|---|---|
| `/admin` | `admin` |
| `/owner` | `owner` |
| `/jockey` | `jockey` |
| `/referee` | `referee` |

Routes missing from matcher and `isDashboardRoute`:

| Route | Expected role/access | Logged-out access risk | Wrong-role access risk |
|---|---|---:|---:|
| `/spectator` | `spectator` | Yes | Yes |
| `/counter-staff` | `counter_staff` | Yes | Yes |
| `/profile` | logged-in user | Yes | N/A by role, but unauthenticated risk |
| `/settings` | likely logged-in user | Yes | N/A by role, but unauthenticated risk |

Suggested later patch:

- Add `/spectator/:path*`, `/counter-staff/:path*`, `/profile`, `/settings` to matcher.
- Extend role gating for `spectator` and `counter_staff`.
- Decide whether `/settings` is public, main, or authenticated-only before patching.

## 9. Backend Guard/RBAC Check

Constructor guard finding: not confirmed. In checked controllers, `@UseGuards(...)` before `export class` is a valid class decorator. It is visually near the constructor but not attached to the constructor.

Checked modules:

| Module | Guard status | Notes |
|---|---|---|
| `horses` | Class `JwtAuthGuard`; method `RolesGuard` where role-gated | No constructor decorator bug. `GET /horses/:id` is authenticated via class guard but no role restriction. |
| `race-checks` | Class `JwtAuthGuard`; referee methods use `RolesGuard` | `GET /race-checks/race/:raceId` is any authenticated user. |
| `referee-assignments` | Class `JwtAuthGuard`; admin/referee methods use `RolesGuard` | `GET /referee-assignments/race/:raceId` is any authenticated user. |
| `race-violations` | Class `JwtAuthGuard`; create/admin list role-gated | `GET /race-violations/race/:raceId` is any authenticated user. |
| `referee-reports` | Method-level guards | `POST` referee-only, `GET /race/:raceId` any authenticated, `GET /` admin-only. |
| `wallet` | Class `JwtAuthGuard, RolesGuard`; method roles | Correct private posture for wallet endpoints. |
| `registrations` | Class `JwtAuthGuard, RolesGuard`; some methods omit `@Roles` | `GET /registrations` and `GET /registrations/:id` allow any authenticated role despite summary “Admin / Spectators”. Not public, but RBAC is broad. |
| `race-results` | Method-level guards; public-ish result reads via `OptionalJwtAuthGuard` | Mutations are protected. Public reads appear intentional. |

No method using only `RolesGuard` without an effective `JwtAuthGuard` was confirmed in the checked files. Cases such as `@UseGuards(RolesGuard)` in `horses`, `race-checks`, `race-violations`, `referee-assignments`, and `reward-point-ledger` are covered by class-level `@UseGuards(JwtAuthGuard)`.

Backend role registration note: `RegisterDto` blocks `admin` and `counter_staff`, but allows `spectator`, `owner`, `jockey`, and `referee`. Error message says “spectator or owner roles”, which does not match the allowed list.

## 10. Public Guest Flow Check

Frontend public pages:

| Page | Current state | API used |
|---|---|---|
| `fe/app/(public)/tournaments/page.tsx` | `RoutePlaceholder`, `Mock containers` | None |
| `fe/app/(public)/tournaments/[tournamentId]/page.tsx` | `RoutePlaceholder`, `Mock id` | None |
| `fe/app/(public)/races/page.tsx` | `RoutePlaceholder`, `4 mock`, `1 mock` | None |
| `fe/app/(public)/races/[raceId]/page.tsx` | `RoutePlaceholder`, `Mock id` | None |

Backend corresponding APIs exist:

| API | Backend evidence | Public? |
|---|---|---:|
| `GET /api/v1/tournaments` | `be/src/tournaments/tournaments.controller.ts` | Yes |
| `GET /api/v1/tournaments/:id` | same | Yes |
| `GET /api/v1/races` | `be/src/races/races.controller.ts` | Yes |
| `GET /api/v1/races/:id` | same | Yes |
| `GET /api/v1/rankings/tournament/:id/horses` | `be/src/rankings/rankings.controller.ts` | Yes |
| `GET /api/v1/rankings/tournament/:id/jockeys` | same | Yes |
| `GET /api/v1/rankings/global/horses` | same | Yes |
| `GET /api/v1/rankings/global/jockeys` | same | Yes |
| `GET /api/v1/race-results/race/:raceId` | `be/src/race-results/race-results.controller.ts` | Optional JWT |
| `GET /api/v1/race-results/tournament/:tournamentId` | same | Optional JWT |

Gap: backend has public guest APIs, but public frontend does not call them.

## 11. Wallet/Reward Code Flow Check

Backend wallet endpoints:

| Purpose | Endpoint | Roles |
|---|---|---|
| Current user transaction history | `GET /wallet/history` | Any authenticated user reaching class guard |
| All wallet transactions | `GET /wallet/all-transactions` | `admin` |
| All cashout/reward requests | `GET /wallet/cashout/all` | `admin`, `counter_staff` |
| Lookup specific code | `GET /wallet/cashout/lookup?code=...` | `admin`, `counter_staff` |
| Process cashout | `PATCH /wallet/cashout/:id/process` | `admin`, `counter_staff` |

Frontend flow:

- `fe/app/(dashboard)/admin/wallet/page.tsx` keeps tabs separate: `transactions` uses `walletApi.allTransactions`, `cashouts` uses `walletApi.allCashouts`.
- `fe/app/(dashboard)/counter-staff/redemptions/page.tsx` separates queue/history from code lookup using `walletApi.lookupCashout(code)`.
- `fe/app/(dashboard)/counter-staff/page.tsx` labels a table “transaction history” but loads `walletApi.allCashouts` and filters the local cashout list by `redemptionCode`.

Confirmed issues:

| Issue | Evidence | Impact |
|---|---|---|
| Counter dashboard search filters cashout list by code | `counter-staff/page.tsx` `recentCashouts.filter(...)` | Search can hide rows in the displayed history. This is cashout history, not full transaction history. |
| Backend lookup regex injection risk | `wallet.service.ts` uses `new RegExp(`^${code}$`, 'i')` | Special regex chars can alter matching or throw invalid regex. |
| Counter route not middleware-protected | `fe/middleware.ts` matcher omits `/counter-staff/:path*` | Logged-out/wrong-role users can reach the page shell. Backend still protects data endpoints. |

Expected flow alignment:

- Full transaction history should stay separate from lookup.
- Code lookup should only identify one cashout/redemption request for accept/reject/paid.
- Counter dashboard should not present filtered cashouts as full transaction history unless that is the explicit requirement.

## 12. API URL / Environment Check

Hardcoded localhost examples:

| Area | File(s) | Pattern |
|---|---|---|
| Admin proxy | `fe/app/api/admin/[...path]/route.ts`, `fe/app/api/admin/results/route.ts`, `fe/app/api/admin/tournaments/route.ts` | `http://localhost:3000/api/v1` |
| Auth proxy | `fe/app/api/auth/login/route.ts`, `register/route.ts`, `google/route.ts`, `me/route.ts`, `refresh/route.ts` | `http://localhost:3000/api/v1` |
| Owner/Jockey/Referee proxies | many files under `fe/app/api/owner`, `fe/app/api/jockey`, `fe/app/api/referee` | `http://localhost:3000/api/v1` |
| Spectator/notifications/uploads/wallet proxies | `fe/app/api/spectator/results/route.ts`, `notifications/route.ts`, `uploads/route.ts`, `wallet/route.ts` | `http://localhost:3000/api/v1` |

Env-aware file:

| File | Behavior |
|---|---|
| `fe/lib/api-client.ts` | `const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1";` |

Risk: deploy/demo on another backend host will break all proxy routes unless the machine happens to expose backend at `localhost:3000`. Suggested later standardization: shared server-side backend URL helper, likely `process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"`, then replace repeated literals.

## 13. Mock Data / Placeholder Check

| Area | File | Mock/Hardcode | Ảnh hưởng | Nên thay bằng API nào | Priority |
| ---- | ---- | ------------- | --------- | --------------------- | -------- |
| Public tournaments | `fe/app/(public)/tournaments/page.tsx` | `RoutePlaceholder`, `Mock containers` | Guest cannot view real tournaments | `GET /api/v1/tournaments` | P0 |
| Public tournament detail | `fe/app/(public)/tournaments/[tournamentId]/page.tsx` | `RoutePlaceholder`, `Mock id` | Fake detail page | `GET /api/v1/tournaments/:id`, `GET /api/v1/races/tournament/:id` | P0 |
| Public races | `fe/app/(public)/races/page.tsx` | `RoutePlaceholder`, mock counts | Guest cannot view real races | `GET /api/v1/races` | P0 |
| Public race detail | `fe/app/(public)/races/[raceId]/page.tsx` | `RoutePlaceholder`, `Mock id` | Fake race detail | `GET /api/v1/races/:id`, `GET /api/v1/race-results/race/:id` | P0 |
| Admin audit logs | `fe/app/(dashboard)/admin/audit-logs/page.tsx` | `mockAuditLogs` | Security/audit UI is fake | `GET /api/v1/audit-logs` | P1 |
| Audit store | `fe/features/audit/mock-audit-logs.ts` | Mutable mock logs | Fake audit trail | backend audit logs | P1 |
| Register UX | `fe/app/(auth)/register/page.tsx`, `fe/features/auth/components/register-form.tsx` | “mock profile request”, “mock registration” text | Confusing if real registration works | `POST /api/v1/auth/register` already proxied | P1 |
| Auth demo | `fe/features/auth/components/login-form.tsx` | Demo account shortcuts/defaults | Demo-only behavior in production UI | Seed/demo docs or hide in prod | P2 |
| Wallet fallback | `fe/app/api/wallet/route.ts` | fallback mock balances | Can mask backend failures | `GET /api/v1/wallet/history` | P1 |
| Notifications fallback | `fe/app/api/notifications/route.ts` | fallback mock notifications | Can mask backend failures | `GET /api/v1/notifications/my-notifications` | P2 |
| Dashboard widgets | `fe/features/dashboard/*mock-admin-dashboard*` | mock admin overview/race status data | Admin landing can show fake metrics | `GET /api/v1/dashboard/admin` | P1 |
| Legacy race feature components | `fe/features/races/mock-races.ts` and consumers | mock race data/types | Risk if reused in active routes | `GET /api/v1/races`, `GET /api/v1/registrations` | P2 |
| Referee report legacy components | `fe/features/referee-reports/mock-referee-data.ts` and consumers | mock checklist/violations/results | Fake referee flow if mounted | `race-checks`, `race-violations`, `race-results`, `referee-reports` APIs | P2 |
| Registrations feature types | `fe/features/registrations/mock-registrations.ts` imports | mock type source | Type naming suggests stale mock | `GET /api/v1/registrations` | P2 |
| Results feature components | `fe/features/results/mock-results.ts` | mock publish/review data | Fake results if mounted | `GET /api/v1/race-results/...` | P2 |
| Mobile admin ranking | `mobi/app/(admin)/rankings.tsx` | comment: sort baseSpeed as mock rank | Ranking mismatch | `GET /api/v1/rankings/global/horses` | P2 |
| Mobile jockey performance | `mobi/app/(jockey)/performance.tsx` | `any`, “Mock or simplify” | Fake performance summary | assignments/results by jockey | P2 |
| Mobile counter deposit | `mobi/app/operations/counter/quick-deposit.tsx` | demo mode | Demo-only business flow | `POST /api/v1/wallet/deposit/for-user/:userId` | P2 |

## 14. Fix Priority List

| Priority | Task | File/Area | Reason | Suggested Agent |
|---|---|---|---|---|
| P0 | Restore frontend installed deps | `fe/node_modules`, lockfile/install state | FE build cannot resolve declared deps | Codex with permission / Human |
| P0 | Fix spectator lint `any` | `fe/app/(dashboard)/spectator/page.tsx` | FE lint fails | Codex |
| P0 | Protect missing FE routes | `fe/middleware.ts` | Logged-out/wrong-role page shell exposure | Codex |
| P0 | Connect public tournament/race pages | `fe/app/(public)/tournaments*`, `fe/app/(public)/races*` | Guest core flow fake despite backend APIs | Codex |
| P1 | Restore mobile installed deps + typed routes | `mobi` | Mobile typecheck fails | Codex with permission / Expo agent |
| P1 | Standardize API base URL | `fe/app/api/**/*.ts`, `fe/lib/api-client.ts` | Deploy/demo host risk | Codex |
| P1 | Escape cashout lookup regex | `be/src/wallet/wallet.service.ts` | Regex injection/invalid regex risk | Codex |
| P1 | Clarify registration list roles | `be/src/registrations/registrations.controller.ts` | Any authenticated user can list/read registrations | Codex/Human |
| P1 | Replace admin audit mock | `fe/app/(dashboard)/admin/audit-logs/page.tsx` | Fake security logs | Codex |
| P2 | Align register role message/allowed roles | `be/src/auth/dto/register.dto.ts`, FE register | Message says spectator/owner but code allows jockey/referee | Codex/Human |

## 15. Recommended Next Patch Order

1. Dependency restore only: run approved `npm install` or equivalent in `fe`, verify `npm run build`.
2. Fix FE lint `any` in spectator page, verify `npm run lint`.
3. Patch `fe/middleware.ts` for `/spectator`, `/counter-staff`, `/profile`, and decided `/settings` behavior; verify redirect/forbidden manually or with small smoke tests.
4. Connect public tournaments/races/detail pages to existing backend APIs; verify guest pages render real data/empty states.
5. Fix wallet lookup regex and counter dashboard wording/search separation; verify wallet tests or targeted backend tests.
6. Standardize API URL helper across `fe/app/api/**`; verify auth/login and one role proxy.
7. Mobile restore/install then typed route patch; verify `npx tsc --noEmit`.

## 16. Questions Before Fixing

1. Is `/settings` intended to be authenticated-only, or public/main shell?
2. Should self-registration allow `jockey` and `referee`, or only `spectator` and `owner` as the DTO message says?
3. Should `/registrations` list/detail be admin/spectator-only, or any authenticated role?
4. For counter staff, should dashboard show cashout/redemption history only, or full wallet transaction history?
5. Is mobile in demo scope now, or should fixes prioritize web/backend first?
