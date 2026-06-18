# Audit: Status Sync, Transaction Safety & Permission Gaps

**Date:** 2026-06-18  
**Branch:** feature/vinh-dev  
**Scope:** Toàn bộ BE — 3 chiều: status synchronization, transaction atomicity, permission/guard  
**Method:** Flow-based — 5 luồng nghiệp vụ, mỗi luồng audit 3 chiều

---

## Tóm tắt phát hiện

| Severity | Số lượng |
|----------|---------|
| CRITICAL | 5 |
| HIGH | 8 |
| MEDIUM | 7 |
| LOW | 1 |
| **Tổng** | **21** |

---

## Luồng 1 — Đăng ký ngựa (Registration)

### [T-1-1] `CRITICAL` · Transaction · `predictions.create()` không atomic

**File:** `src/predictions/predictions.service.ts` ~line 112–127  
**Vấn đề:** Prediction được tạo trước, sau đó mới debit điểm ví — hai bước độc lập, không có transaction.  
**Failure scenario:** Server crash / timeout giữa `predictionModel.create()` và `ledgerService.debit()` → user có prediction nhưng điểm chưa bị trừ. Lặp đủ nhiều lần = free unlimited bets.  
**Fix:** Bọc cả hai thao tác trong một session transaction.

---

### [S-1-1] `HIGH` · Status Sync · Prediction không bị cancel khi Registration bị WITHDRAWN

**File:** `src/registrations/registrations.service.ts` ~line 295–310 (`withdraw()`)  
**Vấn đề:** Khi registration chuyển sang WITHDRAWN, các PENDING predictions đặt vào con ngựa đó không bị cancel, user không được hoàn điểm.  
**Impact:** Điểm cược bị "đóng băng" ở PENDING mãi mãi sau khi ngựa rút khỏi race.  
**Fix:** Sau khi lưu WITHDRAWN, gọi `predictionsService.cancelPredictionsForRace()` hoặc tạo method riêng `cancelPredictionsForHorseInRace(raceId, horseId)`.

---

### [S-1-2] `MEDIUM` · Status Sync · RaceResult không bị xóa khi Registration bị WITHDRAWN

**File:** `src/registrations/registrations.service.ts` ~line 308  
**Vấn đề:** Nếu referee đã tạo RaceResult (DRAFT) cho registration này trước khi nó bị WITHDRAWN, bản ghi RaceResult trở thành orphan.  
**Impact:** Khi publish kết quả, orphan record có thể gây lỗi hoặc tính điểm sai cho ngựa đã rút.  
**Fix:** Sau WITHDRAWN, xóa hoặc đánh dấu CANCELLED các RaceResult ở trạng thái DRAFT liên quan.

---

### [P-1-1] `HIGH` · Permission · `GET /registrations` và `GET /registrations/:id` không có role guard

**File:** `src/registrations/registrations.controller.ts`  
**Vấn đề:** Cả hai endpoint findAll và findOne không có `@Roles()` decorator. Controller có `RolesGuard` ở class level nhưng khi thiếu `@Roles`, guard trả về `true` — mọi user đã auth đều qua được.  
**Impact:** Bất kỳ user nào (jockey, referee, owner) đều có thể liệt kê tất cả registrations và xem chi tiết.  
**Fix:** Thêm `@Roles(RoleName.ADMIN, RoleName.SPECTATOR)` cho findAll; thêm ownership check cho findOne.

---

## Luồng 2 — Chuẩn bị race (SCHEDULED → READY)

### [S-2-1] `CRITICAL` · Status Sync · Race không revert về CHECKING khi RaceCheck đổi từ PASSED → FAILED

**File:** `src/race-checks/race-checks.service.ts` ~line 116–147 (`updateStatus()`)  
**Vấn đề:** RACE_CHECK_STATUS_FLOW cho phép PASSED → FAILED (revert check). Nhưng khi check revert, không có cascade để đưa Race từ READY về CHECKING.  
**Impact:** Race ở trạng thái READY có thể tiến lên LIVE mặc dù có con ngựa không đạt kiểm tra tiền-race — vi phạm điều kiện an toàn cơ bản.  
**Fix:** Trong `updateStatus()`, sau khi set FAILED: nếu race đang READY → gọi `racesService.setStatus(raceId, CHECKING)`.

---

### [S-2-2] `CRITICAL` · Status Sync · Race không revert khi referee duy nhất bị REMOVED/DECLINED sau khi đã READY

**File:** `src/referee-assignments/referee-assignments.service.ts` ~line 217–222 (`removeAssignment()`)  
**Vấn đề:** Khi referee assignment bị remove, không kiểm tra xem đây có phải referee ACCEPTED cuối cùng không. Nếu có, race nên bị revert về CHECKING.  
**Impact:** Race ở READY không có referee nào accepted → không ai confirm kết quả sau race.  
**Fix:** Sau `removeAssignment()`, đếm số ACCEPTED còn lại; nếu = 0 và race đang READY → revert race về CHECKING.

---

### [P-2-1] `HIGH` · Permission · `GET /horses` chỉ cho ADMIN + SPECTATOR, block OWNER và JOCKEY

**File:** `src/horses/horses.controller.ts`  
**Vấn đề:** `@Roles(RoleName.ADMIN, RoleName.SPECTATOR)` trên endpoint GET /horses. Owner không thể xem danh sách ngựa để chọn đăng ký race, Jockey không thể xem ngựa được giao.  
**Fix:** Mở rộng thành `@Roles(RoleName.ADMIN, RoleName.SPECTATOR, RoleName.OWNER, RoleName.JOCKEY)` hoặc PUBLIC.

---

## Luồng 3 — Chạy đua → Kết quả (LIVE → RESULT_PUBLISHED)

### [S-3-1] `HIGH` · Status Sync · Không re-check referee khi Race chuyển READY → LIVE

**File:** `src/races/races.service.ts` ~line 236–266 (`setStatus()`)  
**Vấn đề:** Guard kiểm tra referee chỉ chạy khi transition vào READY (line 246–254). Nếu referee bị remove SAU khi READY nhưng TRƯỚC khi LIVE, race vẫn tiến lên LIVE không bị chặn.  
**Impact:** Race chạy không có referee → không ai record/confirm kết quả.  
**Fix:** Trong `setStatus()`, thêm guard tương tự cho transition vào LIVE: kiểm tra ≥1 ACCEPTED referee còn tồn tại.

---

### [T-3-1] `HIGH` · Transaction · `predictions.payoutBetsForRace()` có thể xử lý một phần

**File:** `src/predictions/predictions.service.ts` ~line 306–400 (`payoutBetsForRace()`)  
**Vấn đề:** Loop xử lý từng prediction riêng lẻ bên trong transaction. Nếu crash ở prediction thứ 5/10, predictions 1–4 đã được payout nhưng 5–10 vẫn PENDING. Session được pass đúng nhưng không bảo vệ được việc loop bị interrupt.  
**Impact:** Sau incident, payout phải chạy lại thủ công; một số user nhận thưởng muộn hơn.  
**Fix:** Thêm idempotency marker (e.g., `payoutRunId`) vào mỗi prediction update để tránh double-payout khi retry; đảm bảo outer caller có retry logic.

---

### [T-3-2] `HIGH` · Transaction · `race-results.publishByRace()` — `syncTournamentStatus` chạy ngoài transaction

**File:** `src/race-results/race-results.service.ts` ~line 622  
**Vấn đề:** Toàn bộ publish (RaceResult → PUBLISHED, Race → RESULT_PUBLISHED, prize, payout) đúng là trong transaction. Nhưng `syncTournamentStatus()` gọi POST-COMMIT, không có retry — nếu fail, tournament mãi không lên COMPLETED.  
**Impact:** Race published xong nhưng tournament vẫn ONGOING dù tất cả races đã done.  
**Fix:** Bọc `syncTournamentStatus` trong try/catch có log + alert rõ ràng; hoặc thêm idempotent re-trigger endpoint cho admin.

---

### [P-3-1] `CRITICAL` · Permission · `POST /ai/payments/webhook` không có authentication

**File:** `src/ai/ai.controller.ts`  
**Vấn đề:** Webhook nhận callback thanh toán từ PayOS không validate signature/secret. Bất kỳ ai biết URL đều có thể POST để giả mạo payment thành công, cấp subscription AI miễn phí.  
**Fix:** Validate PayOS webhook signature trong middleware hoặc service trước khi xử lý payload.

---

### [P-3-2] `HIGH` · Permission · AI prediction endpoints thiếu role guard ở controller level

**File:** `src/ai/ai.controller.ts`  
**Endpoints:**
- `POST /ai/predictions/generate/:raceId` — chỉ có `@UseGuards(JwtAuthGuard)`, không có `@Roles`
- `GET /ai/predictions/:raceId` — tương tự

**Vấn đề:** Role check bị delegate xuống service layer. Mọi user đã auth (jockey, owner, referee) đều gọi được.  
**Fix:** Thêm `@Roles(RoleName.ADMIN, RoleName.SPECTATOR)` ở cả hai endpoint.

---

## Luồng 4 — Tournament Lifecycle

### [T-4-1] `CRITICAL` · Transaction · `tournaments.cascadeCancel()` không dùng transaction cho ledger loop

**File:** `src/tournaments/tournaments.service.ts` ~line 214–253 (`cascadeCancel()`)  
**Vấn đề:** Loop refund điểm cho từng prediction không có transaction. Nếu crash ở prediction thứ N, các prediction trước đó đã được hoàn điểm nhưng status chưa được update sang CANCELLED. Chạy lại sẽ hoàn điểm trùng.  
**Impact:** Double refund hoặc missed refund khi tournament bị cancel — mất tiền hoặc mất điểm user.  
**Fix:** Bọc toàn bộ cascade trong một MongoDB session transaction; hoặc dùng `updateMany` rồi mới credit điểm (dùng idempotency check).

---

### [S-4-1] `MEDIUM` · Status Sync · Tournament force-COMPLETED không cascade race status

**File:** `src/tournaments/tournaments.service.ts` ~line 175 (`updateStatus()`)  
**Vấn đề:** Khi tournament chuyển sang COMPLETED (bằng tay hoặc auto), không có cascade nào cập nhật các race còn đang LIVE/READY/SCHEDULED trong tournament đó.  
**Impact:** Tournament COMPLETED nhưng races vẫn hiển thị LIVE — UI mâu thuẫn, không rõ race có tiếp tục không.  
**Fix:** Thêm `cascadeCompleteRaces()` tương tự `cascadeCancel()`: set tất cả race chưa terminal sang CANCELLED (hoặc FINISHED nếu LIVE).

---

### [P-4-1] `MEDIUM` · Permission · `GET /users/:id` trả full profile cho mọi user đã auth

**File:** `src/users/users.controller.ts`  
**Vấn đề:** `@UseGuards(JwtAuthGuard)` không kèm role check. Mọi user đã đăng nhập đều xem được full profile (email, phone, address) của bất kỳ user nào khác.  
**Fix:** Thêm ownership check trong service: chỉ chính user hoặc ADMIN mới xem được full profile; người khác chỉ xem public fields.

---

## Luồng 5 — Ví & Thanh toán (Wallet / Cashout)

### [T-5-1] `MEDIUM` · Transaction · `wallet.processCashout()` — `ledger.updateNote()` không có session

**File:** `src/wallet/wallet.service.ts` ~line 131–141  
**Vấn đề:** `updateNote()` được gọi để cập nhật ghi chú ledger nhưng không có session, trong khi các bước xung quanh (credit, update transaction status) có session.  
**Impact:** Nếu transaction rollback sau updateNote, ledger note bị sai nhưng không ảnh hưởng số dư thực tế.  
**Fix:** Pass session vào `updateNote()` nếu method hỗ trợ, hoặc accept đây là acceptable risk (note-only, không ảnh hưởng tài chính).

---

### [S-5-1] `MEDIUM` · Status Sync · JockeyInvitation không có cron auto-expire

**File:** `src/jockey-invitations/jockey-invitations.service.ts` ~line 32, 129–141, 173  
**Vấn đề:** `INVITATION_EXPIRY_DAYS = 3` được set và `expiredAt` được lưu khi tạo, nhưng không có cron job nào scan và expire các invitation quá hạn. Expiration chỉ được check khi jockey respond.  
**Impact:** PENDING invitations tồn tại mãi trong DB nếu jockey không respond; UI hiển thị stale data; owner không biết invitation đã hết hạn.  
**Fix:** Thêm `@Cron('0 */6 * * *')` task: find `{status: PENDING, expiredAt: {$lt: now}}` → set EXPIRED + notify owner.

---

### [T-5-2] `HIGH` · Transaction · `jockey-invitations.respond()` — binding jockey vào registration không atomic

**File:** `src/jockey-invitations/jockey-invitations.service.ts` ~line 240–248  
**Vấn đề:** Khi jockey accept, registration được update `jockeyUserId` không có transaction. Nếu 2 jockey accept cùng lúc, cả 2 đều nhận response thành công nhưng chỉ 1 người thực sự được gán (last write wins).  
**Impact:** Jockey A nhận thông báo "accepted" nhưng sau đó bị ghi đè bởi Jockey B.  
**Fix:** Dùng `findOneAndUpdate` với condition `jockeyUserId: null` để đảm bảo atomic — chỉ jockey đầu tiên thành công; jockey sau nhận ConflictException.

---

## Bảng tổng hợp theo Severity

| ID | Severity | Chiều | Flow | Mô tả ngắn |
|----|----------|-------|------|------------|
| T-1-1 | CRITICAL | Transaction | 1 | `prediction.create()` không atomic — free bet exploit |
| S-2-1 | CRITICAL | Status | 2 | Race không revert khi check FAILS sau READY |
| S-2-2 | CRITICAL | Status | 2 | Race không revert khi referee cuối bị remove |
| T-4-1 | CRITICAL | Transaction | 4 | `cascadeCancel()` — ledger loop không có transaction |
| P-3-1 | CRITICAL | Permission | 3 | AI payment webhook không authenticate |
| S-1-1 | HIGH | Status | 1 | Prediction không cancel khi registration WITHDRAWN |
| S-3-1 | HIGH | Status | 3 | Không re-check referee khi READY→LIVE |
| T-3-1 | HIGH | Transaction | 3 | `payoutBetsForRace()` có thể xử lý một phần |
| T-3-2 | HIGH | Transaction | 3 | `syncTournamentStatus` chạy ngoài transaction |
| T-5-2 | HIGH | Transaction | 5 | Jockey binding không atomic — race condition |
| P-1-1 | HIGH | Permission | 1 | `GET /registrations` không có role guard |
| P-2-1 | HIGH | Permission | 2 | `GET /horses` block OWNER và JOCKEY |
| P-3-2 | HIGH | Permission | 3 | AI prediction endpoints thiếu role guard |
| S-1-2 | MEDIUM | Status | 1 | RaceResult orphan khi registration WITHDRAWN |
| S-4-1 | MEDIUM | Status | 4 | Tournament COMPLETED không cascade race status |
| S-5-1 | MEDIUM | Status | 5 | JockeyInvitation không có cron auto-expire |
| T-5-1 | MEDIUM | Transaction | 5 | `processCashout()` — updateNote không có session |
| P-4-1 | MEDIUM | Permission | 4 | `GET /users/:id` trả full profile cho mọi user |

---

---

## Phát hiện bổ sung (sau review lần 2)

### [S-ADD-1] `MEDIUM` · Status Sync · Jockey/Horse win stats không persist — tính lại mỗi request

**Files:**
- `src/horses/horses.service.ts` — `enrichHorsesWithStats()` aggregate tại runtime
- `src/jockeys/jockeys.service.ts` — `enrichJockeyWithStats()` aggregate tại runtime
- `src/horses/schemas/horse.schema.ts` — không có field `winCount`, `totalRaces`
- `src/jockeys/schemas/jockey.schema.ts` — không có field `winCount`, `totalRaces`

**Vấn đề:** Win count, total races của jockey và horse không được lưu trực tiếp trên document. Mỗi lần load profile, service chạy aggregation trên toàn bộ RaceResult. Khi số lượng races lớn, query này sẽ chậm dần.  
**Impact:** Performance degradation; AI prediction engine (`prediction-engine.service.ts`) cũng query tương tự cho mỗi horse entry khi generate prediction — N horse = N aggregation queries.  
**Fix (không khẩn cấp):** Thêm `winCount` và `totalRaces` cached field trên Horse/Jockey schema, cập nhật khi `publishByRace()` hoàn thành.

---

### [S-ADD-2] `LOW` · Status Sync · Jockey không nhận race result points từ loop trong `publishByRace()`

**File:** `src/race-results/race-results.service.ts` ~line 595–615  
**Vấn đề:** Loop credit `result.points` (điểm thưởng theo hạng) chỉ credit cho `result.ownerId`. Jockey không nhận điểm này — họ chỉ nhận phần prize split từ `createPrizesForRace()`.  
**Impact:** Có thể là thiết kế cố ý (jockey đã nhận % prize), hoặc có thể là thiếu sót. Cần confirm với business logic.  
**Action:** Clarify với team trước khi fix.

---

### [ENV-1] `MEDIUM` · Testability · Tournament time validation chặn môi trường dev/test

**File:** `src/tournaments/tournaments.service.ts` line 169–179  
**Code bị chặn:**
```typescript
// line 169: ONGOING
if (newStatus === TournamentStatus.ONGOING && now < tournament.startDate) {
  throw new BadRequestException('Cannot start tournament: start date has not been reached yet');
}
// line 175: COMPLETED
if (newStatus === TournamentStatus.COMPLETED && now < tournament.endDate) {
  throw new BadRequestException('Cannot complete tournament: end date has not been reached yet');
}
```
**Vấn đề:** Không có cách bypass cho môi trường test/dev. Mỗi lần test end-to-end flow phải dùng tournament có ngày trong quá khứ hoặc chờ đến ngày thực.  
**Fix đề xuất:** Thêm env variable `BYPASS_DATE_GUARDS=true` trong `.env.development`:
```typescript
const bypassDateGuards = process.env.BYPASS_DATE_GUARDS === 'true';
if (!bypassDateGuards && newStatus === TournamentStatus.ONGOING && now < tournament.startDate) { ... }
```

---

### Các schema chưa được cover trong audit ban đầu

| Schema | File | Status field? | Rủi ro |
|--------|------|---------------|--------|
| **Prize** | `src/prizes/schemas/prize.schema.ts` | `status` PENDING/PAID | ✓ Handled đúng trong `createPrizesForRace()` với session và idempotency |
| **RaceRecord** | `src/race-records/` | Không có status | Chỉ là performance log, không cần sync |
| **RaceViolation** | `src/race-violations/` | `penalty` enum | Tied trực tiếp vào race-results flow; không có independent status lifecycle |
| **WalletTransaction** | `src/wallet/schemas/wallet-transaction.schema.ts` | `status` PENDING/SUCCESS/FAILED | ✓ Được update trong `processCashout()` với session |
| **RefereeReport** | `src/referee-reports/` | `type` PRE_RACE/POST_RACE | Không có status; không cần sync |
| **Notification** | `src/notifications/` | `isRead` boolean | Không ảnh hưởng business logic |
| **AuditLog** | `src/audit-logs/` | Immutable log | Không cần sync |
| **RewardPointLedger** | `src/reward-point-ledger/` | Không có status | Append-only ledger, đúng design |

---

## Không phát hiện vấn đề ở

- `wallet.requestCashout()` — transaction đúng, session propagation hoàn chỉnh
- `race-results.publishByRace()` — transaction core đúng (chỉ syncTournament nằm ngoài)
- `races.setStatus()` — session được propagate đúng xuống payout
- Tournament CANCELLED → cascade races + predictions đúng chiều
- JockeyInvitation → Registration binding schedule conflict check hoạt động đúng
- RaceCheck flow PENDING → PASSED/FAILED đúng
- Predictions payout logic (WIN/LOST comparison) đúng sau fix session trước
