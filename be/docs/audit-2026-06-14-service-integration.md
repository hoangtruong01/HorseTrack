# Báo cáo Audit Liên kết Service — HorseTrack Backend

- **Ngày:** 2026-06-14
- **Phạm vi:** các module nghiệp vụ core — `tournaments`, `registrations`, `races`, `race-results`, `race-records`, `race-checks`, `race-violations`, `referee-*`, `rankings`, `predictions`, `ai`, `wallet`, `prizes`, `reward-point-ledger`, `bank-transactions`, `jockey-invitations`, `jockeys`, `horses`, `notifications`, `users`.
- **Phương pháp:** đọc trực tiếp `*.module.ts` / `*.service.ts` / `schemas`, grep-verify từng claim. Mọi phát hiện đều kèm `file:line`. Không suy đoán.
- **Mức độ:** 🔴 nghiêm trọng · 🟠 cao · 🟡 trung bình.

---

## 0. Đính chính mô hình nghiệp vụ & Quyết định (brainstorm 2026-06-14)

Bản audit gốc giả định wallet là hệ thống **tiền mặt** (top-up/withdraw). Sau khi làm rõ với chủ dự án, mô hình thực tế khác — phần này **supersede** mọi phát hiện mâu thuẫn trong Flow 4 & Flow 5.

**Mô hình đúng:**
- **PayOS** chỉ phục vụ **user-subscription** (spectator trả phí dùng AI predictions). Đây là đường tiền thật **duy nhất**.
- **Điểm thưởng** (`User.points` qua reward-point-ledger) là **nguồn sự thật duy nhất** cho số dư; earn từ predictions/prizes.
- **Quy đổi điểm (cashout)** = user tạo mã `RWD-XXXX`, điểm bị trừ ngay, mang mã ra quầy; **role COUNTER_STAFF xử lý thủ công**. Không có dòng tiền tự động trong hệ thống.

**Các "lỗi" trong báo cáo gốc được phân loại lại thành CODE THỪA CẦN BỎ (không phải bug):**
- `User.balance`, endpoint `deposit/for-user/:userId`, toàn bộ module `bank-transactions` → **xoá**.
- `WalletTransaction` type tiền mặt: DEPOSIT/WITHDRAW/PURCHASE/POINT_REDEMPTION/PRIZE_EARNING → **xoá**, chỉ giữ REWARD_CASHOUT.
- Vấn đề "hai nguồn sự thật **`balance` vs `points`**" (mục 4.2) → **tan biến** khi bỏ `balance`. Lưu ý: vấn đề khác — `User.points` (field sống) vs ledger `balanceAfter` (snapshot, đọc bởi `getBalance`) ghi non-transactional có thể lệch — **vẫn còn**, gộp vào nhóm transaction (P0 #3).
- "Bank top-up dead-end" (P1 #5) → không phải lỗi, là tính năng không tồn tại; xoá module.

**Quyết định cho phần payment/điểm (đưa vào kế hoạch fix):**
1. Bỏ ví tiền mặt (`balance`/`deposit`/`bank-transactions` + enum thừa).
2. Cashout giữ **4 trạng thái linh hoạt** (PENDING/APPROVED/REJECTED/PAID): cho cả PENDING→PAID lẫn PENDING→APPROVED→PAID; vá guard chặn đổi khi đã PAID/REJECTED; chuẩn hoá ý nghĩa APPROVED; field `approvedBy` tách khỏi vai trò người REJECTED.
3. Mã quy đổi **không tự hết hạn**; counter chủ động REJECTED để hoàn điểm.
4. Subscription giữ filter `endDate > now`; **xoá** enum `SubscriptionStatus.EXPIRED/CANCELLED` thừa.
5. PayOS webhook: **fail loud + log** khi thiếu cấu hình/lỗi (bỏ no-op im lặng tại `payos.service.ts:100`).

**Phạm vi kế hoạch fix:** P0 + P1 + P2 (gồm tái cấu trúc service boundary, tách module `payments`, dọn enum chết).

---

## 1. Module & Service — Dependency Graph

### 1.1 Sơ đồ phụ thuộc service → service (constructor injection)

```
RegistrationsService ──> HorsesService, TournamentsService, RacesService,
                         NotificationsService, AuditLogsService
RacesService ─────────> TournamentsService, PredictionsService
TournamentsService ───> NotificationsService, AuditLogsService, RewardPointLedgerService
RaceResultsService ───> RacesService, PrizesService, PredictionsService,
                         AuditLogsService, NotificationsService
PrizesService ────────> RewardPointLedgerService
PredictionsService ───> RewardPointLedgerService, NotificationsService
RaceChecksService ────> RacesService
RaceViolationsService > RacesService
RefereeReportsService > RacesService
RefereeAssignmentsService > UsersService, RefereeProfilesService, RacesService
RefereeProfilesService > UsersService
JockeysService ───────> UsersService
JockeyInvitationsService > UsersService, NotificationsService
WalletService ────────> RewardPointLedgerService
AiService ────────────> PredictionEngineService, ArrangementEngineService, PayosService
ArrangementEngineService > StrengthScoreService, LlmService
PredictionEngineService  > StrengthScoreService, LlmService
NotificationsService <──> NotificationsGateway   (forwardRef)
```

Service "lá" (chỉ inject Model, không gọi service khác): `HorsesService`, `RaceRecordsService`, `RankingsService`, `RewardPointLedgerService`, `BankTransactionsService`, `UsersService`.

Vị trí inject tiêu biểu: `registrations.service.ts:37-41`, `races.service.ts:52-53`, `tournaments.service.ts:50-52`, `race-results.service.ts:65-69`, `prizes.service.ts:41`, `predictions.service.ts:41-42`, `wallet.service.ts:32`, `ai.service.ts:46-48`.

### 1.2 Circular dependency

- **Chu trình thật duy nhất:** `NotificationsService ⇄ NotificationsGateway` (cùng module), xử lý bằng `forwardRef` tại `notifications/notifications.service.ts:21`. Không nghiêm trọng.
- **Không có circular cross-module nào khác** — nhưng lý do là **cấu trúc đã né DI cycle bằng cách inject thẳng Model của module khác thay vì gọi service** (xem mục 4.1). Đây là "liên kết giả": vòng lặp DI biến mất nhưng tầng service bị xuyên thủng.

---

## 2. Business Flow — Trace từ entry point đến DB

### Flow 1 — Vòng đời Tournament
`create` → `open registration` → `register` → `approve` → `AI generate` → `apply` → tạo Race.

| Bước | Call chain |
|---|---|
| Tạo tournament | `TournamentsController.create:38` → `TournamentsService.create:55` → `tournamentModel.create` (`tournaments.service.ts:71`, DRAFT) |
| Tạo race | `RacesController.create:39` → `RacesService.create:56` → `raceModel.create:93` |
| Mở đăng ký | `tournaments.controller.ts:71` → `TournamentsService.updateStatus:131` (yêu cầu `raceCount > 0` `:148-157`) |
| Đăng ký ngựa | `RegistrationsController.create:40` → `RegistrationsService.create:44` → `registrationModel.create:127` (PENDING) |
| Duyệt | `registrations.controller.ts:81` → `RegistrationsService.approve:206` → `reg.save:234` |
| AI sinh sắp xếp | `ai.controller.ts:152` → `AiService.generateArrangement:156` → `ArrangementEngineService.generateForTournament:89` → `arrangementModel.create:168` |
| Apply → tạo race | `ai.controller.ts:178` → `AiService.updateArrangementStatus:171` → `ArrangementEngineService.applyArrangement:178` → transaction `raceModel.create:199` |

**Đứt gãy / chưa nối:**
- 🔴 **`applyArrangement` vứt bỏ output cốt lõi của engine.** `entries` (gán ngựa + jockey) được build tại `arrangement-engine.service.ts:134-138` và lưu vào `proposedRaces`, **nhưng vòng lặp apply `:198-217` không đọc `proposed.entries`** — chỉ đọc startTime/distance/maxParticipants/track/weather/raceType. Không có `Registration` nào được tạo hay trỏ về race AI. **Kết quả: race AI tạo ra hoàn toàn rỗng, không có ngựa.** (Đã đọc xác nhận trực tiếp.)
- 🟠 **`createdRaceIds` write-only**: ghi tại `arrangement-engine.service.ts:174/216/220`, không nơi nào đọc.
- 🟡 **Sai loại exception**: `AiService.updateArrangementStatus:185` ném `new Error(...)` → HTTP 500 thay vì 400 (guard song song tại `arrangement-engine.service.ts:187` dùng đúng `BadRequestException`).
- 🟡 **Nhánh gán jockey chết**: engine đọc `reg.jockeyUserId` (`arrangement-engine.service.ts:254,283`) nhưng `CreateRegistrationDto` không có field `jockeyUserId`.

**Logic trùng lặp:** quy tắc slot `maxParticipants ?? 20` lặp tại `registrations.service.ts:99-110` và `:220-229`; validate prize-vs-budget lặp tại `races.service.ts:75-91` và `:179-200`.

**Logic đặt sai chỗ:** orchestration trạng thái tournament nằm trong `RacesService.updateStatus` (`races.service.ts:233-287`), bọc try/catch chỉ `console.error` (`:284-287`) → lỗi im lặng, tournament lệch trạng thái không dấu vết.

---

### Flow 2 — Race → Results → Payout

| Bước | Call chain |
|---|---|
| Status race | `RacesController.updateStatus:99` → `RacesService.updateStatus:206` → `race.save:231` (theo `RACE_STATUS_FLOW`) |
| Race checks | `RaceChecksController` → `RaceChecksService.initializeChecksForRace:169` / `updateStatus:115` |
| Results | `simulate:34` → `simulateRaceResults:88` → `resultModel.create:285` + auto FINISHED `:307` |
| Confirm | `confirm:81` → `confirmResultsForRace:468` → `updateMany(...CONFIRMED):500` |
| **Publish (hub)** | `publish:93` → `publishByRace:520` → PUBLISHED `:558` → `racesService.updateStatus(RESULT_PUBLISHED):570` → `prizesService.createPrizesForRace:573` → `predictionsService.payoutBetsForRace:576` |
| Prize + ledger | `createPrizesForRace:45` → `ledgerService.credit:86` + `prizeModel.create:94` → `userModel.$inc points` (`reward-point-ledger.service.ts:56`) |
| Payout dự đoán | `payoutBetsForRace:273` → atomic `findOneAndUpdate:306` → credit `:333` |

**Đứt gãy / chưa nối:**
- 🔴 **`RaceResult.points` là stub chết.** Tính qua `POINTS_MAP {1:10,2:7,3:5,4:3}` và lưu tại `race-results.service.ts:279,389,699,758,797`, **nhưng không có `LedgerSourceType` tương ứng** (`reward-point-ledger.schema.ts:6-13`) và không nơi nào đọc `result.points` để cộng điểm. Hệ thống điểm thành tích không bao giờ tác động số dư.
- 🟡 Đường `create` đơn lẻ (`:321-408`) không gọi `applyViolationsToResults` → kết quả nhập qua đường này bỏ qua tính lại vi phạm/rank.

**Trùng lặp:** `POINTS_MAP[rank]` lặp 5 lần trong cùng file (`:279,389,699,758,797`); `if (race.status === LIVE) updateStatus(FINISHED)` lặp 3 lần (`:307,513,852`).

**Đặt sai chỗ:** 🟠 **Hai cách tính tiền thưởng phân kỳ**: `publishByRace` ghi full `race.prize` vào `RaceResult.prizeAmount` của rank-1 (`race-results.service.ts:547-557`), trong khi `createPrizesForRace` lại tự chia owner/jockey (`prizes.service.ts:73-74`). Hai con số khác nhau cho cùng một giải → nguy cơ lệch số liệu.

---

### Flow 3 — Prediction (đặt cược)

| Bước | Call chain |
|---|---|
| Đặt | `PredictionsController.create:44` → `PredictionsService.create:45` → `ledgerService.getBalance:84` → `predictionModel.create(PENDING):105` → debit chỉ khi `betAmount >= 2` (`:113`) |
| Hủy | `cancelPrediction:126` (guard PENDING + cutoff 2h) → refund khi `>= 2` (`:171`) → `findByIdAndDelete:196` |
| Payout | `payoutBetsForRace:273` → reward `betAmount>=2 ? betAmount*2 : 1` (`:330-342`) |
| AI prediction | `ai.controller.ts:104` → `AiService.generatePrediction:113` (gate subscription `:118-125`) → `PredictionEngineService.generateForRace:64` → upsert `AIPredictionSuggestion` (`prediction-engine.service.ts:129`) |

Các nhánh đều được nối và persist đúng. **Tồn tại:**
- 🟡 Ngữ nghĩa free-bet không nhất quán: DTO lưu `betPoints = 1` nhưng code coi là 0 điểm (debit/refund chỉ khi `>= 2`; comment ghi "0 Pts" `:363,369`). Giá trị lưu (1) ≠ ý định nghiệp vụ (0).
- 🟡 Free-bet thua vẫn ghi dòng ledger `points: 0` (`:364-370`) — nhiễu dữ liệu.

**Đặt sai chỗ:** 🟠 logic domain prediction nằm trong `TournamentsService.cascadeCancel` (`tournaments.service.ts:209-264`): query thẳng `predictionModel`, gọi `ledgerService.credit`, `updateMany(...CANCELLED):259` — thay vì uỷ cho `PredictionsService.cancelPredictionsForRace` đã có sẵn. Logic refund-on-cancel tồn tại ở **3 nơi**: `predictions.service.ts:171-185`, `:248-265`, `tournaments.service.ts:226-243`.

---

### Flow 4 — Payment / Subscription (PayOS)

> **Không có module `payments`.** Toàn bộ domain thanh toán nằm trong `src/ai`.

| Bước | Call chain |
|---|---|
| Subscribe | `ai.controller.ts:62` → `AiService.initiateSubscription:65` → `PayosService.createPaymentLink:61` → `payos.paymentRequests.create:78` → `paymentModel.create(PENDING):86` |
| Webhook | `ai.controller.ts:71` (public, không guard) → `AiService.handlePayosWebhook:72` → `PayosService.handleWebhook:99` → verify chữ ký `:106` → idempotency `:115-125` → SUCCESS + `activateSubscription:130` |
| Activate | `activateSubscription:140` → gia hạn `:150-158` hoặc `subscriptionModel.create(ACTIVE):160-166` |
| Gate | `checkSubscriptionActive:76` gác `generatePrediction:118-125` & `getPredictionSuggestionForRace:134-141` |

**Đứt gãy / chưa nối:**
- 🟠 **Không đăng ký webhook URL trong code** — SDK `Webhooks.confirm` không bao giờ được gọi (chỉ `verify`). Phải đăng ký thủ công trên dashboard PayOS, nếu không webhook không bao giờ chạy.
- 🟠 **No-op im lặng khi PayOS chưa cấu hình**: thiếu creds → `this.payos = null` (`payos.service.ts:46`), `handleWebhook` return im lặng (`:100`) → webhook trả 200 nhưng payment kẹt PENDING vĩnh viễn, không tạo subscription. Bất đối xứng với `createPaymentLink` (ném lỗi `:65`).
- 🟡 `EXPIRED`/`CANCELLED` không bao giờ được gán (chỉ `ACTIVE` `:152,165`); hết hạn chỉ dựa vào filter query, dòng cũ vẫn `ACTIVE`.
- 🟡 `Payment.transactionId` (`payment.schema.ts:36`) — field chết.

**Trùng lặp:** predicate "subscription active" (`status: ACTIVE, endDate > now`) lặp 3 lần: `ai.service.ts:78-82`, `:90-95`, `payos.service.ts:150-154`.

**Đặt sai chỗ:** 🟠 toàn bộ domain billing (PayosService, schema Payment + UserSubscription, endpoint doanh thu `ai.controller.ts:75`) nằm trong module `ai` — nên tách module `payments`/`subscriptions` riêng.

---

### Flow 5 — Wallet / Points / Bank-Transactions

> **`User` là nơi giữ số dư**: `User.points` (`user.schema.ts:52`, điểm tiêu được) và `User.balance` (`:55`, tiền mặt). 3 module wallet/ledger/bank chỉ là log append-only trên đó.

| Đường ghi | Vị trí |
|---|---|
| ledger credit | `reward-point-ledger.service.ts:54` → `$inc User.points :59` + row `:66`; `balanceAfter = User.points :64` |
| ledger debit | `:89` → atomic conditional `$inc :92-99` + row `:112` |
| getBalance | `:33` → đọc `balanceAfter` của row mới nhất `:34-38` |
| wallet deposit | `wallet.service.ts:35` → `$inc User.balance :42` + txn `:46` |
| cashout request | `:56` → CashoutRequest `:81` + `ledgerService.debit :90` + txn PENDING `:99` |
| bank webhook | `bank-transactions.service.ts:18` → `create :44` luôn `matchedType: UNKNOWN :55` |

**Đứt gãy / chưa nối:**
- 🔴 **Nạp tiền qua ngân hàng là ngõ cụt**: `matchedType` luôn `UNKNOWN` (`bank-transactions.service.ts:55`), `matchedId` không bao giờ ghi. Không code nào nối giao dịch ngân hàng vào `User.balance`/wallet. Cách duy nhất tăng balance là `deposit` thủ công admin (`wallet.controller.ts:33`).
- 🟠 **Hai nguồn sự thật cho điểm**: credit/debit suy `balanceAfter` từ `User.points` (`:64,110`), nhưng `getBalance` đọc từ row ledger mới nhất (`:34-38`). `$inc` User và `create` ledger là **2 bước không transaction** → lệch khi lỗi giữa chừng hoặc chạy đồng thời.
- 🟡 Cashout không bao giờ trừ `User.balance` (ghi `amount: 0` `:83,103`); chỉ trừ points. Các giá trị `WITHDRAW`/`PURCHASE`/`POINT_REDEMPTION`/`PRIZE_EARNING` (`wallet-transaction.schema.ts:8-11`) không bao giờ được sinh.
- 🟡 Cộng điểm prize/tournament không ghi `WalletTransaction` → lịch sử ví (`wallet.service.ts:174`) thiếu các khoản prize/bet/tournament.

---

## 3. Status / State / Enum

### 3.1 Bảng enum (rút gọn)

| Enum | File:Line | Có flow map? |
|---|---|---|
| TournamentStatus (6 giá trị) | `tournament.schema.ts:6` | ✅ `TOURNAMENT_STATUS_FLOW:16` |
| RegistrationStatus (5) | `registration.schema.ts:6` | ❌ guard ad-hoc |
| RaceStatus (7) | `race.schema.ts:7` | ✅ `RACE_STATUS_FLOW:17` |
| RaceResultStatus (4) | `race-result.schema.ts:6` | ❌ |
| RaceCheckStatus (3) | `race-check.schema.ts:6` | ❌ |
| PredictionStatus (4) | `prediction.schema.ts:6` | ❌ (nhưng atomic guard) |
| ArrangementStatus (3) | `ai-race-arrangement-suggestion.schema.ts:12` | ❌ |
| PaymentStatus (3) | `payment.schema.ts:6` | ❌ |
| SubscriptionStatus (3) | `user-subscription.schema.ts:6` | ❌ |
| PackageStatus (2) | `ai-prediction-package.schema.ts:6` | ❌ |
| InvitationStatus (5) | `jockey-invitation.schema.ts:6` | ❌ |
| CashoutStatus (4) | `cashout-request.schema.ts:6` | ❌ |
| PrizePaymentStatus (2) | `prize.schema.ts:6` | ❌ |
| Wallet TransactionType/Status | `wallet-transaction.schema.ts:6/15` | ❌ |
| BankTransactionMatchedType (3) | `bank-transaction.schema.ts:17` | ❌ |
| Horse health/status/approval | `horse.schema.ts:12/19/26` | ❌ |

Chỉ **2 enum có state-machine map được enforce**: Tournament và Race.

### 3.2 Vấn đề state

**A. Status định nghĩa nhưng không bao giờ gán (chết):**

| Giá trị | Vị trí |
|---|---|
| `RaceResultStatus.CANCELLED` | `race-result.schema.ts:10` |
| `RaceResultOutcome.DID_NOT_START / DID_NOT_FINISH` | `race-result.schema.ts:16-17` |
| `RaceCheckStatus.FAILED` | `race-check.schema.ts:9` (chỉ set được qua DTO không guard) |
| `SubscriptionStatus.EXPIRED / CANCELLED` | `user-subscription.schema.ts:8-9` (không có scheduler/endpoint) |
| `PackageStatus.INACTIVE` | `ai-prediction-package.schema.ts:8` |
| `TransactionType.WITHDRAW/PURCHASE/POINT_REDEMPTION/PRIZE_EARNING` | `wallet-transaction.schema.ts:8-11` |
| `BankTransactionMatchedType.PAYMENT/PAYOUT` | `bank-transaction.schema.ts:18-19` |
| `HorseHealthStatus.INJURED/RECOVERING/RETIRED` | `horse.schema.ts:14-16` (chỉ đọc/filter, không bao giờ gán) |
| `HorseStatus.INACTIVE/RETIRED` | `horse.schema.ts:21-22` |
| `PredictionSource.MANUAL` | `ai-prediction-suggestion.schema.ts:7` |

**B. Transition thiếu / state không thể đạt:**
- Horse không có API đổi `healthStatus` → không bao giờ thành INJURED/RECOVERING/RETIRED, trong khi engine AI lại lọc theo INJURED (`arrangement-engine.service.ts:114`) → bộ lọc vô tác dụng.
- Subscription không bao giờ rời ACTIVE (EXPIRED bất khả đạt, không cron).
- Invitation EXPIRED chỉ set lazy khi jockey phản hồi (`jockey-invitations.service.ts:173-176`); invite không trả lời kẹt PENDING mãi.
- BankTransaction không bao giờ rời UNKNOWN.

**C. Transition bất hợp lệ được phép (thiếu guard):**

| Vấn đề | Vị trí |
|---|---|
| 🔴 **`cascadeCancel` bypass `RACE_STATUS_FLOW`** — `updateMany` set CANCELLED không qua guard flow | `tournaments.service.ts:248-251` |
| 🔴 **`cascadeCancel` ép hủy registration APPROVED**, mâu thuẫn với `RegistrationsService.cancel` vốn cấm hủy APPROVED (`:288`) — 2 luật khác nhau cho cùng cạnh APPROVED→CANCELLED | `tournaments.service.ts:253-256` vs `registrations.service.ts:288` |
| 🔴 **Cashout PENDING→PAID không cần qua APPROVED** — guard `:120-125` chỉ chặn PAID/REJECTED, không yêu cầu current = APPROVED (đường tiền) | `wallet.service.ts:120-125,152,156` (đã đọc xác nhận) |
| 🟠 **`RaceCheck.updateStatus` không guard** — `check.status = dto.status` nhận mọi giá trị, mọi thứ tự | `race-checks.service.ts:127` |
| 🟠 **Guard confirm-results yếu** — chỉ reject nếu *có* result đã CONFIRMED (`:478-484`), nhưng `updateMany` chỉ nhắm `status: DRAFT` (`:501`); ý định "tất cả phải DRAFT" không được enforce | `race-results.service.ts:478-501` |

**D. Set không nhất quán / dùng string literal thay enum:**
- Race CANCELLED set 2 nơi: guarded `races.service.ts:230` vs unguarded `tournaments.service.ts:250`.
- Prediction CANCELLED set 2 nơi: `predictions.service.ts:269` vs `tournaments.service.ts:261`.
- String literal thay enum: `dashboard.service.ts:281-282` (`item._id === 'WON'/'LOST'`), `race-results.service.ts:594` (`status: 'RESULT_PUBLISHED'`).
- Casing lẫn lộn giữa các enum (lowercase: RaceCheck/RefereeAssignment/Violation/BankTransaction/Outcome vs UPPERCASE phần còn lại) — foot-gun khi so sánh literal.

---

## 4. Tính nhất quán giữa các service

### 4.1 🔴 Ghi DB xuyên tầng service (vấn đề lan rộng nhất)

~18 service inject thẳng Model của domain khác thay vì gọi service chủ. Nghiêm trọng nhất là các nơi **ghi/mutate** qua Model ngoại lai:

| Service | Model ngoại lai bị ghi | Vị trí |
|---|---|---|
| `TournamentsService` | Race, Registration, Prediction (mutate hàng loạt) | inject `:45-48`, mutate `:248,253,259` |
| `JockeyInvitationsService` | Registration (set jockeyUserId) | `:48`, mutate `:240` |
| `UsersService` | Jockey, RefereeProfile (create) | `:35-36`, create `:183,198` |
| `WalletService` | User (`$inc balance`) | `:27`, mutate `:42` |
| `RewardPointLedgerService` | User (`$inc points`) | `:25`, mutate `:56,97` |
| `ArrangementEngineService` | Race (create) | create `:199` |

Các service chỉ đọc Model ngoại lai (races, prizes, predictions, race-results, race-checks, race-records, horses, jockeys, referee-*): danh sách đầy đủ đã verify, ví dụ `races.service.ts:46-50`, `prizes.service.ts:33-39`, `predictions.service.ts:36-39`, `race-results.service.ts:57-63`.

### 4.2 🟠 Cùng entity, nhiều service ghi khác nhau
- **Registration**: ghi bởi RegistrationsService (`:231,234,264,291,308`), TournamentsService (`:253`), JockeyInvitationsService (`:240`).
- **Race**: ghi bởi RacesService, TournamentsService (`:248`), ArrangementEngineService (`:199`).
- **Prediction**: CANCELLED set bởi PredictionsService và TournamentsService.
- **User**: 2 trường tiền cạnh tranh — `points` (ledger) và `balance` (wallet) ghi bởi 2 service khác nhau, **không hề được đối soát ở đâu**.
- **Jockey / RefereeProfile**: tạo bởi cả service chủ lẫn UsersService.

### 4.3 🔴 Transaction boundary

**Chỉ tồn tại 1 transaction trong toàn bộ phạm vi audit**: `ArrangementEngineService.applyArrangement` (`arrangement-engine.service.ts:192-230`).

Các flow đa-collection **KHÔNG** transaction (rủi ro toàn vẹn dữ liệu):

| Flow | Vị trí | Rủi ro |
|---|---|---|
| 🔴 `RaceResultsService.publishByRace` | `:520-601` | Cập nhật RaceResult → Race → Prize + ledger nhiều user → payout prediction + ledger, không rollback. Lỗi giữa chừng → kết quả published, prize trả dở, prediction giải quyết dở |
| 🔴 `RewardPointLedgerService.credit/debit` | `:54-77`, `:89-123` | Ghi 2 collection (User + ledger) không session; **signature không nhận `session`** → caller không thể bọc atomic |
| 🟠 `WalletService.requestCashout` | `:56-110` | CashoutRequest + debit + WalletTransaction, 3 collection, no tx |
| 🟠 `WalletService.processCashout` | `:112-172` | refund + updateNote + save + txn update, no tx |
| 🟠 `TournamentsService.cascadeCancel` | `:246-281` | `Promise.all` updateMany Race+Registration+Prediction sau refund ledger, no tx |
| 🟡 `JockeyInvitationsService.respond` | `:239-285` | Registration + invitation updates, no tx |

Gốc rễ: `RewardPointLedgerService.credit/debit` là điểm mutate duy nhất của `User.points`, nhưng non-atomic và không nhận session — kéo theo mọi flow tiền (publish, prizes, predictions, wallet) đều không thể đảm bảo nhất quán.

---

## 5. Kết luận

### 5.1 Đánh giá tổng thể

Các service **chưa thực sự liên kết chặt chẽ** — mức độ "liên kết giả": chúng đụng dữ liệu của nhau **trực tiếp qua Model** thay vì qua tầng service. Hệ quả:
- Tầng service không còn là biên giới của domain → cùng một entity (Registration, Race, User) bị nhiều nơi ghi với luật khác nhau, không invariant chung.
- Không có circular DI nhưng đó là vì đã "lách" bằng cách xuyên tầng — về bản chất coupling vẫn cao.
- Đường tiền/điểm hoàn toàn thiếu transaction → nguy cơ lệch số dư thật.
- Một số pipeline "chạy nhưng không hoàn tất nghiệp vụ": arrangement tạo race rỗng, điểm thành tích không bao giờ cộng, nạp tiền ngân hàng không nối vào số dư.

### 5.2 Danh sách vấn đề ưu tiên

**P0 — Sai nghiệp vụ / mất tiền:**
1. `applyArrangement` bỏ `proposedRaces[].entries` → race AI rỗng, không có ngựa (`arrangement-engine.service.ts:198-217`).
2. Cashout có thể PAID mà chưa APPROVED (`wallet.service.ts:120-125`).
3. `publishByRace` + `ledger.credit/debit` không transaction → payout/prize/điểm có thể lệch (`race-results.service.ts:520-601`, `reward-point-ledger.service.ts:54-123`). Gồm cả lệch `User.points` vs ledger `balanceAfter` (cho `credit/debit` nhận `session`, chọn một nguồn sự thật).
4. ~~Hai nguồn sự thật balance vs points~~ → **đã giải quyết bằng quyết định bỏ `User.balance`** (xem mục 0).

**P1 — Đứt gãy flow / nhất quán state:**
5. ~~Nạp tiền ngân hàng là ngõ cụt~~ → **không phải bug; là tính năng không tồn tại → xoá module `bank-transactions`** (xem mục 0). Chuyển sang nhóm P2/dọn dẹp.
6. `RaceResult.points` (điểm thành tích) tính nhưng không bao giờ cộng.
7. `cascadeCancel` bypass RACE_STATUS_FLOW và mâu thuẫn guard cancel registration (`tournaments.service.ts:248-256`).
8. `RaceCheck.updateStatus` không guard, lại là điều kiện để race lên READY (`race-checks.service.ts:127`).
9. PayOS webhook không đăng ký trong code + no-op im lặng khi chưa cấu hình.

**P2 — Nợ kỹ thuật / dọn dẹp:**
10. Xuyên tầng service diện rộng (mục 4.1) — cần đưa ghi-chéo về service chủ.
11. Logic refund-on-cancel trùng 3 nơi; orchestration tournament đặt sai trong RacesService.
12. Hàng loạt enum value chết + string literal thay enum (mục 3.2A, 3.2D).
13. Tách domain billing khỏi module `ai`.

### 5.3 Đề xuất hoàn thiện liên kết

- **Atomic hoá đường tiền**: cho `RewardPointLedgerService.credit/debit` nhận `session`; bọc `publishByRace`, cashout, cascadeCancel trong transaction. Chọn **một** nguồn sự thật cho số dư (khuyến nghị: ledger `balanceAfter`, hoặc `User.points` — bỏ cái còn lại).
- **Khôi phục biên giới service**: thay các `@InjectModel(<ForeignModel>)` có ghi bằng lời gọi service chủ (Tournament/JockeyInvitation/Users/Wallet/Arrangement). Nơi gây circular thì dùng `forwardRef` có chủ đích.
- **Hoàn tất pipeline AI arrangement**: apply phải tạo/đổi Registration theo `entries` (hoặc bỏ hẳn `entries` nếu không dùng).
- **Chuẩn hoá state machine**: thêm flow-map + guard cho Registration, RaceResult, Cashout, RaceCheck giống Tournament/Race; xoá enum value chết hoặc nối transition còn thiếu (subscription expiry, horse health, bank matching).
- **Gom trùng lặp**: refund-on-cancel, POINTS_MAP, predicate subscription-active về một chỗ; thay string literal bằng enum.
- **Tách module `payments`** khỏi `ai`; nối `bank-transactions` vào số dư.

---

*Báo cáo dựa trên đọc code thực tế tại commit hiện tại; 2 phát hiện P0 nghiêm trọng nhất (arrangement entries, cashout PAID) đã được đọc xác nhận trực tiếp.*
