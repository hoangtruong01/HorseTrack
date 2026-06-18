# UI Test Flows — HorseTrack

> Cover toàn bộ 26 module BE. Chạy theo thứ tự từ Flow 1 → Flow 15.

## Tài khoản test cần chuẩn bị

| Role | Email gợi ý | Ghi chú |
|------|-------------|---------|
| Admin | admin@test.com | Full access |
| Owner | owner@test.com | Quản lý ngựa, đăng ký |
| Jockey | jockey@test.com | Cần tạo profile |
| Referee | referee@test.com | Cần tạo profile |
| Spectator | spectator@test.com | Dự đoán, AI |
| Counter Staff | counter@test.com | Xử lý cashout |

---

## FLOW 1 — Xác thực & Quản lý User

### 1.1 Đăng ký & Đăng nhập

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 1.1.1 | Vào `/register`, điền email/password mới → Submit | `POST /auth/register` | Tài khoản tạo thành công, redirect về login |
| 1.1.2 | Login bằng email/password | `POST /auth/login` | Cookie `access_token` set, vào dashboard |
| 1.1.3 | Logout rồi mở tab mới → cookie hết → tự redirect login | `POST /auth/refresh` | Token refresh tự động khi còn hạn |
| 1.1.4 | Vào `/login` → click "Đăng nhập Google" | `POST /auth/google` | OAuth redirect, login thành công |
| 1.1.5 | Settings → đổi mật khẩu | `PATCH /auth/password` | Mật khẩu cập nhật, cần login lại |
| 1.1.6 | Gọi `/auth/me` sau khi login | `GET /auth/me` | Trả về profile user hiện tại |

### 1.2 Quản lý User (Admin)

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 1.2.1 | Admin → `/admin/users`, xem danh sách | `GET /users` | Bảng user, filter được theo role/status |
| 1.2.2 | Tạo user mới từ admin panel | `POST /users` | User mới xuất hiện trong list |
| 1.2.3 | Click user → xem profile đầy đủ | `GET /users/:id` | Tất cả thông tin user |
| 1.2.4 | Xem public profile (không cần auth) | `GET /users/:id/public` | Chỉ hiện thông tin công khai |
| 1.2.5 | Sửa thông tin user | `PATCH /users/:id` | Thông tin cập nhật |
| 1.2.6 | Ban user | `PATCH /users/:id/ban` | Status → BANNED |
| 1.2.7 | Unban user vừa ban | `PATCH /users/:id/unban` | Status → ACTIVE |
| 1.2.8 | Gán role mới cho user | `POST /users/:id/roles` | Role xuất hiện trong danh sách role |
| 1.2.9 | Xóa role vừa gán | `DELETE /users/:id/roles/:role` | Role bị gỡ |
| 1.2.10 | Soft delete user | `DELETE /users/:id` | User biến khỏi danh sách active |

---

## FLOW 2 — Ngựa (Horse)

### 2.1 Owner tạo & quản lý ngựa

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 2.1.1 | Owner → "Thêm ngựa", điền form + upload ảnh | `POST /uploads` → `POST /horses` | Horse tạo với status PENDING |
| 2.1.2 | Upload ảnh > 5MB | `POST /uploads` | Lỗi "File too large" |
| 2.1.3 | Owner xem danh sách ngựa của mình | `GET /horses/my-horses` | Chỉ ngựa của owner đó |
| 2.1.4 | Click ngựa → xem detail (không login) | `GET /horses/:id` | Public detail, không cần auth |
| 2.1.5 | Owner sửa thông tin ngựa | `PATCH /horses/:id` | Thông tin cập nhật |
| 2.1.6 | Owner soft delete ngựa | `DELETE /horses/:id` | Ngựa không còn trong list active |

### 2.2 Admin duyệt ngựa

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 2.2.1 | Admin → `/admin/horses`, filter status = PENDING | `GET /horses` | Danh sách ngựa chờ duyệt |
| 2.2.2 | Admin approve ngựa | `PATCH /horses/:id/approve` | Status → APPROVED |
| 2.2.3 | Admin reject ngựa khác (điền lý do) | `PATCH /horses/:id/reject` | Status → REJECTED |
| 2.2.4 | Owner xem ngựa bị reject → thấy rejection reason | `GET /horses/my-horses` | Lý do từ chối hiển thị |

---

## FLOW 3 — Jockey Profile

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 3.1 | Jockey → tạo profile, điền thông tin kỹ năng | `POST /jockeys/profile` | Profile tạo, status PENDING |
| 3.2 | Jockey xem profile của mình | `GET /jockeys/me` | Profile detail đầy đủ |
| 3.3 | Public xem list jockeys (không login) | `GET /jockeys` | Chỉ jockeys có status available |
| 3.4 | Public xem profile jockey theo id | `GET /jockeys/:id` | Public detail |
| 3.5 | Admin → approve jockey (kèm lý do nếu có) | `PATCH /jockeys/:id/approval` | Status → APPROVED |
| 3.6 | Admin reject jockey | `PATCH /jockeys/:id/approval` (reject) | Status → REJECTED |
| 3.7 | Admin xem tất cả jockeys (kể cả suspended) | `GET /jockeys/admin/all` | Full list bao gồm mọi status |
| 3.8 | Admin suspend jockey | `PATCH /jockeys/:id/status` (suspended) | Status → suspended |
| 3.9 | Jockey sửa profile | `PATCH /jockeys/:id` | Profile cập nhật |

---

## FLOW 4 — Referee Profile

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 4.1 | Referee → tạo profile | `POST /referee-profiles` | Profile PENDING |
| 4.2 | Referee xem profile của mình | `GET /referee-profiles/me` | Profile detail |
| 4.3 | Public xem profile referee | `GET /referee-profiles/:id` | Public detail |
| 4.4 | Admin xem tất cả referee profiles | `GET /referee-profiles` | Full list |
| 4.5 | Admin approve referee | `PATCH /referee-profiles/:id/approval` | Status → APPROVED |
| 4.6 | Admin reject referee | `PATCH /referee-profiles/:id/approval` (reject) | Status → REJECTED |
| 4.7 | Admin suspend referee | `PATCH /referee-profiles/:id/status` (suspended) | Status → suspended |
| 4.8 | Admin activate lại referee | `PATCH /referee-profiles/:id/status` (available) | Status → available |
| 4.9 | Referee sửa profile | `PATCH /referee-profiles/:id` | Profile cập nhật |

---

## FLOW 5 — Tournament & Race Setup

> **Điều kiện trước:** Admin đã login.

### 5.1 Tạo Tournament

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 5.1.1 | Admin → Tạo tournament, upload ảnh, điền thông tin | `POST /tournaments` | Status = DRAFT |
| 5.1.2 | Public xem list tournaments (không login) | `GET /tournaments` | Tournament xuất hiện |
| 5.1.3 | Public xem tournament detail | `GET /tournaments/:id` | Detail page |
| 5.1.4 | Admin sửa thông tin tournament | `PATCH /tournaments/:id` | Cập nhật |
| 5.1.5 | Admin chuyển status → OPEN_REGISTRATION | `PATCH /tournaments/:id/status` | Mở đăng ký |
| 5.1.6 | Admin chuyển status → CLOSED_REGISTRATION | `PATCH /tournaments/:id/status` | Đóng đăng ký |
| 5.1.7 | Admin chuyển status → ONGOING | `PATCH /tournaments/:id/status` | Đang diễn ra |
| 5.1.8 | Admin soft delete tournament | `DELETE /tournaments/:id` | Xóa khỏi list active |

### 5.2 Tạo Race trong Tournament

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 5.2.1 | Admin → Tạo race thuộc tournament vừa tạo | `POST /races` | Race tạo, status SCHEDULED |
| 5.2.2 | Public xem races theo tournament | `GET /races/tournament/:tournamentId` | List races của tournament |
| 5.2.3 | Public xem tất cả races | `GET /races` | List tất cả |
| 5.2.4 | Public xem race detail | `GET /races/:id` | Detail page |
| 5.2.5 | Admin sửa thông tin race | `PATCH /races/:id` | Cập nhật |
| 5.2.6 | Admin soft delete race | `DELETE /races/:id` | Xóa khỏi list |

---

## FLOW 6 — Đăng ký Ngựa (Registration)

> **Điều kiện trước:** Tournament ở OPEN_REGISTRATION, ngựa đã APPROVED.

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 6.1 | Owner → chọn race → "Đăng ký ngựa" | `POST /registrations` | Registration tạo, status PENDING |
| 6.2 | Owner thử đăng ký lại ngựa đó vào cùng race | `POST /registrations` | Lỗi "đã đăng ký" |
| 6.3 | Owner thử đăng ký ngựa chưa APPROVED | `POST /registrations` | Lỗi validation |
| 6.4 | Owner xem danh sách đăng ký của mình | `GET /registrations/my-registrations` | List đăng ký |
| 6.5 | Admin xem tất cả đăng ký, filter theo status | `GET /registrations` | Bảng đầy đủ |
| 6.6 | Admin xem detail registration | `GET /registrations/:id` | Detail |
| 6.7 | Admin approve đăng ký | `PATCH /registrations/:id/approve` | Status → APPROVED |
| 6.8 | Admin reject đăng ký khác (kèm lý do) | `PATCH /registrations/:id/reject` | Status → REJECTED |
| 6.9 | Owner cancel đăng ký đang PENDING | `PATCH /registrations/:id/cancel` | Status → CANCELLED |
| 6.10 | Owner cancel đăng ký đang REJECTED | `PATCH /registrations/:id/cancel` | Status → CANCELLED |
| 6.11 | Owner withdraw đăng ký đã APPROVED | `PATCH /registrations/:id/withdraw` | Status → WITHDRAWN |
| 6.12 | Owner thử cancel đăng ký đã APPROVED | `PATCH /registrations/:id/cancel` | Lỗi "không thể cancel trạng thái này" |

---

## FLOW 7 — Mời Jockey

> **Điều kiện trước:** Owner có ngựa APPROVED, Jockey đã có profile APPROVED.

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 7.1 | Owner → Mời jockey A cho ngựa của mình | `POST /jockey-invitations` | Invitation PENDING |
| 7.2 | Owner xem danh sách lời mời đã gửi | `GET /jockey-invitations/sent` | List sent |
| 7.3 | Jockey A xem lời mời nhận được | `GET /jockey-invitations/received` | List received |
| 7.4 | Jockey A chấp nhận lời mời | `PATCH /jockey-invitations/:id/respond` (accept) | Status → ACCEPTED |
| 7.5 | Owner gửi lời mời cho jockey B → Owner cancel | `PATCH /jockey-invitations/:id/cancel` | Status → CANCELLED |
| 7.6 | Owner gửi lời mời cho jockey C | `POST /jockey-invitations` | Invitation PENDING |
| 7.7 | Jockey C từ chối | `PATCH /jockey-invitations/:id/respond` (decline) | Status → DECLINED |

---

## FLOW 8 — Race Day (Referee Operations)

> **Điều kiện trước:** Race SCHEDULED, có ít nhất 3 registrations APPROVED.

### 8.1 Phân công Referee

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 8.1.1 | Admin xem danh sách available referees cho race | `GET /referee-assignments/available-referees` | List referees có thể giao |
| 8.1.2 | Admin giao referee cho race | `POST /referee-assignments` | Assignment tạo, status PENDING |
| 8.1.3 | Admin xem assignments của race | `GET /referee-assignments/race/:raceId` | List assignments |
| 8.1.4 | Referee xem assignments của mình | `GET /referee-assignments/my-assignments` | List |
| 8.1.5 | Referee accept assignment | `PATCH /referee-assignments/:id/respond` (accept) | Status → ACCEPTED |
| 8.1.6 | Admin remove assignment | `DELETE /referee-assignments/:id` | Assignment xóa |

### 8.2 Kiểm tra sức khỏe (Race CHECKING)

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 8.2.1 | Admin chuyển race → CHECKING | `PATCH /races/:id/status` | Status cập nhật |
| 8.2.2 | Referee khởi tạo health checks cho race | `POST /race-checks/race/:raceId/initialize` | Tạo check cho mỗi ngựa registered |
| 8.2.3 | Public xem health checks | `GET /race-checks/race/:raceId` | List checks |
| 8.2.4 | Referee cập nhật check → passed | `PATCH /race-checks/:id` | Status passed |
| 8.2.5 | Referee cập nhật check → failed (1 ngựa) | `PATCH /race-checks/:id` | Status failed |

### 8.3 Race Ready → Live

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 8.3.1 | Admin chuyển race → READY | `PATCH /races/:id/status` | READY |
| 8.3.2 | Admin/Referee cập nhật điều kiện đường đua, thời tiết | `PATCH /races/:id/conditions` | Track + weather cập nhật |
| 8.3.3 | Admin chuyển race → LIVE | `PATCH /races/:id/status` | LIVE |
| 8.3.4 | Referee báo cáo vi phạm trong race | `POST /race-violations` | Violation ghi lại |
| 8.3.5 | Public xem violations của race | `GET /race-violations/race/:raceId` | List violations |
| 8.3.6 | Admin xem tất cả violations | `GET /race-violations` | Full list |

### 8.4 Nhập kết quả (Race FINISHED)

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 8.4.1 | Admin chuyển race → FINISHED | `PATCH /races/:id/status` | FINISHED |
| 8.4.2 | Referee nhập kết quả từng ngựa (bulk) | `POST /race-results/race/:raceId/bulk` | Nhiều results tạo, status DRAFT |
| 8.4.3 | Referee dùng simulate để auto tạo results | `POST /race-results/race/:raceId/simulate` | Results tự động tạo |
| 8.4.4 | Referee xem results (thấy DRAFT) | `GET /race-results/race/:raceId` | List với status DRAFT |
| 8.4.5 | Referee cập nhật 1 result (sửa thứ hạng) | `PATCH /race-results/:id` | Cập nhật |
| 8.4.6 | Referee nhập thêm 1 result đơn lẻ | `POST /race-results` | Result tạo |
| 8.4.7 | Referee confirm results | `PATCH /race-results/race/:raceId/confirm` | → CONFIRMED |
| 8.4.8 | Referee submit report sau race | `POST /referee-reports` | Report lưu |
| 8.4.9 | Xem reports của race | `GET /referee-reports/race/:raceId` | List reports |
| 8.4.10 | Admin xem tất cả reports | `GET /referee-reports` | Full list |
| 8.4.11 | Admin publish results | `PATCH /race-results/race/:raceId/publish` | → PUBLISHED |
| 8.4.12 | Admin chuyển race → RESULT_PUBLISHED | `PATCH /races/:id/status` | Final |
| 8.4.13 | Referee ghi race records (metrics chi tiết) | `POST /race-records` | Metrics lưu |
| 8.4.14 | Xem records theo race | `GET /race-records/race/:raceId` | Metrics list |
| 8.4.15 | Xem records lịch sử theo ngựa | `GET /race-records/horse/:horseId` | History ngựa |
| 8.4.16 | Public xem results tournament | `GET /race-results/tournament/:tournamentId` | Kết quả toàn giải |

---

## FLOW 9 — Predictions (Spectator đặt cược điểm)

> **Điều kiện trước:** Race đang READY hoặc LIVE, Spectator đã login.

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 9.1 | Spectator chọn race → đặt dự đoán ngựa X thắng | `POST /predictions` | Prediction PENDING, điểm bị trừ |
| 9.2 | Spectator thử đặt thêm 1 lần nữa cùng race | `POST /predictions` | Lỗi "đã đặt dự đoán" |
| 9.3 | Spectator xem danh sách predictions của mình | `GET /predictions/my-predictions` | List |
| 9.4 | Spectator cancel prediction | `POST /predictions/:id/cancel` | Status CANCELLED, điểm hoàn lại |
| 9.5 | Spectator đặt lại sau khi cancel | `POST /predictions` | Prediction mới PENDING |
| 9.6 | Admin xem tất cả predictions | `GET /predictions` | Full list với filter |
| 9.7 | Sau race RESULT_PUBLISHED → Spectator xem kết quả | `GET /predictions/my-predictions` | WON/LOST hiển thị |

---

## FLOW 10 — AI Subscription

> **Điều kiện trước:** Spectator đã login.

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 10.1 | Admin tạo AI prediction package (điền giá, số lượt) | `POST /ai/packages` | Package tạo |
| 10.2 | Public xem danh sách AI packages (không login) | `GET /ai/packages` | List packages active |
| 10.3 | Spectator chọn package → subscribe | `POST /ai/subscribe` | PayOS payment URL trả về |
| 10.4 | Simulate PayOS webhook callback thành công | `POST /ai/payments/webhook` | Subscription activated |
| 10.5 | Spectator kiểm tra có subscription không | `GET /ai/check-subscription` | `{ hasActive: true }` |
| 10.6 | Spectator xem subscription detail | `GET /ai/my-subscription` | Thông tin gói, ngày hết hạn |
| 10.7 | Spectator generate AI predictions cho race | `POST /ai/predictions/generate/:raceId` | Predictions generated |
| 10.8 | Spectator xem AI prediction suggestions | `GET /ai/predictions/:raceId` | Danh sách gợi ý |
| 10.9 | Spectator chưa subscribe thử xem predictions | `GET /ai/predictions/:raceId` | Lỗi "cần subscription" |
| 10.10 | Admin xem revenue từ AI subscriptions | `GET /ai/payments` | Revenue report |

---

## FLOW 11 — Wallet & Cashout

> **Điều kiện trước:** Spectator có điểm từ predictions thắng (hoặc admin thêm điểm).

### 11.1 Xem số dư & lịch sử

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 11.1.1 | Spectator xem số dư điểm hiện tại | `GET /reward-point-ledger/my-balance` | Balance hiển thị |
| 11.1.2 | Spectator xem lịch sử điểm (cộng/trừ) | `GET /reward-point-ledger/my-history` | Ledger entries có pagination |
| 11.1.3 | Spectator xem wallet balance + transaction history | `GET /wallet/history` | Balance + danh sách giao dịch |
| 11.1.4 | Admin xem tất cả ledger entries | `GET /reward-point-ledger` | Full list |

### 11.2 Cashout Request

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 11.2.1 | Spectator tạo cashout request (nhập số điểm đổi) | `POST /wallet/cashout` | Request PENDING, mã đổi thưởng tạo |
| 11.2.2 | Spectator xem danh sách cashout requests của mình | `GET /wallet/cashout/my-requests` | List với status |
| 11.2.3 | Admin/Counter xem tất cả cashout requests | `GET /wallet/cashout/all` | Full list, filter theo status |
| 11.2.4 | Counter lookup request bằng mã đổi thưởng | `GET /wallet/cashout/lookup?code=...` | Request detail |
| 11.2.5 | Admin approve cashout request | `PATCH /wallet/cashout/:id/process` (approve) | Status → APPROVED |
| 11.2.6 | Counter xác nhận đã chi tiền (payout) | `PATCH /wallet/cashout/:id/process` (paid) | Status → PAID |
| 11.2.7 | Admin reject cashout request khác (kèm lý do) | `PATCH /wallet/cashout/:id/process` (reject) | Status → REJECTED, rejectedBy hiển thị |
| 11.2.8 | Admin xem tất cả wallet transactions | `GET /wallet/all-transactions` | Admin-level view |
| 11.2.9 | Admin xem wallet history của user cụ thể | `GET /wallet/user/:userId/history` | User transaction history |

---

## FLOW 12 — Rankings & Prizes

### 12.1 Rankings

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 12.1.1 | Public xem rankings ngựa theo tournament | `GET /rankings/tournament/:id/horses` | Bảng xếp hạng ngựa |
| 12.1.2 | Public xem rankings jockey theo tournament | `GET /rankings/tournament/:id/jockeys` | Bảng xếp hạng jockey |
| 12.1.3 | Public xem global horse rankings | `GET /rankings/global/horses` | Top ngựa toàn hệ thống |
| 12.1.4 | Public xem global jockey rankings | `GET /rankings/global/jockeys` | Top jockey toàn hệ thống |

### 12.2 Prizes

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 12.2.1 | Admin xem danh sách prizes (từ race results) | `GET /prizes` | List prizes |
| 12.2.2 | Owner xem prizes thắng của mình | `GET /prizes/my-prizes` | Won prizes |
| 12.2.3 | Admin cập nhật prize payment status (đã thanh toán) | `PATCH /prizes/:id/status` | Status cập nhật |

---

## FLOW 13 — Notifications & Audit Logs

### 13.1 Notifications

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 13.1.1 | Bất kỳ user → xem danh sách notifications | `GET /notifications/my-notifications` | Unread count + list |
| 13.1.2 | Click 1 notification → mark đã đọc | `PATCH /notifications/:id/read` | `isRead: true` |
| 13.1.3 | Click "Mark tất cả đã đọc" | `PATCH /notifications/read-all` | Tất cả `isRead: true` |

### 13.2 Audit Logs (Admin)

| # | Action | API | Kết quả mong đợi |
|---|--------|-----|-----------------|
| 13.2.1 | Admin → xem audit logs | `GET /audit-logs` | Toàn bộ action history |
| 13.2.2 | Admin filter audit logs theo entityType = horse | `GET /audit-logs?entityType=horse` | Chỉ log liên quan ngựa |
| 13.2.3 | Admin filter theo entityType = tournament | `GET /audit-logs?entityType=tournament` | Chỉ log tournament |

---

## FLOW 14 — Dashboard Stats

| # | Role | API | Kết quả mong đợi |
|---|------|-----|-----------------|
| 14.1 | Admin vào dashboard | `GET /dashboard/admin` | Tổng user, races active, doanh thu AI |
| 14.2 | Owner vào dashboard | `GET /dashboard/owner` | Số ngựa, registrations, prizes |
| 14.3 | Jockey vào dashboard | `GET /dashboard/jockey` | Assignments pending, số race đã chạy |
| 14.4 | Referee vào dashboard | `GET /dashboard/referee` | Assignments chờ, races đã handle |
| 14.5 | Spectator vào dashboard | `GET /dashboard/spectator` | Predictions win rate, points balance |

---

## FLOW 15 — Edge Cases & Security

| # | Scenario | API | Kết quả mong đợi |
|---|----------|-----|-----------------|
| 15.1 | Truy cập `/admin` khi chưa login | Middleware | Redirect về `/login` |
| 15.2 | Spectator truy cập `/admin/*` | Middleware | 403 hoặc redirect |
| 15.3 | Counter staff truy cập `/admin/users` | Middleware | 403 |
| 15.4 | Token hết hạn → gọi API → auto refresh | BFF Proxy | Transparent refresh hoặc redirect login |
| 15.5 | Upload ảnh > 5MB | `POST /uploads` | Lỗi "File too large" |
| 15.6 | Upload file không phải ảnh (PDF, exe) | `POST /uploads` | Lỗi "Invalid file type" |
| 15.7 | Owner đăng ký ngựa PENDING (chưa approve) | `POST /registrations` | Lỗi validation |
| 15.8 | Owner đăng ký khi tournament không OPEN | `POST /registrations` | Lỗi "đăng ký đã đóng" |
| 15.9 | Spectator xem AI predictions không có subscription | `GET /ai/predictions/:raceId` | Lỗi 403 "cần subscription" |
| 15.10 | Admin chuyển race status sai thứ tự (LIVE → SCHEDULED) | `PATCH /races/:id/status` | Lỗi "invalid status transition" |
| 15.11 | Refresh trang giữa chừng đang upload ảnh form | FE Guard | Không submit khi đang upload |
| 15.12 | Submit form tournament khi đang upload ảnh | T4 Guard | Button disabled, không gửi API |
| 15.13 | Health check `/health` endpoint | `GET /health` | `{ status: "ok" }` |
| 15.14 | Referee decline assignment | `PATCH /referee-assignments/:id/respond` (decline) | Status → DECLINED |
| 15.15 | Admin cancel tournament đang ONGOING | `PATCH /tournaments/:id/status` (CANCELLED) | Status → CANCELLED |

---

## Thứ tự chạy khuyến nghị

```
Flow 1 (Auth + Users)
  └─→ Flow 2 (Horses) ─────────────────────────────┐
  └─→ Flow 3 (Jockey Profile) ──────────────────────┤
  └─→ Flow 4 (Referee Profile) ─────────────────────┤
                                                     ↓
                                          Flow 5 (Tournament + Race)
                                                     ↓
                                          Flow 6 (Registration)
                                                     ↓
                                          Flow 7 (Jockey Invitation)
                                                     ↓
                                          Flow 8 (Race Day — full lifecycle)
                                                     ↓
                             ┌───────────────────────┤
                             ↓                       ↓
                    Flow 9 (Predictions)    Flow 10 (AI Subscription)
                             └────────────┬──────────┘
                                          ↓
                                 Flow 11 (Wallet + Cashout)
                                          ↓
                             ┌────────────┤
                             ↓            ↓
                    Flow 12 (Rankings) Flow 13 (Notifications + Audit)
                             └────────────┤
                                          ↓
                                 Flow 14 (Dashboard)
                                          ↓
                                 Flow 15 (Edge Cases)
```

---

## Coverage Summary

| Module | Flow | Số test cases |
|--------|------|--------------|
| Auth | 1 | 6 |
| Users | 1 | 10 |
| Horses | 2 | 8 |
| Jockeys | 3 | 9 |
| Referee Profiles | 4 | 9 |
| Tournaments | 5 | 8 |
| Races | 5 | 6 |
| Registrations | 6 | 12 |
| Jockey Invitations | 7 | 7 |
| Referee Assignments | 8.1 | 6 |
| Race Checks | 8.2 | 5 |
| Races (status flow) | 8.3 | 6 |
| Race Results | 8.4 | 16 |
| Race Records | 8.4 | 3 |
| Race Violations | 8.3 | 3 |
| Referee Reports | 8.4 | 3 |
| Predictions | 9 | 7 |
| AI Features | 10 | 10 |
| Wallet / Cashout | 11 | 13 |
| Reward Point Ledger | 11 | 4 |
| Rankings | 12 | 4 |
| Prizes | 12 | 3 |
| Notifications | 13 | 3 |
| Audit Logs | 13 | 3 |
| Dashboard | 14 | 5 |
| Edge Cases / Security | 15 | 15 |
| **Tổng** | | **~183 test cases** |
