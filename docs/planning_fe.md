# FE Planning — Horse Racing Tournament Management System MVP

## 1. Mục tiêu

Tài liệu này là FE planning cho MVP **Horse Racing Tournament Management System**.

Business model chính:

```txt
Tournament
→ gồm nhiều Race độc lập
→ mỗi Race có participant, jockey assignment, referee, result, ranking riêng
```

Mục tiêu FE:

- Dễ build MVP cho môn WDP.
- Dễ demo frontend/backend.
- Dễ generate UI bằng Stitch/v0/Lovable.
- Tránh over-engineering: không bracket, không race round, không round progression, không stage management.
- Tập trung core flow quản lý giải đua ngựa.

Tech stack giữ nguyên định hướng:

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
- dnd-kit chỉ dùng nếu thật cần cho approval UI
- Backend: NestJS REST API
- Auth: JWT + RBAC
- Database backend: MongoDB

---

## 2. Quyết định kiến trúc MVP

### 2.1 Dùng

| Nhóm         | Công nghệ                       | Ghi chú                                  |
| ------------ | ------------------------------- | ---------------------------------------- |
| Framework    | Next.js App Router              | Routing theo filesystem trong `app/`     |
| Language     | TypeScript                      | Strict-first                             |
| UI           | TailwindCSS + shadcn/ui/custom  | Ưu tiên clean reusable primitive         |
| Server state | TanStack Query                  | Cache, mutation, invalidation            |
| Form         | React Hook Form + Zod           | Schema validation thống nhất             |
| Realtime     | Socket.IO Client                | Race status/result/notification events   |
| Chart        | Recharts                        | Optional dashboard simple                |
| Table        | TanStack Table                  | Admin/list screens                       |
| Auth         | JWT bằng httpOnly cookie + RBAC | Guard bằng middleware/layout/server util |
| Backend API  | NestJS REST API                 | FE gọi qua API client wrapper            |

### 2.2 Không dùng/không làm trong MVP

| Không dùng                      | Lý do                                 |
| ------------------------------- | ------------------------------------- |
| `react-router-dom`              | Next App Router đã xử lý routing      |
| `ProtectedRoute` kiểu SPA       | Guard ở middleware/layout/server-side |
| `src/pages`                     | Không phù hợp App Router              |
| `routes/index.tsx`              | Không cần route config thủ công       |
| LocalStorage để lưu JWT         | Rủi ro XSS; dùng httpOnly cookie      |
| Redux mặc định                  | TanStack Query + local state đủ MVP   |
| RoundManager                    | Không có Race Round                   |
| StageManager                    | Không có tournament stage             |
| Bracket system                  | Ngoài scope MVP                       |
| Round progression logic         | Race độc lập, không progression       |
| Complex leaderboard aggregation | Ranking theo từng race là đủ          |
| Multi-stage scheduling          | Chỉ cần race schedule đơn giản        |

---

## 3. Business flow FE ưu tiên

```txt
Admin tạo tournament
→ Admin tạo race trong tournament
→ Owner tạo horse
→ Owner đăng ký horse vào race
→ Admin duyệt RaceRegistration
→ Owner/Jockey xác nhận JockeyAssignment
→ Jockey xem race schedule
→ Referee xem assigned race
→ Race started
→ Spectator xem live race + prediction lock trước giờ race
→ Race finished
→ Referee nhập/confirm RaceResult
→ Admin publish result
→ User xem race result + race ranking
→ Notification gửi tới role liên quan
```

Nguyên tắc:

- Tournament chỉ là container.
- Race là đơn vị chính của UI.
- Mỗi race có result/ranking riêng.
- Không có qualification flow.
- Không có round/stage management.
- Tournament leaderboard chỉ optional/simple.

---

## 4. Nguyên tắc frontend

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
11. Auth/RBAC kiểm tra theo 3 tầng: middleware → layout/server util → client permission UX.
12. Server state không đưa vào global store.
13. Realtime event chỉ update/invalidate query có kiểm soát.
14. Component business-specific không đặt vào shared global.
15. Ưu tiên page rõ, ít abstraction, dễ demo.

---

## 5. Cấu trúc thư mục đề xuất

```txt
fe/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── forbidden/page.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── tournaments/page.tsx
│   │   ├── tournaments/[tournamentId]/page.tsx
│   │   ├── races/page.tsx
│   │   └── races/[raceId]/page.tsx
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
│       │   ├── races/page.tsx
│       │   ├── races/new/page.tsx
│       │   ├── races/[raceId]/page.tsx
│       │   ├── races/[raceId]/participants/page.tsx
│       │   ├── races/[raceId]/assignments/page.tsx
│       │   ├── races/[raceId]/results/page.tsx
│       │   ├── registrations/page.tsx
│       │   └── notifications/page.tsx
│       ├── owner/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── horses/page.tsx
│       │   ├── horses/new/page.tsx
│       │   ├── horses/[horseId]/page.tsx
│       │   ├── races/page.tsx
│       │   ├── races/[raceId]/page.tsx
│       │   ├── races/[raceId]/register/page.tsx
│       │   ├── registrations/page.tsx
│       │   ├── jockey-assignments/page.tsx
│       │   └── notifications/page.tsx
│       ├── jockey/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── assignments/page.tsx
│       │   ├── assignments/[assignmentId]/page.tsx
│       │   ├── schedule/page.tsx
│       │   └── notifications/page.tsx
│       ├── referee/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── assignments/page.tsx
│       │   ├── races/[raceId]/page.tsx
│       │   ├── races/[raceId]/violations/page.tsx
│       │   ├── races/[raceId]/result-entry/page.tsx
│       │   ├── reports/page.tsx
│       │   └── notifications/page.tsx
│       └── spectator/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── races/page.tsx
│           ├── races/[raceId]/page.tsx
│           ├── predictions/page.tsx
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
│   ├── races/
│   ├── horses/
│   ├── race-registrations/
│   ├── jockey-assignments/
│   ├── referee-reports/
│   ├── live-race/
│   ├── race-results/
│   ├── predictions/
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

Không có route cho round management, stage management, qualification flow.

---

## 6. Layout plan theo route group

| Route group                 | URL thật                      | Layout               | Mục đích                                          |
| --------------------------- | ----------------------------- | -------------------- | ------------------------------------------------- |
| `app/(public)`              | `/`, `/tournaments`, `/races` | Public header/footer | Landing, browse tournament/race, public live view |
| `app/(auth)`                | `/login`, `/register`         | Auth shell           | Guest-only auth flow                              |
| `app/(dashboard)`           | role dashboards               | Dashboard shell      | Sidebar/header base                               |
| `app/(dashboard)/admin`     | `/admin/*`                    | Admin layout         | Admin RBAC + operations                           |
| `app/(dashboard)/owner`     | `/owner/*`                    | Owner layout         | Horse/race registration                           |
| `app/(dashboard)/jockey`    | `/jockey/*`                   | Jockey layout        | Assignment + schedule                             |
| `app/(dashboard)/referee`   | `/referee/*`                  | Referee layout       | Result/report workflow                            |
| `app/(dashboard)/spectator` | `/spectator/*`                | Spectator layout     | Prediction UX                                     |

---

## 7. Auth/RBAC plan

- Access token lưu bằng httpOnly cookie.
- Refresh/session refresh do backend xử lý.
- FE không lưu JWT trong localStorage.
- FE gọi `GET /auth/me` để hydrate session.
- Middleware redirect sơ cấp.
- Layout/server util guard role chính.
- Client permission chỉ ẩn/hiện UI, không thay backend authorization.
- Backend NestJS vẫn authorize endpoint bằng JWT + RBAC guard.

Role guard ví dụ:

```ts
requireRole(["ADMIN"]);
requireRole(["HORSE_OWNER"]);
requireRole(["JOCKEY"]);
requireRole(["REFEREE"]);
requireRole(["SPECTATOR"]);
```

---

## 8. Route plan MVP

### 8.1 Public routes

| URL                           | Role | Page                  | Protected | Ghi chú                        |
| ----------------------------- | ---- | --------------------- | --------- | ------------------------------ |
| `/`                           | All  | Landing Page          | No        | Public entry                   |
| `/tournaments`                | All  | Tournament list       | No        | Published tournaments          |
| `/tournaments/[tournamentId]` | All  | Tournament detail     | No        | List races in tournament       |
| `/races`                      | All  | Race list/live list   | No        | Upcoming/live/published races  |
| `/races/[raceId]`             | All  | Race detail/live view | No        | Public live + published result |

### 8.2 Auth routes

| URL                | Role  | Page            | Protected  |
| ------------------ | ----- | --------------- | ---------- |
| `/login`           | Guest | Login           | Guest-only |
| `/register`        | Guest | Register        | Guest-only |
| `/forgot-password` | Guest | Forgot password | Guest-only |

### 8.3 Admin routes

| URL                                  | Page                          | Priority |
| ------------------------------------ | ----------------------------- | -------- |
| `/admin`                             | Dashboard                     | P0       |
| `/admin/users`                       | User management               | P2       |
| `/admin/tournaments`                 | Tournament management         | P0       |
| `/admin/tournaments/new`             | Create tournament             | P0       |
| `/admin/tournaments/[tournamentId]`  | Tournament detail + race list | P0       |
| `/admin/races`                       | Race schedule/list            | P0       |
| `/admin/races/new`                   | Create race                   | P0       |
| `/admin/races/[raceId]`              | Race detail                   | P0       |
| `/admin/races/[raceId]/participants` | Horse/jockey participants     | P0       |
| `/admin/races/[raceId]/assignments`  | Referee/jockey assignments    | P1       |
| `/admin/races/[raceId]/results`      | Result review/publish         | P0       |
| `/admin/registrations`               | RaceRegistration approval     | P0       |
| `/admin/notifications`               | Notifications                 | P2       |

### 8.4 Horse Owner routes

| URL                              | Page                         | Priority |
| -------------------------------- | ---------------------------- | -------- |
| `/owner`                         | Dashboard                    | P1       |
| `/owner/horses`                  | Horse portfolio              | P0       |
| `/owner/horses/new`              | Create horse                 | P0       |
| `/owner/horses/[horseId]`        | Horse detail/edit/status     | P1       |
| `/owner/races`                   | Available races              | P0       |
| `/owner/races/[raceId]`          | Race detail                  | P0       |
| `/owner/races/[raceId]/register` | Register horse to race       | P0       |
| `/owner/registrations`           | Registration status          | P0       |
| `/owner/jockey-assignments`      | Jockey assignment management | P1       |
| `/owner/notifications`           | Notifications                | P2       |

### 8.5 Jockey routes

| URL                                  | Page                 | Priority |
| ------------------------------------ | -------------------- | -------- |
| `/jockey`                            | Mobile action center | P0       |
| `/jockey/assignments`                | Assignment inbox     | P0       |
| `/jockey/assignments/[assignmentId]` | Assignment detail    | P0       |
| `/jockey/schedule`                   | Race schedule        | P0       |
| `/jockey/notifications`              | Notifications        | P2       |

### 8.6 Referee routes

| URL                                    | Page                  | Priority |
| -------------------------------------- | --------------------- | -------- |
| `/referee`                             | Tablet action center  | P0       |
| `/referee/assignments`                 | Assigned races        | P0       |
| `/referee/races/[raceId]`              | Race checklist/detail | P0       |
| `/referee/races/[raceId]/violations`   | Violation log         | P1       |
| `/referee/races/[raceId]/result-entry` | Result form           | P0       |
| `/referee/reports`                     | Submitted reports     | P2       |
| `/referee/notifications`               | Notifications         | P2       |

### 8.7 Spectator routes

| URL                         | Page                     | Priority |
| --------------------------- | ------------------------ | -------- |
| `/spectator`                | Dashboard                | P1       |
| `/spectator/races`          | Race list                | P0       |
| `/spectator/races/[raceId]` | Race detail + prediction | P0       |
| `/spectator/predictions`    | Prediction history       | P1       |
| `/spectator/notifications`  | Notifications            | P2       |

---

## 9. Public Race View vs Spectator Race View

| Route                       | Login                   | Mục đích                          | Dữ liệu                                                       | Action                                           |
| --------------------------- | ----------------------- | --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `/races/[raceId]`           | Không cần               | Public race detail/live view      | Race info, participants public, live status, published result | Không prediction                                 |
| `/spectator/races/[raceId]` | Bắt buộc role Spectator | Authenticated spectator race view | Public data + prediction status của user                      | Submit prediction, xem prediction history/status |

Nguyên tắc:

- Public route không fetch user-specific data.
- Spectator route dùng `/auth/me` + prediction API.
- Guest muốn prediction → CTA login redirect về spectator race page.

---

## 10. Module plan MVP

| Module                | Mục đích                                                | Routes                                                                                                   | Components chính                                                                                                | API cần gọi                                                                                                                                                      | Realtime event                                                             | Roles                    |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| Authentication        | Login/register/session/role redirect                    | `/login`, `/register`                                                                                    | `LoginForm`, `RegisterForm`, `AuthCard`, `SessionHydrator`                                                      | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`                                                                                   | `auth:session-expired` optional                                            | Guest, all               |
| Tournament Management | Admin tạo/sửa tournament; public/owner xem tournament   | `/admin/tournaments`, `/admin/tournaments/[tournamentId]`, `/tournaments`, `/tournaments/[tournamentId]` | `TournamentForm`, `TournamentCard`, `TournamentTable`, `TournamentDetail`, `RaceListInTournament`               | `GET /tournaments`, `GET /tournaments/:id`, `POST /tournaments`, `PATCH /tournaments/:id`                                                                        | `tournament:updated` optional                                              | Admin, Owner, Public     |
| Race Management       | Tạo race, race schedule, detail, participants, status   | `/admin/races`, `/admin/races/new`, `/admin/races/[raceId]`, `/races/[raceId]`                           | `RaceForm`, `RaceTable`, `RaceDetailPanel`, `RaceScheduleCard`, `ParticipantTable`                              | `GET /races`, `GET /races/:id`, `POST /races`, `PATCH /races/:id`, `GET /races/:id/participants`, `POST /races/:id/status`                                       | `race:started`, `race:finished`                                            | Admin, Public, all roles |
| Horse Management      | Owner quản lý horse, admin duyệt horse                  | `/owner/horses`, `/owner/horses/new`, `/owner/horses/[horseId]`                                          | `HorseForm`, `HorseCard`, `HorseStatusBadge`, `HorseApprovalPanel`                                              | `GET /horses/my`, `GET /horses/:id`, `POST /horses`, `PATCH /horses/:id`, `POST /admin/horses/:id/approve`                                                       | `horse:approved`, `horse:rejected`                                         | Owner, Admin             |
| Race Registration     | Owner đăng ký horse vào race; admin duyệt               | `/owner/races/[raceId]/register`, `/owner/registrations`, `/admin/registrations`                         | `RaceRegistrationForm`, `EligibleHorseSelect`, `RegistrationStatusBadge`, `RegistrationTable`, `ApprovalDialog` | `POST /races/:id/register`, `GET /registrations/my`, `GET /admin/registrations`, `POST /admin/registrations/:id/approve`, `POST /admin/registrations/:id/reject` | `registration:submitted`, `registration:approved`, `registration:rejected` | Owner, Admin             |
| Jockey Assignment     | Gán jockey cho horse trong race; jockey accept/reject   | `/owner/jockey-assignments`, `/jockey/assignments`, `/jockey/schedule`                                   | `JockeySearch`, `JockeyAssignmentForm`, `AssignmentInbox`, `RaceScheduleList`                                   | `GET /jockeys`, `POST /jockey-assignments`, `GET /jockey-assignments/received`, `POST /jockey-assignments/:id/accept`, `POST /jockey-assignments/:id/reject`     | `assignment:received`, `assignment:accepted`, `assignment:rejected`        | Owner, Jockey            |
| Referee Workflow      | Referee check race, log violation, submit result/report | `/referee/assignments`, `/referee/races/[raceId]`, `/referee/races/[raceId]/result-entry`                | `RaceChecklist`, `ViolationQuickAdd`, `ResultEntryForm`, `RefereeReportSummary`                                 | `GET /referee/assignments`, `GET /races/:id`, `POST /races/:id/violations`, `POST /races/:id/results`, `POST /races/:id/reports`                                 | `violation:created`, `result:submitted`                                    | Referee, Admin           |
| Race Result           | Review, confirm, publish race result                    | `/admin/races/[raceId]/results`, `/races/[raceId]`                                                       | `RaceResultManager`, `RaceRankingTable`, `PublishResultDialog`                                                  | `GET /races/:id/results`, `POST /races/:id/results/confirm`, `POST /races/:id/results/publish`                                                                   | `result:published`, `race:result-published`                                | Admin, Referee, Public   |
| Live Race Tracking    | Public/live race view + status timeline                 | `/races/[raceId]`, `/spectator/races/[raceId]`, `/owner/races/[raceId]`                                  | `LiveRaceTracker`, `RaceStatusTimeline`, `ParticipantLiveTable`, `RaceEventFeed`                                | `GET /races/:id`, `GET /races/:id/events`                                                                                                                        | `race:started`, `race:finished`                                            | Public, all roles        |
| Prediction            | Spectator dự đoán winner của race                       | `/spectator/races/[raceId]`, `/spectator/predictions`                                                    | `PredictionPanel`, `PredictionCountdown`, `PredictionOptionCard`, `PredictionHistoryTable`                      | `GET /races/:id/prediction-options`, `POST /predictions`, `GET /predictions/my`                                                                                  | `prediction:locked`, `result:published`                                    | Spectator                |
| Notification          | Inbox theo role, unread badge, realtime toast           | role notification routes                                                                                 | `NotificationDropdown`, `NotificationList`, `UnreadBadge`                                                       | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`                                                                             | `notification:new`, `notification:read`                                    | Auth roles               |
| Dashboard             | Role summary đơn giản                                   | role dashboards                                                                                          | `DashboardCard`, `MetricGrid`, `ActivityFeed`                                                                   | `GET /dashboard/*`                                                                                                                                               | optional                                                                   | Auth roles               |

---

## 11. Owner race registration flow

1. Owner vào `/owner/races`.
2. FE gọi danh sách race còn mở đăng ký.
3. Owner mở `/owner/races/[raceId]` để xem:
   - tournament chứa race
   - race schedule
   - điều kiện horse
   - số slot còn lại
   - prediction lock/result publish info nếu public
4. Owner vào `/owner/races/[raceId]/register`.
5. FE gọi danh sách horse eligible:
   - thuộc owner
   - status `APPROVED`
   - chưa đăng ký race này
   - không vi phạm rule race nếu có
6. Owner chọn horse, submit RaceRegistration.
7. Trạng thái registration:
   - `PENDING`
   - `APPROVED`
   - `REJECTED`
   - `NEED_MORE_INFO`
8. Owner theo dõi tại `/owner/registrations`.
9. Khi admin duyệt/từ chối/yêu cầu bổ sung → realtime notification + refetch registration.

---

## 12. Race result flow

```txt
Race finished
→ Referee mở result-entry
→ Referee nhập thứ hạng/timing/violation note
→ Referee confirm RaceResult
→ Admin review nếu cần
→ Admin publish result
→ Public/Spectator/Owner/Jockey xem race result + ranking
→ Prediction resolved
→ Notification sent
```

Rules FE cần reflect:

- Result form chỉ mở khi race finished.
- Publish button disabled nếu referee chưa confirm.
- Race ranking hiển thị theo RaceResult của race đó.
- Không tính điểm nhiều vòng.
- Tournament leaderboard nếu có chỉ là summary optional.

---

## 13. Feature module template

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
features/races/
├── components/race-form.tsx
├── components/race-card.tsx
├── components/race-status-badge.tsx
├── components/race-schedule-card.tsx
├── hooks/use-races.ts
├── hooks/use-race-detail.ts
├── hooks/use-create-race.ts
├── schemas/race.schema.ts
├── utils/race-status.ts
├── constants.ts
└── types.ts
```

---

## 14. Shared component strategy

| Component                            | Folder                     | Dùng cho                      | Ghi chú                             |
| ------------------------------------ | -------------------------- | ----------------------------- | ----------------------------------- |
| `Button`, `Input`, `Dialog`, `Badge` | `components/ui/`           | toàn app                      | shadcn/ui/custom primitive          |
| `AppHeader`                          | `components/layout/`       | dashboard layout              | user menu, notification, breadcrumb |
| `AppSidebar`                         | `components/layout/`       | dashboard layout              | menu theo role                      |
| `MobileBottomNav`                    | `components/navigation/`   | jockey/spectator mobile       | role-specific config                |
| `DataTable`                          | `components/data-display/` | admin/list screens            | TanStack Table                      |
| `DashboardCard`                      | `components/data-display/` | dashboard                     | KPI card                            |
| `EmptyState`                         | `components/feedback/`     | all pages                     | CTA-friendly                        |
| `ErrorState`                         | `components/feedback/`     | all pages                     | retry support                       |
| `ConfirmDialog`                      | `components/feedback/`     | approve/publish/delete/reject | danger/default variant              |
| `FormModal`                          | `components/forms/`        | create/edit quick forms       | RHF-compatible                      |
| `StatusBadge`                        | `components/ui/`           | generic status                | domain wrapper ở feature            |

---

## 15. State/API convention

### 15.1 API client

- `services/api-client.ts`: base URL, credentials/cookie config, error normalization.
- Gửi cookie bằng `credentials: 'include'` hoặc axios equivalent.
- FE không set Authorization header từ localStorage.
- Không gọi `fetch/axios` trực tiếp trong component.
- Service chỉ biết HTTP; không biết UI.
- App load gọi `GET /auth/me`.
- 401 → refresh/session nếu backend hỗ trợ → fail thì redirect `/login`.

### 15.2 Query keys

```ts
queryKeys.auth.me;
queryKeys.tournaments.all;
queryKeys.tournaments.detail(tournamentId);
queryKeys.races.all;
queryKeys.races.detail(raceId);
queryKeys.races.participants(raceId);
queryKeys.raceResults.detail(raceId);
queryKeys.horses.my;
queryKeys.registrations.my;
queryKeys.predictions.my(raceId);
queryKeys.notifications.list(filters);
```

### 15.3 Mutation invalidation

| Mutation               | Invalidate                                                              |
| ---------------------- | ----------------------------------------------------------------------- |
| Login/logout           | `auth.me`, role dashboard query                                         |
| Create tournament      | `tournaments.all`                                                       |
| Create race            | `races.all`, `tournaments.detail`                                       |
| Create horse           | `horses.my`, `admin.horseApprovals`                                     |
| Register race          | `registrations.my`, `races.detail`, `races.participants`                |
| Approve registration   | `registrations.pending`, `races.participants`, `notifications`          |
| Accept assignment      | `assignments.received`, `jockey.schedule`                               |
| Submit result          | `raceResults.detail`, `races.detail`                                    |
| Publish result         | `races.detail`, `raceResults.detail`, `predictions.my`, `notifications` |
| Mark notification read | `notifications.list`, `notifications.unreadCount`                       |

### 15.4 Store

`stores/` chỉ dùng cho UI state nếu thật cần:

- sidebar collapsed
- command palette open
- temporary client preference
- realtime connection status

Không đưa server entities vào store.

---

## 16. Realtime plan MVP

### 16.1 Socket connection

- Khởi tạo trong `providers/socket-provider.tsx` hoặc feature hook.
- Connect sau session hydrate nếu event private.
- Public live race có thể join room public `race:{raceId}`.
- Auth user join private room theo cookie/session.
- Room đơn giản:
  - `user:{userId}`
  - `race:{raceId}`
  - `role:admin`
  - `role:owner:{ownerId}`
  - `role:jockey:{jockeyId}`
  - `role:referee:{refereeId}`
  - `role:spectator:{spectatorId}`

### 16.2 Event mapping tối giản

| Event                    | FE action                               |
| ------------------------ | --------------------------------------- |
| `notification:new`       | prepend notification, unread +1, toast  |
| `race:started`           | update race detail/list query           |
| `race:finished`          | refetch race detail, enable result view |
| `race:result-published`  | refetch race, result, prediction        |
| `registration:submitted` | refetch admin registrations             |
| `registration:approved`  | refetch owner registration, toast       |
| `registration:rejected`  | refetch owner registration, toast       |
| `assignment:received`    | refetch jockey inbox, toast             |
| `assignment:accepted`    | refetch owner assignment list           |
| `prediction:locked`      | disable prediction form                 |
| `notification:read`      | update unread count                     |

Không cần event phức tạp cho bracket/round/stage/progression.

---

## 17. UI screen priority theo MVP

| Priority | Screen                             | Role                  | Lý do                                    |
| -------- | ---------------------------------- | --------------------- | ---------------------------------------- |
| P0       | Landing Page                       | Public                | Entry point                              |
| P0       | Login/Register                     | Guest                 | RBAC bắt buộc                            |
| P0       | App Layouts theo role              | Auth roles            | Điều hướng nhất quán                     |
| P0       | Admin Tournament List/Create       | Admin                 | Container cho race                       |
| P0       | Admin Race Schedule/List           | Admin                 | Core race operation                      |
| P0       | Admin Race Detail                  | Admin                 | Quản lý participants/assignments/results |
| P0       | Admin RaceRegistration Approval    | Admin                 | Core owner flow                          |
| P0       | Owner Horse Portfolio              | Owner                 | Core entity                              |
| P0       | Owner Race Registration            | Owner                 | Core registration flow                   |
| P0       | Jockey Assignment Inbox/Schedule   | Jockey                | Core jockey flow                         |
| P0       | Referee Result Entry               | Referee               | Core result flow                         |
| P0       | Public Race Detail Live View       | Public                | Demo live race                           |
| P0       | Spectator Race Detail + Prediction | Spectator             | Demo prediction                          |
| P0       | Race Result + Race Ranking         | Public/Auth           | Core output                              |
| P1       | Tournament Detail                  | Public/Owner/Admin    | List races in tournament                 |
| P1       | Notification Center theo role      | Auth roles            | Workflow update                          |
| P2       | Simple dashboard charts            | Admin                 | Nice-to-have                             |
| P2       | Rewards                            | Admin/Owner/Spectator | Optional sau MVP                         |

---

## 18. MVP roadmap

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

### Phase 2 — Admin tournament/race + Owner horse/registration

- Admin dashboard simple.
- Tournament CRUD minimal.
- Race CRUD + race schedule.
- Race detail routes:
  - `/admin/races/[raceId]`
  - `/admin/races/[raceId]/participants`
  - `/admin/races/[raceId]/assignments`
  - `/admin/races/[raceId]/results`
- Owner horse portfolio.
- Horse create/edit.
- Horse approval.
- Owner race list/detail/register.
- Owner registration status.
- Admin RaceRegistration approval.

### Phase 3 — Jockey assignment + Referee result flow

- Owner create jockey assignment.
- Jockey assignment inbox/detail.
- Jockey accept/reject.
- Jockey race schedule.
- Referee assigned race list.
- Referee race checklist/detail.
- Referee violation log minimal.
- Referee result entry.
- Admin result review/publish.

### Phase 4 — Public/Spectator live race + prediction + notification

- Public race list.
- Public `/races/[raceId]` live view.
- Spectator `/spectator/races/[raceId]` authenticated view.
- Prediction create/history.
- Socket.IO events:
  - race started
  - race finished
  - result published
  - notification new
- Notification dropdown + role notification routes.

### Phase 5 — Polish/optional

- Simple tournament leaderboard if needed.
- Reward summary/history if needed.
- Admin charts with Recharts.
- Table/filter UX polish.
- Empty/loading/error state polish.
- Responsive/mobile polish.

---

## 19. Providers Architecture

Provider đơn giản, đủ dùng cho môn học:

```txt
providers/
├── query-provider.tsx
├── auth-provider.tsx
├── socket-provider.tsx
└── theme-provider.tsx
```

| Provider         | Mục đích                                | Ghi chú                                 |
| ---------------- | --------------------------------------- | --------------------------------------- |
| `QueryProvider`  | Cấu hình TanStack Query                 | Đặt trong root layout/app providers     |
| `AuthProvider`   | Lưu current user, hydrate từ `/auth/me` | Không lưu JWT                           |
| `SocketProvider` | Quản lý Socket.IO sau login             | Connect sau auth; disconnect khi logout |
| `ThemeProvider`  | Dark/light mode                         | Optional                                |

Không cần provider nhiều tầng hoặc context phức tạp.

---

## 20. Data Fetching Strategy

| Khu vực               | Cách fetch                                | Ghi chú                                    |
| --------------------- | ----------------------------------------- | ------------------------------------------ |
| Public pages          | Server Component nếu SEO-friendly         | Landing, public tournament/race detail     |
| Dashboard pages       | Client Component + TanStack Query         | Dễ filter/refetch/invalidate               |
| Form/mutation screens | TanStack Mutation                         | Submit form, approve/reject, create/update |
| Live race             | Socket.IO + query invalidate              | Sau event update cache/refetch             |
| Admin tables          | Query params cho search/filter/pagination | Dễ share URL, dễ gọi API                   |

Không cần caching strategy phức tạp. Ưu tiên rõ, dễ debug, dễ demo.

---

## 21. Server and Client Component Guideline

- Mặc định dùng Server Component nếu page chỉ render dữ liệu.
- Dùng `"use client"` khi có state/form/button action/chart/table/socket/modal.
- Không biến toàn bộ app thành Client Component.
- Page có thể là Server Component, bên trong import client component cho phần tương tác.

---

## 22. UI Design System

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

| Component            | Mục đích                               |
| -------------------- | -------------------------------------- |
| `AppSidebar`         | Sidebar dashboard theo role            |
| `AppTopbar`          | Header/topbar dashboard                |
| `PageHeader`         | Title, description, action button      |
| `StatCard`           | Metric card dashboard                  |
| `StatusBadge`        | Hiển thị status                        |
| `DataTable`          | Table có pagination/filter đơn giản    |
| `FormField`          | Wrapper field + error                  |
| `EmptyState`         | Không có dữ liệu + CTA                 |
| `LoadingSkeleton`    | Loading cards/table                    |
| `RaceStatusTimeline` | Race started/finished/result published |
| `RaceRankingTable`   | Ranking trong từng race                |
| `PredictionPanel`    | Prediction flow                        |

Ưu tiên UI clean, race-centric, phù hợp demo.

---

## 23. Error/Loading/Responsive Strategy

### Error

- `app/error.tsx` xử lý lỗi route-level.
- `app/not-found.tsx` xử lý 404.
- Toast hiển thị lỗi API/mutation.
- Form error hiển thị dưới input.
- API client normalize error message cơ bản.
- 401 → redirect `/login`.
- 403 → `/forbidden` hoặc message rõ.

### Loading

- `app/loading.tsx` cho route loading.
- Skeleton UI cho dashboard cards/table.
- Button loading khi submit form.
- Empty state khi không có dữ liệu.
- Không cần Suspense architecture phức tạp.

### Responsive

- Mobile-first approach.
- Admin dashboard ưu tiên desktop/tablet.
- Owner dashboard responsive grid.
- Jockey screen ưu tiên mobile.
- Referee result entry ưu tiên tablet.
- Spectator live race hỗ trợ mobile + desktop.

---

## 24. Scope Control for Course Project

Dự án phục vụ môn học, ưu tiên MVP rõ, vừa sức team sinh viên.

Không cần làm:

- Multi-tenant architecture
- Offline mode
- Complex permission matrix ngoài RBAC cơ bản
- Payment thật nếu không bắt buộc
- Analytics nâng cao
- Micro-interaction phức tạp
- Provider/context/store phức tạp
- Race Round
- Multi-stage tournament
- Round progression
- Stage management
- Qualification flow
- Bracket/playoff/grand final
- Season point system
- Complex leaderboard aggregation

Luồng nghiệp vụ chính cần ưu tiên:

1. Login/register.
2. Admin tạo tournament.
3. Admin tạo race trong tournament.
4. Owner thêm horse.
5. Owner đăng ký horse vào race.
6. Admin duyệt RaceRegistration.
7. Jockey nhận assignment.
8. Referee nhập/confirm race result.
9. Admin publish result.
10. Spectator xem live race + prediction.
11. Notification cơ bản.

Mục tiêu: hoàn thành flow chính, UI rõ ràng, demo ổn định.

---

## 25. Naming convention

### 25.1 Folder/file

| Loại           | Convention                 | Ví dụ                 |
| -------------- | -------------------------- | --------------------- |
| Folder         | kebab-case                 | `jockey-assignments/` |
| Component file | kebab-case                 | `race-form.tsx`       |
| Component name | PascalCase                 | `RaceForm`            |
| Hook file      | kebab-case, starts `use-`  | `use-race-detail.ts`  |
| Hook name      | camelCase, starts `use`    | `useRaceDetail`       |
| Schema file    | kebab-case + `.schema.ts`  | `race.schema.ts`      |
| Type file      | kebab-case or domain       | `race.ts`, `types.ts` |
| Constant file  | kebab-case                 | `race-status.ts`      |
| Service file   | kebab-case + `.service.ts` | `races.service.ts`    |

### 25.2 Route params

| Entity     | Param            |
| ---------- | ---------------- |
| Tournament | `[tournamentId]` |
| Race       | `[raceId]`       |
| Horse      | `[horseId]`      |
| User       | `[userId]`       |
| Assignment | `[assignmentId]` |
| Result     | `[resultId]`     |

### 25.3 Type naming

```ts
type Horse = {};
type Race = {};
type Tournament = {};
type RaceRegistration = {};
type JockeyAssignment = {};
type RaceResult = {};
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
AssignmentStatus.PENDING;
AssignmentStatus.ACCEPTED;
RaceStatus.SCHEDULED;
RaceStatus.LIVE;
RaceStatus.FINISHED;
RaceStatus.RESULT_PUBLISHED;
ResultStatus.DRAFT;
ResultStatus.REFEREE_CONFIRMED;
ResultStatus.PUBLISHED;
PredictionStatus.LOCKED;
PredictionStatus.RESOLVED;
```

---

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
10. Public live race không lộ dữ liệu chưa publish nếu backend chưa cho phép.
11. Public race view và spectator race view phải có CTA/permission rõ.
12. Race result/ranking phải ghi rõ thuộc race nào.
13. Tournament detail phải show danh sách race, không show stage/round.

---

## 27. Security notes

- Access token lưu bằng httpOnly cookie.
- Refresh/session refresh do backend xử lý.
- Không lưu JWT trong localStorage/sessionStorage.
- Không expose token vào JS runtime.
- API client gửi request kèm cookie theo backend CORS config.
- CSRF strategy cần thống nhất với backend nếu dùng cookie auth.
- `/auth/me` là nguồn hydrate current user phía FE.
- Middleware/layout guard chỉ hỗ trợ routing.
- Backend RBAC là nguồn security cuối cùng.
- Client-side permission chỉ dùng UX.

---

## 28. Technical checklist

### Architecture

- [ ] Route group đúng Next.js App Router.
- [ ] Không có `react-router-dom`.
- [ ] Không có `src/pages`.
- [ ] Không có `routes/index.tsx`.
- [ ] Không có `ProtectedRoute` kiểu SPA.
- [ ] Route dùng `app/` App Router.
- [ ] Role dashboard dùng route group + nested layout.
- [ ] Role-based navigation rõ ràng.
- [ ] Auth guard có middleware/layout/server util.
- [ ] Client guard không dùng làm security chính.

### Scope/MVP

- [ ] Tournament chỉ là container cho nhiều race.
- [ ] Race là đơn vị nghiệp vụ chính.
- [ ] Không có Race Round.
- [ ] Không có round management route.
- [ ] Không có stage management route.
- [ ] Không có qualification flow.
- [ ] Không có bracket/playoff/grand final.
- [ ] Không có round progression logic.
- [ ] Không có complex leaderboard aggregation.
- [ ] Ranking theo từng race.
- [ ] Tournament leaderboard optional/simple.

### Auth/security

- [ ] Auth dùng httpOnly cookie.
- [ ] FE không lưu JWT trong localStorage.
- [ ] FE gọi `GET /auth/me` để hydrate current user/session.
- [ ] Middleware redirect dashboard/auth route đúng.
- [ ] Server-side/layout role guard đủ chặt.
- [ ] Backend authorize endpoint bằng JWT + RBAC.
- [ ] API wrapper gửi cookie/credentials đúng.

### Providers/Data/API

- [ ] Providers đủ và đơn giản.
- [ ] `QueryProvider`, `AuthProvider`, `SocketProvider` có vai trò rõ.
- [ ] `ThemeProvider` chỉ dùng nếu cần dark/light mode.
- [ ] Data fetching strategy rõ.
- [ ] API client tập trung.
- [ ] Service không chứa UI logic.
- [ ] TanStack Query provider setup.
- [ ] Query key factory thống nhất.
- [ ] Mutation invalidation rõ.
- [ ] Error response normalize.

### Routes/modules

- [ ] Public race view và spectator view tách rõ.
- [ ] `/races/[raceId]` chỉ dùng public race data.
- [ ] `/spectator/races/[raceId]` có prediction user-specific actions.
- [ ] Admin tournament create/list/detail có mục đích rõ.
- [ ] Admin race create/list/detail có mục đích rõ.
- [ ] `/admin/races/[raceId]/participants` rõ.
- [ ] `/admin/races/[raceId]/assignments` rõ.
- [ ] `/admin/races/[raceId]/results` rõ.
- [ ] Owner race registration routes rõ.
- [ ] Notification routes chuẩn hóa theo role.

### Form/validation

- [ ] React Hook Form dùng cho form phức tạp.
- [ ] Zod schema colocate trong feature.
- [ ] Reject/approval/prediction validation đầy đủ.
- [ ] Race registration validate eligible horse.
- [ ] Server-side error map vào form field.
- [ ] Jockey conflict validation hiển thị rõ khi trùng giờ race.

### UI/components

- [ ] Server/client component usage rõ.
- [ ] Không biến toàn bộ app thành Client Component.
- [ ] UI system phù hợp shadcn/ui + Tailwind.
- [ ] Shared component chỉ generic.
- [ ] Domain component đặt trong `features/*/components`.
- [ ] DataTable dùng TanStack Table nếu cần.
- [ ] Chart dùng Recharts nếu cần.
- [ ] Error/loading/empty state chuẩn hóa.
- [ ] Responsive strategy rõ theo role.

### Realtime

- [ ] Socket.IO client connect sau auth với private events.
- [ ] Public race room tách với private user/role rooms.
- [ ] Event map tối giản: race started, race finished, result published, notification.
- [ ] Event map sang query update/invalidate.
- [ ] Cleanup listener khi unmount.
- [ ] Không duplicate event handler.

### MVP screens

- [ ] Landing Page.
- [ ] Login/Register.
- [ ] App Layouts + API client.
- [ ] Admin Tournament List/Create.
- [ ] Admin Race Schedule/List.
- [ ] Admin Race Detail.
- [ ] Admin RaceRegistration Approval.
- [ ] Owner Horse Portfolio.
- [ ] Owner Race Registration.
- [ ] Jockey Assignment Inbox/Schedule.
- [ ] Referee Result Entry.
- [ ] Public Race Detail Live View.
- [ ] Spectator Race Detail + Prediction.
- [ ] Race Result + Race Ranking.
- [ ] Role Notification Routes.

---

## 29. Wording chuẩn

Dùng thống nhất:

- “Race” thay cho “round/stage”.
- “Race result” thay cho “qualification”.
- “Race schedule” thay cho “tournament stage”.
- “Race ranking” cho ranking từng race.
- “Tournament leaderboard” chỉ optional/simple.

Không dùng trong MVP:

- Race Round
- RoundManager
- StageManager
- Multi-stage scheduling
- Advanced tournament progression
- Qualification flow
- Championship bracket
- Playoff
- Grand final
- Season point system
- Complex leaderboard aggregation

---

## 30. Final output target

FE docs sau refactor phải hỗ trợ AI tools generate UI/demo nhanh:

- Clean route map.
- Race-centric screen priority.
- MVP-focused modules.
- Business flow nhất quán.
- Không over-engineering.
- Ready cho Next.js + TypeScript + Tailwind + shadcn/ui + TanStack Query + Socket.IO + NestJS backend.
