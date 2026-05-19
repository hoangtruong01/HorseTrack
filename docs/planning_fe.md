# FE Planning — Horse Racing Tournament Management System

## 1. Mục tiêu

Tài liệu này chuẩn hóa frontend planning cho dự án **Horse Racing Tournament Management System** theo stack hiện tại:

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui hoặc custom clean components
- TanStack Query
- React Hook Form + Zod
- Socket.IO Client
- Recharts
- TanStack Table
- dnd-kit
- Backend NestJS REST API
- JWT Auth + RBAC Authorization
- MongoDB phía backend

## 2. Quyết định kiến trúc

### 2.1 Dùng

| Nhóm         | Công nghệ                      | Ghi chú                                  |
| ------------ | ------------------------------ | ---------------------------------------- |
| Framework    | Next.js App Router             | Routing theo filesystem trong `app/`     |
| Language     | TypeScript                     | Strict-first                             |
| UI           | TailwindCSS + shadcn/ui/custom | Ưu tiên reusable primitive               |
| Server state | TanStack Query                 | Cache, mutation, invalidation            |
| Form         | React Hook Form + Zod          | Schema validation thống nhất             |
| Realtime     | Socket.IO Client               | Live race, notification, status update   |
| Chart        | Recharts                       | Dashboard analytics                      |
| Table        | TanStack Table                 | Admin/list screens                       |
| Drag/drop    | dnd-kit                        | Kanban approval, schedule reorder        |
| Auth         | JWT + cookie/session strategy  | Guard bằng middleware/layout/server util |

### 2.2 Không dùng

| Không dùng                | Lý do                                         |
| ------------------------- | --------------------------------------------- |
| `react-router-dom`        | Next App Router đã xử lý routing              |
| `ProtectedRoute` kiểu SPA | Guard nên ở middleware/layout/server-side     |
| `src/pages`               | Không phù hợp App Router                      |
| `routes/index.tsx`        | Không cần route config thủ công               |
| Vite/CRA mindset          | Project đang là Next.js                       |
| Redux mặc định            | TanStack Query + local/Zustand nhẹ đủ cho MVP |

## 3. Nguyên tắc frontend

1. Route nằm trong `app/`.
2. Business boundary nằm trong `features/`.
3. Shared UI nằm trong `components/`.
4. HTTP call nằm trong `services/` hoặc API layer feature-specific.
5. Query/mutation hook nằm gần feature.
6. Form schema nằm trong feature `schemas/`.
7. Auth/RBAC kiểm tra theo 3 tầng:
   - `middleware.ts`: redirect sơ cấp.
   - route layout/server util: role guard chính.
   - client permission hook: ẩn/hiện UI, không thay backend authorization.
8. Server state không đưa vào global store.
9. Realtime event phải invalidate/update TanStack Query có kiểm soát.
10. Component business-specific không đặt vào shared global.

## 4. Cấu trúc thư mục đề xuất

```txt
fe/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── forbidden/
│   │   └── page.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── tournaments/
│   │   │   ├── page.tsx
│   │   │   └── [tournamentId]/page.tsx
│   │   ├── races/
│   │   │   ├── page.tsx
│   │   │   └── [raceId]/page.tsx
│   │   └── leaderboards/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── admin/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── users/page.tsx
│       │   ├── tournaments/page.tsx
│       │   ├── tournaments/new/page.tsx
│       │   ├── tournaments/[tournamentId]/page.tsx
│       │   ├── approvals/page.tsx
│       │   ├── approvals/horses/page.tsx
│       │   ├── approvals/registrations/page.tsx
│       │   ├── approvals/results/page.tsx
│       │   ├── races/page.tsx
│       │   ├── results/page.tsx
│       │   ├── rewards/page.tsx
│       │   └── notifications/page.tsx
│       ├── owner/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── horses/page.tsx
│       │   ├── horses/new/page.tsx
│       │   ├── horses/[horseId]/page.tsx
│       │   ├── tournaments/page.tsx
│       │   ├── registrations/page.tsx
│       │   ├── jockey-recruitment/page.tsx
│       │   ├── race-tracking/page.tsx
│       │   └── rewards/page.tsx
│       ├── jockey/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── invitations/page.tsx
│       │   ├── invitations/[invitationId]/page.tsx
│       │   ├── schedule/page.tsx
│       │   ├── achievements/page.tsx
│       │   └── profile/page.tsx
│       ├── referee/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── assignments/page.tsx
│       │   ├── pre-race-check/page.tsx
│       │   ├── pre-race-check/[raceId]/page.tsx
│       │   ├── live-monitoring/page.tsx
│       │   ├── live-monitoring/[raceId]/page.tsx
│       │   ├── result-entry/page.tsx
│       │   ├── result-entry/[raceId]/page.tsx
│       │   └── reports/page.tsx
│       └── spectator/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── races/page.tsx
│           ├── races/[raceId]/page.tsx
│           ├── predictions/page.tsx
│           ├── leaderboards/page.tsx
│           ├── rewards/page.tsx
│           └── notifications/page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── data-display/
│   ├── feedback/
│   └── forms/
├── features/
│   ├── auth/
│   ├── tournaments/
│   ├── horses/
│   ├── races/
│   ├── registrations/
│   ├── jockey-invitations/
│   ├── referee-checklist/
│   ├── live-race/
│   ├── predictions/
│   ├── rewards/
│   ├── notifications/
│   └── dashboard/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── constants/
├── providers/
└── middleware.ts
```

## 5. Layout plan theo route group

| Route group                 | URL thật                      | Layout               | Mục đích                       |
| --------------------------- | ----------------------------- | -------------------- | ------------------------------ |
| `app/(public)`              | `/`, `/tournaments`, `/races` | Public header/footer | Landing, public browse         |
| `app/(auth)`                | `/login`, `/register`         | Auth shell           | Guest-only auth flow           |
| `app/(dashboard)`           | role dashboards               | Dashboard shell      | Sidebar/header base            |
| `app/(dashboard)/admin`     | `/admin/*`                    | Admin layout         | Admin RBAC + admin nav         |
| `app/(dashboard)/owner`     | `/owner/*`                    | Owner layout         | Owner RBAC + owner nav         |
| `app/(dashboard)/jockey`    | `/jockey/*`                   | Jockey layout        | Jockey RBAC + mobile-first nav |
| `app/(dashboard)/referee`   | `/referee/*`                  | Referee layout       | Referee RBAC + tablet workflow |
| `app/(dashboard)/spectator` | `/spectator/*`                | Spectator layout     | Spectator RBAC + prediction UX |

## 6. Auth/RBAC plan

### 6.1 Middleware

Dùng `middleware.ts` ở root `fe/`.

Nhiệm vụ:

- User chưa login vào `/admin`, `/owner`, `/jockey`, `/referee`, `/spectator` → redirect `/login`.
- User đã login vào `/login` hoặc `/register` → redirect dashboard theo role.
- Role mismatch → redirect `/forbidden` hoặc dashboard đúng role.

### 6.2 Layout guard

Mỗi role layout gọi server auth util:

```ts
requireRole(["ADMIN"]);
requireRole(["HORSE_OWNER"]);
requireRole(["JOCKEY"]);
requireRole(["REFEREE"]);
requireRole(["SPECTATOR"]);
```

### 6.3 Client permission

Dùng cho UI:

- Ẩn nút approve/reject nếu không có quyền.
- Disable prediction nếu locked.
- Ẩn action publish nếu result chưa approved.

Backend vẫn là nguồn authorization cuối cùng.

## 7. Route plan

### 7.1 Public/Spectator public routes

| URL                           | Role | Page                            | Protected |
| ----------------------------- | ---- | ------------------------------- | --------- |
| `/`                           | All  | Landing Page                    | No        |
| `/tournaments`                | All  | Public tournament list          | No        |
| `/tournaments/[tournamentId]` | All  | Tournament public detail        | No        |
| `/races`                      | All  | Public race list/live list      | No        |
| `/races/[raceId]`             | All  | Race public detail/live tracker | No        |
| `/leaderboards`               | All  | Public ranking                  | No        |

### 7.2 Auth routes

| URL                | Role  | Page            | Protected  |
| ------------------ | ----- | --------------- | ---------- |
| `/login`           | Guest | Login           | Guest-only |
| `/register`        | Guest | Register        | Guest-only |
| `/forgot-password` | Guest | Forgot password | Guest-only |

### 7.3 Admin routes

| URL                                 | Role  | Page                         | Priority |
| ----------------------------------- | ----- | ---------------------------- | -------- |
| `/admin`                            | Admin | Dashboard                    | P0       |
| `/admin/users`                      | Admin | User management              | P2       |
| `/admin/tournaments`                | Admin | Tournament management        | P0       |
| `/admin/tournaments/new`            | Admin | Create tournament            | P0       |
| `/admin/tournaments/[tournamentId]` | Admin | Tournament detail            | P1       |
| `/admin/approvals`                  | Admin | Approval center              | P0       |
| `/admin/approvals/horses`           | Admin | Horse approval               | P0       |
| `/admin/approvals/registrations`    | Admin | Registration approval Kanban | P0       |
| `/admin/approvals/results`          | Admin | Result approval              | P1       |
| `/admin/races`                      | Admin | Race schedule                | P0       |
| `/admin/results`                    | Admin | Result management            | P1       |
| `/admin/rewards`                    | Admin | Reward management            | P2       |
| `/admin/notifications`              | Admin | Notification management      | P2       |

### 7.4 Horse Owner routes

| URL                         | Role        | Page                  | Priority |
| --------------------------- | ----------- | --------------------- | -------- |
| `/owner`                    | Horse Owner | Dashboard             | P1       |
| `/owner/horses`             | Horse Owner | Horse portfolio       | P0       |
| `/owner/horses/new`         | Horse Owner | Create horse          | P0       |
| `/owner/horses/[horseId]`   | Horse Owner | Horse detail          | P1       |
| `/owner/tournaments`        | Horse Owner | Available tournaments | P1       |
| `/owner/registrations`      | Horse Owner | Registration status   | P1       |
| `/owner/jockey-recruitment` | Horse Owner | Invite jockey         | P1       |
| `/owner/race-tracking`      | Horse Owner | My race tracking      | P1       |
| `/owner/rewards`            | Horse Owner | Owner rewards         | P2       |

### 7.5 Jockey routes

| URL                                  | Role   | Page                 | Priority |
| ------------------------------------ | ------ | -------------------- | -------- |
| `/jockey`                            | Jockey | Mobile action center | P0       |
| `/jockey/invitations`                | Jockey | Invitation inbox     | P0       |
| `/jockey/invitations/[invitationId]` | Jockey | Invitation detail    | P0       |
| `/jockey/schedule`                   | Jockey | Race schedule        | P1       |
| `/jockey/achievements`               | Jockey | Achievements         | P2       |
| `/jockey/profile`                    | Jockey | Profile              | P2       |

### 7.6 Referee routes

| URL                                 | Role    | Page                  | Priority |
| ----------------------------------- | ------- | --------------------- | -------- |
| `/referee`                          | Referee | Tablet action center  | P0       |
| `/referee/assignments`              | Referee | Assigned races        | P0       |
| `/referee/pre-race-check`           | Referee | Checklist queue       | P0       |
| `/referee/pre-race-check/[raceId]`  | Referee | Race checklist        | P0       |
| `/referee/live-monitoring`          | Referee | Live monitoring queue | P1       |
| `/referee/live-monitoring/[raceId]` | Referee | Live incident log     | P1       |
| `/referee/result-entry`             | Referee | Result entry queue    | P0       |
| `/referee/result-entry/[raceId]`    | Referee | Result form           | P0       |
| `/referee/reports`                  | Referee | Submitted reports     | P2       |

### 7.7 Spectator dashboard routes

| URL                         | Role      | Page                     | Priority |
| --------------------------- | --------- | ------------------------ | -------- |
| `/spectator`                | Spectator | Dashboard                | P1       |
| `/spectator/races`          | Spectator | Race list                | P0       |
| `/spectator/races/[raceId]` | Spectator | Race detail + prediction | P0       |
| `/spectator/predictions`    | Spectator | Prediction history       | P1       |
| `/spectator/leaderboards`   | Spectator | Leaderboard              | P1       |
| `/spectator/rewards`        | Spectator | Reward history           | P2       |
| `/spectator/notifications`  | Spectator | Notifications            | P2       |

## 8. Module plan

| Module                | Mục đích                                               | Routes                                                                 | Components chính                                                                           | API cần gọi                                                                                                                                                                                                      | Realtime event                                                                 | Roles                                            |
| --------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Authentication        | Login/register/session/role redirect                   | `/login`, `/register`                                                  | `LoginForm`, `RegisterForm`, `RoleSelector`, `AuthCard`                                    | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/refresh`                                                                                                             | `auth:session-expired` optional                                                | Guest, all users                                 |
| Tournament Management | Admin tạo/sửa giải, owner xem giải                     | `/admin/tournaments`, `/owner/tournaments`, `/tournaments`             | `TournamentForm`, `TournamentCard`, `TournamentTable`, `RoundManager`                      | `GET /tournaments`, `GET /tournaments/:id`, `POST /tournaments`, `PATCH /tournaments/:id`, `DELETE /tournaments/:id`                                                                                             | `tournament:updated`                                                           | Admin, Owner, Public                             |
| Horse Management      | Owner quản lý ngựa, admin duyệt                        | `/owner/horses`, `/admin/approvals/horses`                             | `HorseForm`, `HorseCard`, `HorseStatusBadge`, `HorseApprovalPanel`                         | `GET /horses/my`, `GET /horses/:id`, `POST /horses`, `PATCH /horses/:id`, `DELETE /horses/:id`, `POST /admin/horses/:id/approve`, `POST /admin/horses/:id/reject`                                                | `horse:approved`, `horse:rejected`                                             | Owner, Admin                                     |
| Race Management       | Lập lịch race, assign referee, lifecycle               | `/admin/races`, `/races/[raceId]`                                      | `RaceScheduler`, `RaceTable`, `RaceTimeline`, `RefereeAssignDialog`                        | `GET /races`, `GET /races/:id`, `POST /races`, `PATCH /races/:id`, `POST /races/:id/assign-referee`, `POST /races/:id/status`                                                                                    | `race:status-changed`, `race:schedule-updated`                                 | Admin, Referee, Owner, Jockey, Spectator         |
| Registration Approval | Admin duyệt đăng ký tournament                         | `/admin/approvals/registrations`, `/owner/registrations`               | `RegistrationKanban`, `RegistrationCard`, `ApprovalDialog`, `RejectReasonDialog`           | `GET /registrations/my`, `GET /admin/registrations/pending`, `POST /admin/registrations/:id/approve`, `POST /admin/registrations/:id/reject`                                                                     | `registration:approved`, `registration:rejected`                               | Admin, Owner                                     |
| Jockey Invitation     | Owner mời jockey, jockey accept/reject                 | `/owner/jockey-recruitment`, `/jockey/invitations`                     | `JockeySearch`, `JockeyCard`, `InvitationForm`, `InvitationInbox`                          | `GET /jockeys`, `GET /jockeys/:id`, `POST /jockey-invitations`, `GET /jockey-invitations/sent`, `GET /jockey-invitations/received`, `POST /jockey-invitations/:id/accept`, `POST /jockey-invitations/:id/reject` | `invitation:received`, `invitation:accepted`, `invitation:rejected`            | Owner, Jockey                                    |
| Referee Checklist     | Referee check trước race, ghi violation, submit result | `/referee/pre-race-check`, `/referee/result-entry`                     | `RaceChecklist`, `ParticipantCheckRow`, `ViolationQuickAdd`, `ResultEntryForm`             | `GET /referee/assignments`, `GET /races/:id/pre-check`, `POST /races/:id/pre-check`, `POST /races/:id/violations`, `POST /races/:id/results`, `POST /races/:id/reports`                                          | `checklist:updated`, `violation:created`, `result:submitted`                   | Referee, Admin                                   |
| Live Race Tracking    | Hiển thị race live, timeline, participant status       | `/races/[raceId]`, `/spectator/races/[raceId]`, `/owner/race-tracking` | `LiveRaceTracker`, `RaceStatusTimeline`, `ParticipantLiveTable`, `RaceEventFeed`           | `GET /races/:id`, `GET /races/:id/participants`, `GET /races/:id/events`                                                                                                                                         | `race:started`, `race:event-created`, `race:finished`, `race:result-published` | Public, Spectator, Owner, Jockey, Referee, Admin |
| Prediction            | Spectator dự đoán kết quả race                         | `/spectator/races/[raceId]`, `/spectator/predictions`                  | `PredictionPanel`, `PredictionCountdown`, `PredictionOptionCard`, `PredictionHistoryTable` | `GET /races/:id/prediction-options`, `POST /predictions`, `GET /predictions/my`, `GET /predictions/:id`                                                                                                          | `prediction:locked`, `prediction:resolved`                                     | Spectator                                        |
| Reward                | Hiển thị/duyệt phần thưởng                             | `/admin/rewards`, `/owner/rewards`, `/spectator/rewards`               | `RewardSummary`, `RewardTable`, `RewardStatusBadge`, `RewardApprovalPanel`                 | `GET /rewards/my`, `GET /admin/rewards`, `POST /admin/rewards/:id/approve`, `POST /admin/rewards/:id/reject`                                                                                                     | `reward:issued`, `reward:approved`                                             | Admin, Owner, Spectator                          |
| Notification          | Inbox, unread badge, realtime toast                    | `/notifications`, role notification pages                              | `NotificationDropdown`, `NotificationList`, `NotificationItem`, `UnreadBadge`              | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`                                                                                                                             | `notification:new`, `notification:read`                                        | All authenticated roles                          |
| Dashboard/Analytics   | Role-specific summary, chart, KPI                      | `/admin`, `/owner`, `/jockey`, `/referee`, `/spectator`                | `DashboardCard`, `MetricGrid`, `RaceStatusChart`, `RegistrationChart`, `ActivityFeed`      | `GET /dashboard/admin`, `GET /dashboard/owner`, `GET /dashboard/jockey`, `GET /dashboard/referee`, `GET /dashboard/spectator`                                                                                    | `dashboard:metric-updated` optional                                            | All authenticated roles                          |

## 9. Feature module template

Mỗi feature nên theo mẫu:

```txt
features/<feature-name>/
├── components/
├── hooks/
├── schemas/
├── utils/
├── constants.ts
├── types.ts
└── index.ts
```

Ví dụ:

```txt
features/horses/
├── components/horse-form.tsx
├── components/horse-card.tsx
├── components/horse-status-badge.tsx
├── hooks/use-my-horses.ts
├── hooks/use-create-horse.ts
├── hooks/use-update-horse.ts
├── schemas/horse.schema.ts
├── utils/horse-status.ts
├── constants.ts
└── types.ts
```

## 10. Shared component strategy

| Component                            | Folder                     | Dùng cho                | Ghi chú                             |
| ------------------------------------ | -------------------------- | ----------------------- | ----------------------------------- |
| `Button`, `Input`, `Dialog`, `Badge` | `components/ui/`           | toàn app                | shadcn/ui/custom primitive          |
| `AppHeader`                          | `components/layout/`       | dashboard layout        | user menu, notification, breadcrumb |
| `AppSidebar`                         | `components/layout/`       | dashboard layout        | menu theo role                      |
| `MobileBottomNav`                    | `components/navigation/`   | jockey/spectator mobile | role-specific config                |
| `DataTable`                          | `components/data-display/` | admin/list screens      | TanStack Table                      |
| `DashboardCard`                      | `components/data-display/` | dashboard               | KPI card                            |
| `EmptyState`                         | `components/feedback/`     | all pages               | CTA-friendly                        |
| `ErrorState`                         | `components/feedback/`     | all pages               | retry support                       |
| `ConfirmDialog`                      | `components/feedback/`     | approve/delete/reject   | danger/default variant              |
| `FormModal`                          | `components/forms/`        | create/edit quick forms | RHF-compatible                      |
| `StatusBadge`                        | `components/ui/`           | generic status          | domain wrapper ở feature            |

## 11. State/API convention

### 11.1 API client

- `services/api-client.ts`: base URL, auth header/cookie config, error normalization.
- Không gọi `fetch/axios` trực tiếp trong component.
- Service chỉ biết HTTP; không biết UI.

### 11.2 Query keys

Dùng factory:

```ts
queryKeys.horses.all;
queryKeys.horses.detail(horseId);
queryKeys.races.detail(raceId);
queryKeys.notifications.list(filters);
```

### 11.3 Mutation invalidation

| Mutation               | Invalidate                                                     |
| ---------------------- | -------------------------------------------------------------- |
| Create horse           | `horses.my`, `admin.horseApprovals`                            |
| Approve registration   | `registrations.pending`, `races.list`, `tournaments.detail`    |
| Accept invitation      | `invitations.received`, `jockey.schedule`, `owner.invitations` |
| Submit result          | `results.pending`, `races.detail`                              |
| Publish result         | `races.detail`, `rankings`, `predictions`, `rewards`           |
| Mark notification read | `notifications.list`, `notifications.unreadCount`              |

### 11.4 Store

`stores/` chỉ dùng cho UI state cross-page nếu thật cần:

- sidebar collapsed
- command palette open
- temporary client preference
- realtime connection status

Không đưa server entities vào store.

## 12. Realtime plan

### 12.1 Socket connection

- Khởi tạo trong `providers/socket-provider.tsx` hoặc feature-specific hook.
- Connect chỉ sau khi authenticated nếu event private.
- Join room theo role/entity:
  - `user:{userId}`
  - `race:{raceId}`
  - `role:admin`
  - `role:referee:{refereeId}`

### 12.2 Event mapping

| Event                   | FE action                                |
| ----------------------- | ---------------------------------------- |
| `notification:new`      | prepend notification, unread +1, toast   |
| `race:status-changed`   | update race detail/list query            |
| `race:event-created`    | append event feed                        |
| `race:finished`         | refetch race detail, enable result views |
| `race:result-published` | refetch race, ranking, prediction        |
| `registration:approved` | refetch owner registration, toast        |
| `invitation:received`   | refetch jockey inbox, toast              |
| `prediction:locked`     | disable prediction form                  |
| `reward:issued`         | refetch reward summary                   |

## 13. UI screen priority theo MVP

| Priority | Screen                             | Role                        | Lý do                                   |
| -------- | ---------------------------------- | --------------------------- | --------------------------------------- |
| P0       | Landing Page                       | Public                      | Entry point, giới thiệu race/tournament |
| P0       | Login/Register                     | Guest                       | Bắt buộc cho RBAC                       |
| P0       | Admin Dashboard                    | Admin                       | Operational overview                    |
| P0       | Admin Registration Approval Kanban | Admin                       | Core tournament workflow                |
| P0       | Admin Race Schedule                | Admin                       | Core race operation                     |
| P0       | Owner Horse Portfolio              | Owner                       | Owner core entity                       |
| P0       | Jockey Mobile Action Center        | Jockey                      | Accept/reject invitation, xem lịch      |
| P0       | Referee Tablet Checklist           | Referee                     | Pre-race + result workflow              |
| P0       | Race Detail Live Tracker           | Public/Spectator/Auth roles | Live engagement, central race screen    |
| P1       | Tournament Detail                  | Public/Owner/Admin          | Đăng ký/xem giải                        |
| P1       | Prediction Panel                   | Spectator                   | Engagement                              |
| P1       | Result Approval                    | Admin                       | Publish official result                 |
| P1       | Notification Center                | Auth roles                  | Workflow update                         |
| P2       | Rewards                            | Admin/Owner/Spectator       | Sau khi result/prediction ổn            |
| P2       | Analytics charts                   | Admin                       | Nice-to-have sau MVP core               |

## 14. MVP roadmap

### Phase 0 — Foundation

- Setup folder structure.
- Setup Tailwind theme + shadcn/ui strategy.
- Setup TanStack Query provider.
- Setup API client.
- Setup auth service + session check.
- Setup middleware + role layouts.
- Setup shared layout/components.

### Phase 1 — Auth + role shell

- Login.
- Register.
- Logout.
- Role redirect.
- Dashboard shell per role.
- Forbidden page.

### Phase 2 — Admin/Owner core

- Admin dashboard.
- Tournament CRUD minimal.
- Race schedule minimal.
- Owner horse portfolio.
- Horse create/edit.
- Horse approval.
- Registration approval Kanban.

### Phase 3 — Jockey/Referee workflow

- Jockey invitation inbox.
- Owner invite jockey.
- Jockey accept/reject.
- Referee assignment list.
- Referee pre-race checklist.
- Referee result entry.

### Phase 4 — Live race + spectator

- Public race list.
- Race detail live tracker.
- Socket.IO race events.
- Spectator race view.
- Prediction create/history.

### Phase 5 — Result/reward/analytics

- Admin result approval.
- Publish result.
- Ranking update.
- Reward summary.
- Admin charts.
- Notification center polish.

## 15. Naming convention

### 15.1 Folder/file

| Loại           | Convention                 | Ví dụ                 |
| -------------- | -------------------------- | --------------------- |
| Folder         | kebab-case                 | `jockey-invitations/` |
| Component file | kebab-case                 | `horse-form.tsx`      |
| Component name | PascalCase                 | `HorseForm`           |
| Hook file      | kebab-case, starts `use-`  | `use-my-horses.ts`    |
| Hook name      | camelCase, starts `use`    | `useMyHorses`         |
| Schema file    | kebab-case + `.schema.ts`  | `horse.schema.ts`     |
| Type file      | kebab-case or domain       | `race.ts`, `types.ts` |
| Constant file  | kebab-case                 | `race-status.ts`      |
| Service file   | kebab-case + `.service.ts` | `horses.service.ts`   |

### 15.2 Route params

| Entity     | Param            |
| ---------- | ---------------- |
| Tournament | `[tournamentId]` |
| Race       | `[raceId]`       |
| Horse      | `[horseId]`      |
| User       | `[userId]`       |
| Invitation | `[invitationId]` |
| Result     | `[resultId]`     |

### 15.3 Type naming

```ts
type Horse = {};
type Race = {};
type Tournament = {};
type ApiResponse<T> = {};
type PaginatedResponse<T> = {};
type UserRole = "ADMIN" | "HORSE_OWNER" | "JOCKEY" | "REFEREE" | "SPECTATOR";
```

### 15.4 Status enum naming

```ts
HorseStatus.PENDING_APPROVAL;
RegistrationStatus.APPROVED;
RaceStatus.LIVE;
ResultStatus.PUBLISHED;
InvitationStatus.ACCEPTED;
PredictionStatus.RESOLVED;
RewardStatus.ISSUED;
```

## 16. UX rules

1. Mọi list page có loading, error, empty state.
2. Mọi mutation quan trọng có loading + success/error toast.
3. Reject action luôn yêu cầu reason.
4. Approve/publish action dùng confirm dialog.
5. Prediction lock dựa server time, không dựa browser time.
6. Referee UI tablet-first: button lớn, sticky action bar.
7. Jockey UI mobile-first: action center đơn giản.
8. Admin table hỗ trợ filter/status/search/pagination.
9. Kanban approval dùng dnd-kit nhưng action cuối vẫn confirm.
10. Public live race không lộ dữ liệu chưa publish nếu backend chưa cho phép.

## 17. Technical checklist

### Architecture

- [ ] Không có `react-router-dom`.
- [ ] Không có `src/pages`.
- [ ] Không có `routes/index.tsx`.
- [ ] Route dùng `app/` App Router.
- [ ] Role dashboard dùng route group + nested layout.
- [ ] Auth guard có middleware/layout/server util.
- [ ] Client guard không dùng làm security chính.

### Data/API

- [ ] API client tập trung.
- [ ] Service không chứa UI logic.
- [ ] TanStack Query provider setup.
- [ ] Query key factory thống nhất.
- [ ] Mutation invalidation rõ.
- [ ] Error response normalize.

### Form/validation

- [ ] React Hook Form dùng cho form phức tạp.
- [ ] Zod schema colocate trong feature.
- [ ] Reject/approval/prediction validation đầy đủ.
- [ ] Server-side error map vào form field.

### UI/components

- [ ] Shared component chỉ generic.
- [ ] Domain component đặt trong `features/*/components`.
- [ ] DataTable dùng TanStack Table.
- [ ] Chart dùng Recharts.
- [ ] Kanban/scheduler drag dùng dnd-kit.
- [ ] Loading/error/empty state chuẩn hóa.

### Realtime

- [ ] Socket.IO client connect sau auth.
- [ ] Join room theo user/race/role.
- [ ] Event map sang query update/invalidate.
- [ ] Cleanup listener khi unmount.
- [ ] Không duplicate event handler.

### Security/RBAC

- [ ] JWT/session lưu an toàn theo backend strategy.
- [ ] Middleware redirect dashboard/auth route đúng.
- [ ] Role layout guard đủ chặt.
- [ ] UI permission chỉ hỗ trợ UX.
- [ ] Backend vẫn authorize mọi endpoint.

### MVP readiness

- [ ] Landing Page.
- [ ] Login/Register.
- [ ] Admin Dashboard.
- [ ] Admin Registration Approval Kanban.
- [ ] Admin Race Schedule.
- [ ] Owner Horse Portfolio.
- [ ] Jockey Mobile Action Center.
- [ ] Referee Tablet Checklist.
- [ ] Race Detail Live Tracker.
