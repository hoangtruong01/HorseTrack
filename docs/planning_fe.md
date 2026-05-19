# FE Planning — Horse Racing Tournament Management System

## 1. Mục tiêu

Tài liệu này là bản FE Planning chính thức cho **Horse Racing Tournament Management System**, dùng trực tiếp cho team frontend implement theo stack hiện tại:

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui hoặc custom clean UI components
- TanStack Query
- React Hook Form + Zod
- Socket.IO Client
- Recharts
- TanStack Table
- dnd-kit
- Backend: NestJS REST API
- Auth: JWT + RBAC
- Database backend: MongoDB

## 2. Quyết định kiến trúc

### 2.1 Dùng

| Nhóm         | Công nghệ                       | Ghi chú                                  |
| ------------ | ------------------------------- | ---------------------------------------- |
| Framework    | Next.js App Router              | Routing theo filesystem trong `app/`     |
| Language     | TypeScript                      | Strict-first                             |
| UI           | TailwindCSS + shadcn/ui/custom  | Ưu tiên reusable primitive               |
| Server state | TanStack Query                  | Cache, mutation, invalidation            |
| Form         | React Hook Form + Zod           | Schema validation thống nhất             |
| Realtime     | Socket.IO Client                | Live race, notification, status update   |
| Chart        | Recharts                        | Dashboard analytics                      |
| Table        | TanStack Table                  | Admin/list screens                       |
| Drag/drop    | dnd-kit                         | Kanban approval, schedule reorder        |
| Auth         | JWT bằng httpOnly cookie + RBAC | Guard bằng middleware/layout/server util |
| Backend API  | NestJS REST API                 | FE gọi qua API client wrapper            |

### 2.2 Không dùng

| Không dùng                | Lý do                                         |
| ------------------------- | --------------------------------------------- |
| `react-router-dom`        | Next App Router đã xử lý routing              |
| `ProtectedRoute` kiểu SPA | Guard nên ở middleware/layout/server-side     |
| `src/pages`               | Không phù hợp App Router                      |
| `routes/index.tsx`        | Không cần route config thủ công               |
| Vite/CRA mindset          | Project đang là Next.js                       |
| LocalStorage để lưu JWT   | Rủi ro XSS; dùng httpOnly cookie              |
| Redux mặc định            | TanStack Query + local/Zustand nhẹ đủ cho MVP |

## 3. Nguyên tắc frontend

1. Route nằm trong `app/`.
2. Business boundary nằm trong `features/`.
3. Shared UI nằm trong `components/`.
4. Shared utility nằm trong `lib/`.
5. Reusable hook global nằm trong `hooks/`; domain hook nằm trong `features/*/hooks/`.
6. Type dùng chung nằm trong `types/`; type domain có thể colocate trong feature.
7. Constant dùng chung nằm trong `constants/`.
8. HTTP call nằm trong `services/` hoặc API layer feature-specific.
9. Query/mutation hook nằm gần feature.
10. Form schema nằm trong feature `schemas/`.
11. Auth/RBAC kiểm tra theo 3 tầng:
    - `middleware.ts`: redirect sơ cấp.
    - route layout/server util: role guard chính.
    - client permission hook: ẩn/hiện UI, không thay backend authorization.
12. Server state không đưa vào global store.
13. Realtime event phải invalidate/update TanStack Query có kiểm soát.
14. Component business-specific không đặt vào shared global.

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
│       │   ├── races/[raceId]/page.tsx
│       │   ├── races/[raceId]/participants/page.tsx
│       │   ├── races/[raceId]/assignments/page.tsx
│       │   ├── races/[raceId]/results/page.tsx
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
│       │   ├── tournaments/[tournamentId]/page.tsx
│       │   ├── tournaments/[tournamentId]/register/page.tsx
│       │   ├── registrations/page.tsx
│       │   ├── jockey-recruitment/page.tsx
│       │   ├── race-tracking/page.tsx
│       │   ├── rewards/page.tsx
│       │   └── notifications/page.tsx
│       ├── jockey/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── invitations/page.tsx
│       │   ├── invitations/[invitationId]/page.tsx
│       │   ├── schedule/page.tsx
│       │   ├── achievements/page.tsx
│       │   ├── profile/page.tsx
│       │   └── notifications/page.tsx
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
│       │   ├── reports/page.tsx
│       │   └── notifications/page.tsx
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
├── lib/
├── hooks/
├── services/
├── stores/
├── types/
├── constants/
├── providers/
└── middleware.ts
```

## 5. Layout plan theo route group

| Route group                 | URL thật                      | Layout               | Mục đích                                      |
| --------------------------- | ----------------------------- | -------------------- | --------------------------------------------- |
| `app/(public)`              | `/`, `/tournaments`, `/races` | Public header/footer | Landing, public browse, public race live view |
| `app/(auth)`                | `/login`, `/register`         | Auth shell           | Guest-only auth flow                          |
| `app/(dashboard)`           | role dashboards               | Dashboard shell      | Sidebar/header base                           |
| `app/(dashboard)/admin`     | `/admin/*`                    | Admin layout         | Admin RBAC + admin nav                        |
| `app/(dashboard)/owner`     | `/owner/*`                    | Owner layout         | Owner RBAC + owner nav                        |
| `app/(dashboard)/jockey`    | `/jockey/*`                   | Jockey layout        | Jockey RBAC + mobile-first nav                |
| `app/(dashboard)/referee`   | `/referee/*`                  | Referee layout       | Referee RBAC + tablet workflow                |
| `app/(dashboard)/spectator` | `/spectator/*`                | Spectator layout     | Spectator RBAC + prediction UX                |

## 6. Auth/RBAC plan

### 6.1 Auth strategy chính thức

- Access token được lưu bằng httpOnly cookie.
- Refresh token hoặc session refresh do backend xử lý.
- FE không lưu JWT trong localStorage.
- FE không tự decode token để quyết định quyền chính.
- FE gọi `GET /auth/me` để hydrate current user/session khi app load.
- Middleware hoặc server-side guard dùng để redirect theo role.
- Client-side guard chỉ dùng để ẩn/hiện UI, không thay thế backend RBAC.
- Backend NestJS vẫn authorize mọi endpoint bằng JWT + RBAC guard.

### 6.2 Middleware

Dùng `middleware.ts` ở root `fe/`.

Nhiệm vụ:

- User chưa login vào `/admin`, `/owner`, `/jockey`, `/referee`, `/spectator` → redirect `/login`.
- User đã login vào `/login` hoặc `/register` → redirect dashboard theo role.
- Role mismatch → redirect `/forbidden` hoặc dashboard đúng role.
- Middleware chỉ xử lý redirect sơ cấp; business permission vẫn ở backend + layout/server util.

### 6.3 Layout/server guard

Mỗi role layout gọi server auth util:

```ts
requireRole(["ADMIN"]);
requireRole(["HORSE_OWNER"]);
requireRole(["JOCKEY"]);
requireRole(["REFEREE"]);
requireRole(["SPECTATOR"]);
```

### 6.4 Client permission

Dùng cho UX:

- Ẩn nút approve/reject nếu không có quyền.
- Disable prediction nếu locked.
- Ẩn action publish nếu result chưa approved.
- Hiển thị navigation theo role.

Không dùng client permission làm security chính.

## 7. Route plan

### 7.1 Public routes

| URL                           | Role | Page                         | Protected | Ghi chú                                                          |
| ----------------------------- | ---- | ---------------------------- | --------- | ---------------------------------------------------------------- |
| `/`                           | All  | Landing Page                 | No        | Public entry                                                     |
| `/tournaments`                | All  | Public tournament list       | No        | Chỉ dữ liệu public/published                                     |
| `/tournaments/[tournamentId]` | All  | Tournament public detail     | No        | Không có owner action                                            |
| `/races`                      | All  | Public race list/live list   | No        | Upcoming/live/published races                                    |
| `/races/[raceId]`             | All  | Public race detail/live view | No        | Chỉ xem thông tin cơ bản, live timeline public, published result |
| `/leaderboards`               | All  | Public ranking               | No        | Published ranking                                                |

### 7.2 Auth routes

| URL                | Role  | Page            | Protected  |
| ------------------ | ----- | --------------- | ---------- |
| `/login`           | Guest | Login           | Guest-only |
| `/register`        | Guest | Register        | Guest-only |
| `/forgot-password` | Guest | Forgot password | Guest-only |

### 7.3 Admin routes

| URL                                  | Role  | Page                             | Priority |
| ------------------------------------ | ----- | -------------------------------- | -------- |
| `/admin`                             | Admin | Dashboard                        | P0       |
| `/admin/users`                       | Admin | User management                  | P2       |
| `/admin/tournaments`                 | Admin | Tournament management            | P0       |
| `/admin/tournaments/new`             | Admin | Create tournament                | P0       |
| `/admin/tournaments/[tournamentId]`  | Admin | Tournament detail                | P1       |
| `/admin/approvals`                   | Admin | Approval center                  | P0       |
| `/admin/approvals/horses`            | Admin | Horse approval                   | P0       |
| `/admin/approvals/registrations`     | Admin | Registration approval Kanban     | P0       |
| `/admin/approvals/results`           | Admin | Result approval                  | P1       |
| `/admin/races`                       | Admin | Race schedule/list               | P0       |
| `/admin/races/[raceId]`              | Admin | Race detail                      | P0       |
| `/admin/races/[raceId]/participants` | Admin | Danh sách ngựa/jockey tham gia   | P0       |
| `/admin/races/[raceId]/assignments`  | Admin | Phân công referee/jockey nếu cần | P1       |
| `/admin/races/[raceId]/results`      | Admin | Quản lý/khoá/publish kết quả     | P1       |
| `/admin/results`                     | Admin | Result management overview       | P1       |
| `/admin/rewards`                     | Admin | Reward management                | P2       |
| `/admin/notifications`               | Admin | Admin notifications              | P2       |

### 7.4 Horse Owner routes

| URL                                          | Role        | Page                         | Priority | Ghi chú                                       |
| -------------------------------------------- | ----------- | ---------------------------- | -------- | --------------------------------------------- |
| `/owner`                                     | Horse Owner | Dashboard                    | P1       | Owner overview                                |
| `/owner/horses`                              | Horse Owner | Horse portfolio              | P0       | CRUD ngựa                                     |
| `/owner/horses/new`                          | Horse Owner | Create horse                 | P0       | Tạo horse pending approval                    |
| `/owner/horses/[horseId]`                    | Horse Owner | Horse detail                 | P1       | Detail/edit/status                            |
| `/owner/tournaments`                         | Horse Owner | Available tournaments        | P0       | Danh sách tournament có thể đăng ký           |
| `/owner/tournaments/[tournamentId]`          | Horse Owner | Tournament detail            | P0       | Xem điều kiện, races, deadline                |
| `/owner/tournaments/[tournamentId]/register` | Horse Owner | Tournament registration form | P0       | Chọn horse phù hợp để đăng ký race/tournament |
| `/owner/registrations`                       | Horse Owner | Registration status          | P1       | pending/approved/rejected/need_more_info      |
| `/owner/jockey-recruitment`                  | Horse Owner | Invite jockey                | P1       | Mời jockey                                    |
| `/owner/race-tracking`                       | Horse Owner | My race tracking             | P1       | Theo dõi race của horse mình                  |
| `/owner/rewards`                             | Horse Owner | Owner rewards                | P2       | Reward owner                                  |
| `/owner/notifications`                       | Horse Owner | Owner notifications          | P2       | Notification theo owner                       |

### 7.5 Jockey routes

| URL                                  | Role   | Page                 | Priority |
| ------------------------------------ | ------ | -------------------- | -------- |
| `/jockey`                            | Jockey | Mobile action center | P0       |
| `/jockey/invitations`                | Jockey | Invitation inbox     | P0       |
| `/jockey/invitations/[invitationId]` | Jockey | Invitation detail    | P0       |
| `/jockey/schedule`                   | Jockey | Race schedule        | P1       |
| `/jockey/achievements`               | Jockey | Achievements         | P2       |
| `/jockey/profile`                    | Jockey | Profile              | P2       |
| `/jockey/notifications`              | Jockey | Jockey notifications | P2       |

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
| `/referee/notifications`            | Referee | Referee notifications | P2       |

### 7.7 Spectator authenticated routes

| URL                         | Role      | Page                                   | Priority | Ghi chú                                                           |
| --------------------------- | --------- | -------------------------------------- | -------- | ----------------------------------------------------------------- |
| `/spectator`                | Spectator | Dashboard                              | P1       | Spectator overview                                                |
| `/spectator/races`          | Spectator | Race list                              | P0       | Authenticated race list                                           |
| `/spectator/races/[raceId]` | Spectator | Authenticated race detail + prediction | P0       | Có prediction, reward status, notification, user-specific actions |
| `/spectator/predictions`    | Spectator | Prediction history                     | P1       | Lịch sử dự đoán                                                   |
| `/spectator/leaderboards`   | Spectator | Leaderboard                            | P1       | Ranking + personal highlight                                      |
| `/spectator/rewards`        | Spectator | Reward history                         | P2       | Reward theo user                                                  |
| `/spectator/notifications`  | Spectator | Spectator notifications                | P2       | Notification theo spectator                                       |

## 8. Public Race View vs Spectator Race View

| Route                       | Login                   | Mục đích                          | Dữ liệu hiển thị                                                                       | Action                                                                       |
| --------------------------- | ----------------------- | --------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/races/[raceId]`           | Không cần               | Public race detail/live view      | Thông tin race cơ bản, participants public, timeline public, result đã publish         | Không prediction, không reward, không user-specific notification             |
| `/spectator/races/[raceId]` | Bắt buộc role Spectator | Authenticated spectator race view | Toàn bộ dữ liệu public + prediction status của user + reward status + personalized CTA | Submit prediction, xem prediction history/status, nhận realtime notification |

Nguyên tắc:

- Public route không fetch dữ liệu user-specific.
- Spectator route hydrate current user bằng `/auth/me` và fetch prediction/reward của user.
- Nếu guest muốn prediction từ `/races/[raceId]`, CTA dẫn tới `/login?redirect=/spectator/races/[raceId]`.

## 9. Module plan

| Module                  | Mục đích                                                                 | Routes                                                                                                                                                                 | Components chính                                                                                                                             | API cần gọi                                                                                                                                                                                                                                                                                                      | Realtime event                                                                                            | Roles                                            |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Authentication          | Login/register/session hydrate/role redirect bằng httpOnly cookie        | `/login`, `/register`                                                                                                                                                  | `LoginForm`, `RegisterForm`, `RoleSelector`, `AuthCard`, `SessionHydrator`                                                                   | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/refresh`                                                                                                                                                                                                             | `auth:session-expired` optional                                                                           | Guest, all users                                 |
| Tournament Management   | Admin tạo/sửa giải, public/owner xem giải                                | `/admin/tournaments`, `/admin/tournaments/[tournamentId]`, `/tournaments`, `/tournaments/[tournamentId]`, `/owner/tournaments`, `/owner/tournaments/[tournamentId]`    | `TournamentForm`, `TournamentCard`, `TournamentTable`, `RoundManager`, `TournamentDetail`                                                    | `GET /tournaments`, `GET /tournaments/:id`, `POST /tournaments`, `PATCH /tournaments/:id`, `DELETE /tournaments/:id`                                                                                                                                                                                             | `tournament:updated`                                                                                      | Admin, Owner, Public                             |
| Horse Management        | Owner quản lý ngựa, admin duyệt                                          | `/owner/horses`, `/owner/horses/new`, `/owner/horses/[horseId]`, `/admin/approvals/horses`                                                                             | `HorseForm`, `HorseCard`, `HorseStatusBadge`, `HorseApprovalPanel`                                                                           | `GET /horses/my`, `GET /horses/:id`, `POST /horses`, `PATCH /horses/:id`, `DELETE /horses/:id`, `POST /admin/horses/:id/approve`, `POST /admin/horses/:id/reject`                                                                                                                                                | `horse:approved`, `horse:rejected`                                                                        | Owner, Admin                                     |
| Tournament Registration | Owner đăng ký horse vào tournament/race, admin duyệt                     | `/owner/tournaments`, `/owner/tournaments/[tournamentId]`, `/owner/tournaments/[tournamentId]/register`, `/owner/registrations`, `/admin/approvals/registrations`      | `TournamentRegistrationForm`, `EligibleHorseSelect`, `RegistrationStatusBadge`, `RegistrationKanban`, `ApprovalDialog`, `RejectReasonDialog` | `GET /owner/tournaments`, `GET /tournaments/:id`, `GET /horses/my?status=approved`, `POST /tournaments/:id/register`, `GET /registrations/my`, `GET /admin/registrations/pending`, `POST /admin/registrations/:id/approve`, `POST /admin/registrations/:id/reject`, `POST /admin/registrations/:id/request-info` | `registration:submitted`, `registration:approved`, `registration:rejected`, `registration:need-more-info` | Owner, Admin                                     |
| Race Management         | Lập lịch race, xem chi tiết, participants, assignments, result lifecycle | `/admin/races`, `/admin/races/[raceId]`, `/admin/races/[raceId]/participants`, `/admin/races/[raceId]/assignments`, `/admin/races/[raceId]/results`, `/races/[raceId]` | `RaceScheduler`, `RaceTable`, `RaceDetailPanel`, `ParticipantTable`, `RefereeAssignDialog`, `RaceResultManager`, `RaceTimeline`              | `GET /races`, `GET /races/:id`, `POST /races`, `PATCH /races/:id`, `GET /races/:id/participants`, `POST /races/:id/assign-referee`, `POST /races/:id/status`, `GET /races/:id/results`, `POST /races/:id/results/lock`, `POST /races/:id/results/publish`                                                        | `race:status-changed`, `race:schedule-updated`, `race:participants-updated`, `race:result-published`      | Admin, Referee, Owner, Jockey, Spectator, Public |
| Jockey Invitation       | Owner mời jockey, jockey accept/reject                                   | `/owner/jockey-recruitment`, `/jockey/invitations`, `/jockey/invitations/[invitationId]`                                                                               | `JockeySearch`, `JockeyCard`, `InvitationForm`, `InvitationInbox`, `InvitationDetail`                                                        | `GET /jockeys`, `GET /jockeys/:id`, `POST /jockey-invitations`, `GET /jockey-invitations/sent`, `GET /jockey-invitations/received`, `POST /jockey-invitations/:id/accept`, `POST /jockey-invitations/:id/reject`                                                                                                 | `invitation:received`, `invitation:accepted`, `invitation:rejected`                                       | Owner, Jockey                                    |
| Referee Checklist       | Referee check trước race, ghi violation, submit result                   | `/referee/assignments`, `/referee/pre-race-check`, `/referee/pre-race-check/[raceId]`, `/referee/live-monitoring/[raceId]`, `/referee/result-entry/[raceId]`           | `RaceChecklist`, `ParticipantCheckRow`, `ViolationQuickAdd`, `ResultEntryForm`, `RefereeReportSummary`                                       | `GET /referee/assignments`, `GET /races/:id/pre-check`, `POST /races/:id/pre-check`, `POST /races/:id/violations`, `POST /races/:id/results`, `POST /races/:id/reports`                                                                                                                                          | `checklist:updated`, `violation:created`, `result:submitted`                                              | Referee, Admin                                   |
| Live Race Tracking      | Hiển thị race live, timeline, participant status                         | `/races/[raceId]`, `/spectator/races/[raceId]`, `/owner/race-tracking`                                                                                                 | `LiveRaceTracker`, `RaceStatusTimeline`, `ParticipantLiveTable`, `RaceEventFeed`, `PublicRaceSummary`, `SpectatorRacePanel`                  | Public: `GET /races/:id`, `GET /races/:id/participants`, `GET /races/:id/events`; Spectator: thêm `GET /predictions/my?raceId=:id`, `GET /rewards/my?raceId=:id`                                                                                                                                                 | `race:started`, `race:event-created`, `race:finished`, `race:result-published`                            | Public, Spectator, Owner, Jockey, Referee, Admin |
| Prediction              | Spectator dự đoán kết quả race                                           | `/spectator/races/[raceId]`, `/spectator/predictions`                                                                                                                  | `PredictionPanel`, `PredictionCountdown`, `PredictionOptionCard`, `PredictionHistoryTable`                                                   | `GET /races/:id/prediction-options`, `POST /predictions`, `GET /predictions/my`, `GET /predictions/:id`                                                                                                                                                                                                          | `prediction:locked`, `prediction:resolved`                                                                | Spectator                                        |
| Reward                  | Hiển thị/duyệt phần thưởng                                               | `/admin/rewards`, `/owner/rewards`, `/spectator/rewards`                                                                                                               | `RewardSummary`, `RewardTable`, `RewardStatusBadge`, `RewardApprovalPanel`                                                                   | `GET /rewards/my`, `GET /admin/rewards`, `POST /admin/rewards/:id/approve`, `POST /admin/rewards/:id/reject`                                                                                                                                                                                                     | `reward:issued`, `reward:approved`                                                                        | Admin, Owner, Spectator                          |
| Notification            | Inbox theo role, unread badge, realtime toast                            | `/admin/notifications`, `/owner/notifications`, `/jockey/notifications`, `/referee/notifications`, `/spectator/notifications`                                          | `NotificationDropdown`, `NotificationList`, `NotificationItem`, `UnreadBadge`, `NotificationPreferences`                                     | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`                                                                                                                                                                                                                             | `notification:new`, `notification:read`                                                                   | All authenticated roles                          |
| Dashboard/Analytics     | Role-specific summary, chart, KPI                                        | `/admin`, `/owner`, `/jockey`, `/referee`, `/spectator`                                                                                                                | `DashboardCard`, `MetricGrid`, `RaceStatusChart`, `RegistrationChart`, `ActivityFeed`                                                        | `GET /dashboard/admin`, `GET /dashboard/owner`, `GET /dashboard/jockey`, `GET /dashboard/referee`, `GET /dashboard/spectator`                                                                                                                                                                                    | `dashboard:metric-updated` optional                                                                       | All authenticated roles                          |

## 10. Owner tournament registration flow

1. Owner vào `/owner/tournaments`.
2. FE gọi API lấy danh sách tournament còn mở đăng ký hoặc phù hợp điều kiện.
3. Owner vào `/owner/tournaments/[tournamentId]` để xem:
   - thời gian tournament
   - race/round liên quan
   - deadline đăng ký
   - điều kiện horse
   - số slot còn lại
4. Owner vào `/owner/tournaments/[tournamentId]/register`.
5. FE gọi danh sách horse eligible:
   - horse thuộc owner
   - status `APPROVED`
   - không bị trùng registration
   - phù hợp điều kiện tournament/race
6. Owner chọn horse, race/tournament target, submit registration.
7. Trạng thái registration:
   - `PENDING`
   - `APPROVED`
   - `REJECTED`
   - `NEED_MORE_INFO`
8. Owner theo dõi tại `/owner/registrations`.
9. Khi admin duyệt/từ chối/yêu cầu bổ sung, FE nhận realtime notification + refetch registration.

## 11. Feature module template

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

## 12. Shared component strategy

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

## 13. State/API convention

### 13.1 API client

- `services/api-client.ts`: base URL, credentials/cookie config, error normalization.
- API client phải gửi cookie bằng `credentials: 'include'` hoặc config tương đương nếu dùng axios.
- FE không set Authorization header từ localStorage.
- Không gọi `fetch/axios` trực tiếp trong component.
- Service chỉ biết HTTP; không biết UI.
- Khi app load, gọi `GET /auth/me` để hydrate current user/session.
- Khi nhận 401:
  - backend refresh/session nếu hỗ trợ tự động qua cookie
  - nếu vẫn fail → clear client user state + redirect `/login`

### 13.2 Query keys

Dùng factory:

```ts
queryKeys.auth.me;
queryKeys.horses.all;
queryKeys.horses.detail(horseId);
queryKeys.races.detail(raceId);
queryKeys.predictions.my(raceId);
queryKeys.notifications.list(filters);
```

### 13.3 Mutation invalidation

| Mutation               | Invalidate                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- |
| Login/logout           | `auth.me`, role dashboard query                                              |
| Create horse           | `horses.my`, `admin.horseApprovals`                                          |
| Register tournament    | `registrations.my`, `tournaments.detail`, `owner.tournaments`                |
| Approve registration   | `registrations.pending`, `races.list`, `tournaments.detail`, `notifications` |
| Accept invitation      | `invitations.received`, `jockey.schedule`, `owner.invitations`               |
| Submit result          | `results.pending`, `races.detail`                                            |
| Publish result         | `races.detail`, `rankings`, `predictions`, `rewards`                         |
| Mark notification read | `notifications.list`, `notifications.unreadCount`                            |

### 13.4 Store

`stores/` chỉ dùng cho UI state cross-page nếu thật cần:

- sidebar collapsed
- command palette open
- temporary client preference
- realtime connection status

Không đưa server entities vào store.

## 14. Realtime plan

### 14.1 Socket connection

- Khởi tạo trong `providers/socket-provider.tsx` hoặc feature-specific hook.
- Connect sau khi session được hydrate nếu event private.
- Public live race có thể join room public `race:{raceId}` nếu backend cho phép.
- Authenticated user join room private theo cookie/session.
- Join room theo role/entity:
  - `user:{userId}`
  - `race:{raceId}`
  - `role:admin`
  - `role:owner:{ownerId}`
  - `role:jockey:{jockeyId}`
  - `role:referee:{refereeId}`
  - `role:spectator:{spectatorId}`

### 14.2 Event mapping

| Event                         | FE action                                                              |
| ----------------------------- | ---------------------------------------------------------------------- |
| `notification:new`            | prepend notification, unread +1, toast, refetch role notification page |
| `race:status-changed`         | update race detail/list query                                          |
| `race:event-created`          | append event feed                                                      |
| `race:participants-updated`   | refetch race participants                                              |
| `race:finished`               | refetch race detail, enable result views                               |
| `race:result-published`       | refetch race, ranking, prediction, reward                              |
| `registration:submitted`      | refetch admin approval kanban                                          |
| `registration:approved`       | refetch owner registration, toast                                      |
| `registration:rejected`       | refetch owner registration, toast                                      |
| `registration:need-more-info` | refetch owner registration, show action CTA                            |
| `invitation:received`         | refetch jockey inbox, toast                                            |
| `prediction:locked`           | disable prediction form                                                |
| `prediction:resolved`         | refetch prediction history/reward                                      |
| `reward:issued`               | refetch reward summary                                                 |

## 15. UI screen priority theo MVP

| Priority | Screen                             | Role                  | Lý do                                    |
| -------- | ---------------------------------- | --------------------- | ---------------------------------------- |
| P0       | Landing Page                       | Public                | Entry point, giới thiệu race/tournament  |
| P0       | Login/Register                     | Guest                 | Bắt buộc cho RBAC                        |
| P0       | App Layouts theo role              | Auth roles            | Điều hướng nhất quán                     |
| P0       | Admin Dashboard                    | Admin                 | Operational overview                     |
| P0       | Admin Registration Approval Kanban | Admin                 | Core tournament workflow                 |
| P0       | Admin Race Schedule                | Admin                 | Core race operation                      |
| P0       | Admin Race Detail                  | Admin                 | Quản lý participants/assignments/results |
| P0       | Owner Horse Portfolio              | Owner                 | Owner core entity                        |
| P0       | Owner Tournament Registration      | Owner                 | Core owner flow                          |
| P0       | Jockey Mobile Action Center        | Jockey                | Accept/reject invitation, xem lịch       |
| P0       | Referee Tablet Checklist           | Referee               | Pre-race + result workflow               |
| P0       | Public Race Detail Live View       | Public                | Live engagement không login              |
| P0       | Spectator Race Detail + Prediction | Spectator             | Authenticated prediction/reward UX       |
| P1       | Tournament Detail                  | Public/Owner/Admin    | Đăng ký/xem giải                         |
| P1       | Result Approval                    | Admin                 | Publish official result                  |
| P1       | Notification Center theo role      | Auth roles            | Workflow update                          |
| P2       | Rewards                            | Admin/Owner/Spectator | Sau khi result/prediction ổn             |
| P2       | Analytics charts                   | Admin                 | Nice-to-have sau MVP core                |

## 16. MVP roadmap

### Phase 1 — Auth + App Layouts + API client

- Setup folder structure.
- Setup Tailwind theme + shadcn/ui strategy.
- Setup TanStack Query provider.
- Setup API client dùng httpOnly cookie credentials.
- Setup `GET /auth/me` session hydrate.
- Setup login/register/logout.
- Setup middleware redirect.
- Setup role layouts.
- Setup role-based navigation.
- Setup forbidden page.

### Phase 2 — Admin core management + Owner horse/registration flow

- Admin dashboard.
- Tournament CRUD minimal.
- Admin race schedule/list.
- Admin race detail routes:
  - `/admin/races/[raceId]`
  - `/admin/races/[raceId]/participants`
  - `/admin/races/[raceId]/assignments`
  - `/admin/races/[raceId]/results`
- Owner horse portfolio.
- Horse create/edit.
- Horse approval.
- Owner tournament list/detail/register.
- Owner registration status.
- Admin registration approval Kanban.

### Phase 3 — Jockey invitation + Referee checklist/result flow

- Owner invite jockey.
- Jockey invitation inbox/detail.
- Jockey accept/reject.
- Referee assignment list.
- Referee pre-race checklist.
- Referee live monitoring minimal.
- Referee result entry.
- Admin result review entry point.

### Phase 4 — Public/Spectator live race + prediction + notification

- Public race list.
- Public `/races/[raceId]` live view.
- Spectator `/spectator/races/[raceId]` authenticated view.
- Prediction create/history.
- Socket.IO race events.
- Notification dropdown.
- Role notification routes:
  - `/admin/notifications`
  - `/owner/notifications`
  - `/jockey/notifications`
  - `/referee/notifications`
  - `/spectator/notifications`

### Phase 5 — Reward + analytics + polish

- Reward summary/history.
- Admin reward management.
- Publish result polish.
- Ranking update.
- Admin charts with Recharts.
- Table/filter UX polish.
- Empty/loading/error state polish.
- Responsive/mobile polish.

## 17. Providers Architecture

Provider chỉ giữ mức đơn giản, đủ dùng cho dự án môn học.

```txt
providers/
├── query-provider.tsx
├── auth-provider.tsx
├── socket-provider.tsx
└── theme-provider.tsx
```

| Provider         | Mục đích                                | Ghi chú                                   |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| `QueryProvider`  | Cấu hình TanStack Query                 | Đặt trong root layout/app providers       |
| `AuthProvider`   | Lưu current user, hydrate từ `/auth/me` | Không lưu JWT; chỉ lưu user/session state |
| `SocketProvider` | Quản lý Socket.IO sau khi user login    | Connect sau auth; disconnect khi logout   |
| `ThemeProvider`  | Dark/light mode                         | Optional; chỉ làm nếu UI cần              |

Không cần provider nhiều tầng hoặc context phức tạp. Nếu state chỉ dùng trong một page/component thì dùng local state.

## 18. Data Fetching Strategy

| Khu vực               | Cách fetch                                     | Ghi chú                                            |
| --------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Public pages          | Server Component nếu dữ liệu tĩnh/SEO-friendly | Ví dụ landing, public tournament/race detail       |
| Dashboard pages       | Client Component + TanStack Query              | Dễ filter/refetch/invalidate                       |
| Form/mutation screens | TanStack Mutation                              | Submit form, approve/reject, create/update         |
| Live race             | Socket.IO nhận update realtime                 | Sau event thì update cache hoặc invalidate/refetch |
| Admin tables          | Query params cho search/filter/pagination      | Dễ share URL, dễ gọi API                           |

Không cần caching strategy phức tạp. Ưu tiên code rõ, dễ debug, dễ demo.

## 19. Server and Client Component Guideline

Nguyên tắc ngắn gọn:

- Mặc định dùng Server Component nếu page chỉ render dữ liệu.
- Dùng `"use client"` khi có:
  - state
  - form
  - button action
  - chart
  - table interaction
  - drag and drop
  - socket realtime
  - modal/dialog
- Không biến toàn bộ app thành Client Component.
- Page có thể là Server Component, bên trong import client component cho phần tương tác.

## 20. UI Design System

UI đủ dùng cho môn học, không cần enterprise design system.

- Styling chính: TailwindCSS.
- Component phổ biến: shadcn/ui hoặc custom clean UI.

Nên dùng shadcn/ui cho:

- `Button`
- `Card`
- `Dialog`
- `Form`
- `Input`
- `Select`
- `Table`
- `Badge`
- `Tabs`
- `Toast`

Reusable components đơn giản:

| Component         | Mục đích                            |
| ----------------- | ----------------------------------- |
| `AppSidebar`      | Sidebar dashboard theo role         |
| `AppTopbar`       | Header/topbar dashboard             |
| `PageHeader`      | Title, description, action button   |
| `StatCard`        | Metric card dashboard               |
| `StatusBadge`     | Hiển thị status                     |
| `DataTable`       | Table có pagination/filter đơn giản |
| `FormField`       | Wrapper field + error               |
| `EmptyState`      | Không có dữ liệu + CTA              |
| `LoadingSkeleton` | Loading cards/table                 |

Ưu tiên UI clean, dễ code, phù hợp demo môn học.

## 21. Error Handling Strategy

- `app/error.tsx` xử lý lỗi route-level.
- `app/not-found.tsx` xử lý 404.
- Toast hiển thị lỗi API/mutation.
- Form error hiển thị dưới input.
- API client normalize error message cơ bản.
- Unauthorized (`401`) → redirect `/login`.
- Forbidden (`403`) → hiện `/forbidden` hoặc message `You do not have permission`.

Không cần error boundary nhiều tầng.

## 22. Loading Strategy

- `app/loading.tsx` cho route loading.
- Skeleton UI cho dashboard cards/table.
- Button loading state khi submit form.
- Empty state khi không có dữ liệu.
- Không cần Suspense architecture phức tạp.

## 23. Responsive Strategy

- Mobile-first approach.
- Admin dashboard ưu tiên desktop/tablet.
- Horse Owner dashboard dùng responsive grid.
- Jockey screen ưu tiên mobile.
- Referee checklist ưu tiên tablet.
- Spectator live race page hỗ trợ cả mobile và desktop.

## 24. Scope Control for Course Project

Dự án phục vụ môn học, nên ưu tiên MVP rõ ràng, vừa sức team sinh viên.

Không cần làm:

- Multi-tenant architecture.
- Offline mode.
- Complex permission matrix ngoài RBAC cơ bản.
- Payment thật nếu không bắt buộc.
- Analytics quá nâng cao.
- Quá nhiều micro-interaction.
- Provider/context/store phức tạp.

Luồng nghiệp vụ chính cần ưu tiên:

1. Login/register.
2. Admin tạo tournament/race.
3. Owner thêm horse và đăng ký tournament.
4. Admin duyệt registration.
5. Jockey nhận invitation.
6. Referee checklist và nhập kết quả.
7. Spectator xem live race và prediction.
8. Notification cơ bản.

Mục tiêu: hoàn thành flow chính, UI rõ ràng, demo ổn định.

## 25. Naming convention

### 25.1 Folder/file

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

### 25.2 Route params

| Entity     | Param            |
| ---------- | ---------------- |
| Tournament | `[tournamentId]` |
| Race       | `[raceId]`       |
| Horse      | `[horseId]`      |
| User       | `[userId]`       |
| Invitation | `[invitationId]` |
| Result     | `[resultId]`     |

### 25.3 Type naming

```ts
type Horse = {};
type Race = {};
type Tournament = {};
type ApiResponse<T> = {};
type PaginatedResponse<T> = {};
type UserRole = "ADMIN" | "HORSE_OWNER" | "JOCKEY" | "REFEREE" | "SPECTATOR";
```

### 25.4 Status enum naming

```ts
HorseStatus.PENDING_APPROVAL;
RegistrationStatus.PENDING;
RegistrationStatus.APPROVED;
RegistrationStatus.REJECTED;
RegistrationStatus.NEED_MORE_INFO;
RaceStatus.LIVE;
ResultStatus.PUBLISHED;
InvitationStatus.ACCEPTED;
PredictionStatus.RESOLVED;
RewardStatus.ISSUED;
```

## 26. UX rules

1. Mọi list page có loading, error, empty state.
2. Mọi mutation quan trọng có loading + success/error toast.
3. Reject action luôn yêu cầu reason.
4. Need-more-info action phải có message rõ cho owner.
5. Approve/publish action dùng confirm dialog.
6. Prediction lock dựa server time, không dựa browser time.
7. Referee UI tablet-first: button lớn, sticky action bar.
8. Jockey UI mobile-first: action center đơn giản.
9. Admin table hỗ trợ filter/status/search/pagination.
10. Kanban approval dùng dnd-kit nhưng action cuối vẫn confirm.
11. Public live race không lộ dữ liệu chưa publish nếu backend chưa cho phép.
12. Public race view và spectator race view phải có CTA/permission rõ, không trộn user-specific data vào public page.

## 27. Security notes

- Access token lưu bằng httpOnly cookie.
- Refresh token/session refresh do backend xử lý.
- Không lưu JWT trong localStorage/sessionStorage.
- Không expose token vào JS runtime.
- API client gửi request kèm cookie theo cấu hình backend CORS.
- CSRF strategy cần thống nhất với backend nếu dùng cookie auth.
- `/auth/me` là nguồn hydrate current user phía FE.
- Middleware/layout guard chỉ hỗ trợ routing; backend RBAC là nguồn security cuối cùng.
- Client-side permission chỉ dùng UX.

## 28. Technical checklist

### Architecture

- [ ] Route group đúng Next.js App Router.
- [ ] Không có `react-router-dom`.
- [ ] Không có `src/pages`.
- [ ] Không có `routes/index.tsx`.
- [ ] Không có `ProtectedRoute` kiểu React SPA.
- [ ] Route dùng `app/` App Router.
- [ ] Role dashboard dùng route group + nested layout.
- [ ] Role-based navigation rõ ràng.
- [ ] Auth guard có middleware/layout/server util.
- [ ] Client guard không dùng làm security chính.

### Auth/security

- [ ] Auth dùng httpOnly cookie.
- [ ] FE không lưu JWT trong localStorage.
- [ ] FE gọi `GET /auth/me` để hydrate current user/session.
- [ ] Middleware redirect dashboard/auth route đúng.
- [ ] Server-side/layout role guard đủ chặt.
- [ ] Backend vẫn authorize mọi endpoint bằng JWT + RBAC.
- [ ] API wrapper gửi cookie/credentials đúng.

### Providers/Data/API

- [ ] Providers đã đủ và đơn giản.
- [ ] `QueryProvider`, `AuthProvider`, `SocketProvider` đã có vai trò rõ.
- [ ] `ThemeProvider` chỉ dùng nếu cần dark/light mode.
- [ ] Data fetching strategy rõ ràng.
- [ ] Public pages ưu tiên Server Component khi phù hợp.
- [ ] Dashboard pages dùng Client Component + TanStack Query.
- [ ] Form/mutation screens dùng TanStack Mutation.
- [ ] Admin tables dùng query params cho search/filter/pagination.
- [ ] API client tập trung.
- [ ] Service không chứa UI logic.
- [ ] TanStack Query provider setup.
- [ ] Query key factory thống nhất.
- [ ] Mutation invalidation rõ.
- [ ] Error response normalize.
- [ ] Module map đúng route/API/realtime event.

### Routes/modules

- [ ] Public race view và spectator view đã tách rõ.
- [ ] `/races/[raceId]` chỉ dùng public race data.
- [ ] `/spectator/races/[raceId]` có prediction/reward/user-specific actions.
- [ ] Admin race detail routes đã bổ sung.
- [ ] `/admin/races/[raceId]` đã có mục đích rõ.
- [ ] `/admin/races/[raceId]/participants` đã có mục đích rõ.
- [ ] `/admin/races/[raceId]/assignments` đã có mục đích rõ.
- [ ] `/admin/races/[raceId]/results` đã có mục đích rõ.
- [ ] Owner tournament registration routes đã bổ sung.
- [ ] `/owner/tournaments` đã có mục đích rõ.
- [ ] `/owner/tournaments/[tournamentId]` đã có mục đích rõ.
- [ ] `/owner/tournaments/[tournamentId]/register` đã có mục đích rõ.
- [ ] Notification routes đã chuẩn hóa theo role.
- [ ] Không còn route `/notifications` global mơ hồ.

### Form/validation

- [ ] React Hook Form dùng cho form phức tạp.
- [ ] Zod schema colocate trong feature.
- [ ] Reject/approval/prediction validation đầy đủ.
- [ ] Tournament registration validate eligible horse.
- [ ] Server-side error map vào form field.

### UI/components

- [ ] Server/client component usage rõ ràng.
- [ ] Không biến toàn bộ app thành Client Component.
- [ ] UI system phù hợp shadcn/ui + Tailwind.
- [ ] Shared component chỉ generic.
- [ ] Domain component đặt trong `features/*/components`.
- [ ] DataTable dùng TanStack Table.
- [ ] Chart dùng Recharts.
- [ ] Kanban/scheduler drag dùng dnd-kit.
- [ ] Error/loading state có quy ước.
- [ ] Loading/error/empty state chuẩn hóa.
- [ ] Responsive strategy rõ theo từng role.

### Realtime

- [ ] Socket.IO client connect sau auth với private events.
- [ ] Public race room tách với private user/role rooms.
- [ ] Join room theo user/race/role.
- [ ] Event map sang query update/invalidate.
- [ ] Cleanup listener khi unmount.
- [ ] Không duplicate event handler.

### Scope/MVP readiness

- [ ] Scope phù hợp dự án môn học, không over-engineering.
- [ ] Không yêu cầu multi-tenant/offline/permission matrix phức tạp.
- [ ] Tập trung hoàn thành luồng nghiệp vụ chính trước.

- [ ] Landing Page.
- [ ] Login/Register.
- [ ] App Layouts + API client.
- [ ] Admin Dashboard.
- [ ] Admin Registration Approval Kanban.
- [ ] Admin Race Schedule.
- [ ] Admin Race Detail.
- [ ] Owner Horse Portfolio.
- [ ] Owner Tournament Registration.
- [ ] Jockey Mobile Action Center.
- [ ] Referee Tablet Checklist.
- [ ] Public Race Detail Live View.
- [ ] Spectator Race Detail + Prediction.
- [ ] Role Notification Routes.
