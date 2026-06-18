# Spec — Nhóm C: BE bug P0/P1 (2026-06-16)

> Nhánh `feature/vinh-dev`, base `main`. Nối tiếp P0#3 (publishByRace transaction). Commit local, **không** Co-Authored-By.

## 1. Mục tiêu

Vá 6 bug correctness/security độc lập trong nhóm C (re-verify audit §0bis). Sau khi xong:
- Luồng tiền cashout (request + refund) all-or-nothing, không còn doc mồ côi / double-refund.
- `rejectedBy` được ghi đúng → suite test BE xanh hoàn toàn (mục tiêu 36/36, gỡ test wallet đỏ pre-existing).
- Không sửa được kết quả race đã PUBLISHED qua đường vi phạm.
- Không gán được referee chưa duyệt; không lộ danh sách phân công cho user thường.

## 2. Phạm vi & cách làm

1 spec → 1 plan → 6 task TDD bottom-up (test đỏ trước, vá, xanh), mirror cách P0#3.
Verify mỗi task: `npm run build`, `npm run lint`, `npm test`.

**KHÔNG** trong phạm vi: nhóm D (state-machine), nhóm E (cleanup/gỡ AI arrangement), FE P0, `GET /registrations` thiếu @Roles (bug riêng, chưa nằm danh sách 6 này).

## 3. Kiến trúc luồng tiền (tái dùng pattern P0#3)

- `WalletService` thêm `@InjectConnection() private connection: Connection`.
- `RewardPointLedgerService.debit/credit` đã nhận `session?` (commit `dc0e959`, tách `*Core` để không mở transaction lồng khi có session ngoài) → chỉ cần luồng session vào.
- `cashoutModel.create(...)`, `transactionModel.create(...)`, `doc.save(...)`, `findOneAndUpdate(...)` truyền `{ session }`.
- Read bên trong transaction dùng `{ session }`.
- Không có side-effect notify/audit ở 2 hàm này; nếu có sẽ chạy sau commit.
- Yêu cầu Mongo replica set (Atlas OK) — giống P0#3.

## 4. Chi tiết 6 fix

### Fix 1 — `requestCashout` transaction + đảo thứ tự
File: `be/src/wallet/wallet.service.ts:33-87`.
- Giữ balance check (`getBalance`) và sinh `redemptionCode` trước transaction.
- Trong `session.withTransaction`: tạo cashout doc → `debit({ ..., session })` (sourceId = doc._id) → tạo wallet txn (`{ session }`).
- Nếu debit/ghi lỗi → rollback toàn bộ, không còn cashout doc PENDING mồ côi.
- Trả về cashout doc như cũ.

### Fix 2 — `processCashout` REJECTED/FAILED transaction (chống double-refund)
File: `be/src/wallet/wallet.service.ts:89-173`.
- Bọc trong `session.withTransaction`: `updateNote` + `credit` (refund, `{ session }`) + đổi `request.status` + set field handler + `transactionModel.findOneAndUpdate({ session })` + `request.save({ session })`.
- Vì credit và save status cùng commit → nếu admin retry sau lỗi giữa chừng sẽ không refund 2 lần (status đã đổi atomic; guard "already processed" ở đầu hàm chặn reprocess).
- Nhánh PAID cũng bọc transaction cho nhất quán (updateNote + save + txn update); không có chuyển điểm.

### Fix 3 — `rejectedBy` (tập con Fix 2)
File: `be/src/wallet/wallet.service.ts:152-170`.
- `APPROVED` → `request.approvedBy = handler`.
- `PAID` → `request.paidBy = handler`, `paidAt`.
- `REJECTED` → `request.rejectedBy = handler` (KHÔNG set `approvedBy`).
- `FAILED` → `request.rejectedBy = handler` (dùng chung field; schema không có `failedBy`).
- Khớp test `be/src/wallet/wallet.service.spec.ts:151` (`rejectedBy` = handler, `approvedBy` undefined).

### Fix 4 — `applyViolationsToResults` guard PUBLISHED
File: `be/src/race-results/race-results.service.ts:632`.
- Đầu hàm: nếu race đã `RESULT_PUBLISHED` hoặc tồn tại result `status === PUBLISHED` cho race → `throw BadRequestException('Không thể áp dụng vi phạm cho kết quả đã công bố')`.
- Caller hợp lệ không bị ảnh hưởng: `simulateRaceResults` (guard LIVE), `confirmResultsForRace` (chỉ DRAFT), bulk record (LIVE→FINISHED). Guard chỉ chặn đường chạy sau PUBLISHED.

### Fix 5 — referee `create` kiểm `approvalStatus === APPROVED`
File: `be/src/referee-assignments/referee-assignments.service.ts:55-63`.
- Thay/bổ sung `existsForUser` bằng `refereeProfilesService.findByUserId(dto.refereeUserId)`; nếu `profile.approvalStatus !== RefereeApprovalStatus.APPROVED` → `BadRequestException('Referee profile chưa được duyệt')`.
- `findByUserId` đã throw NotFound nếu không có profile → vẫn giữ ý nghĩa "phải có profile".

### Fix 6 — `@Roles(ADMIN)` cho findByRace
File: `be/src/referee-assignments/referee-assignments.controller.ts:49-56`.
- Thêm `@UseGuards(RolesGuard)` + `@Roles(RoleName.ADMIN)` cho `GET race/:raceId`.
- Chỉ ADMIN xem danh sách phân công của một race. (Referee xem phần của mình qua `my-assignments`.)

## 5. Thứ tự task (TDD bottom-up)

1. Fix 3 (rejectedBy) — nhỏ nhất, làm suite xanh ngay.
2. Fix 2 (processCashout transaction) — chồng lên Fix 3.
3. Fix 1 (requestCashout transaction).
4. Fix 4 (applyViolations guard).
5. Fix 5 (referee APPROVED).
6. Fix 6 (@Roles findByRace).

> Fix 3 lồng trong cùng vùng code Fix 2; có thể gộp 1↔2 task khi viết plan, miễn giữ test đỏ-trước cho từng hành vi.

## 6. Tiêu chí thành công

- [ ] `npm run build` exit 0.
- [ ] `npm run lint` 0 problem.
- [ ] `npm test` toàn bộ xanh (gồm `wallet.service.spec.ts:151`).
- [ ] Test mới cho: requestCashout rollback khi debit lỗi; processCashout không double-refund; applyViolations throw khi PUBLISHED; referee create reject khi chưa APPROVED; findByRace bị chặn role.
- [ ] Caller cũ không truyền session không đổi hành vi.
