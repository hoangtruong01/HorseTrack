# Spec — Nhóm D: BE state-machine fixes (2026-06-17)

> Nhánh `feature/vinh-dev`, base `main`. Nối tiếp Nhóm C. Commit local, **không** Co-Authored-By.

## 1. Mục tiêu

Vá 3 bug state-machine P1 trong nhóm D (audit §0bis). Sau khi xong:
- Owner được credit điểm rank khi race công bố kết quả (RACE_WIN_REWARD vào ledger).
- `cascadeCancel` tôn trọng trạng thái terminal race; registration APPROVED chuyển sang WITHDRAWN thay vì CANCELLED.
- `RaceCheck.updateStatus` từ chối transition không hợp lệ (mirror pattern `RACE_STATUS_FLOW`).

## 2. Phạm vi & cách làm

1 spec → 1 plan → 3 task TDD bottom-up (test đỏ trước, vá, xanh), commit riêng từng task. Không Co-Authored-By.

**KHÔNG** trong phạm vi: Nhóm E (cleanup), FE P0, cross-layer InjectModel refactor (Plan 5).

## 3. Fix D#1 — Credit điểm rank vào ledger khi publish

### Vấn đề
`RaceResult.points` được tính (POINTS_MAP: rank1→10, rank2→7, rank3→5, rank4→3) và lưu DB nhưng không bao giờ credit vào ledger user. `LedgerSourceType.RACE_WIN_REWARD` đã tồn tại trong enum nhưng chưa dùng.

### Thiết kế
File: `be/src/race-results/race-results.service.ts`, trong `publishByRace` — bên trong `session.withTransaction` (P0#3), sau `payoutBetsForRace`.

Thêm vòng lặp credit cho mỗi result có `outcome === FINISHED && points > 0`:

```ts
for (const result of results) {
  if (
    result.outcome === RaceResultOutcome.FINISHED &&
    result.points > 0
  ) {
    const alreadyCredited = await this.ledgerService.exists(
      String(result.ownerId),
      LedgerSourceType.RACE_WIN_REWARD,
      String(result._id),
      session,
    );
    if (!alreadyCredited) {
      await this.ledgerService.credit({
        userId: String(result.ownerId),
        points: result.points,
        sourceType: LedgerSourceType.RACE_WIN_REWARD,
        sourceId: String(result._id),
        note: `Điểm thưởng hạng ${result.rank} giải đua`,
        session,
      });
    }
  }
}
```

**Idempotency:** `ledgerService.exists(userId, RACE_WIN_REWARD, resultId, session)` ngăn double-credit khi `withTransaction` retry — cùng pattern với `createPrizesForRace`.

**Không thay đổi:** Schema `RACE_WIN_REWARD` đã có. `RewardPointLedgerService` không đổi. `payoutBetsForRace` signature không đổi.

**Vị trí trong transaction:**
```
withTransaction:
  1. findByIdAndUpdate results → PUBLISHED   (đã có)
  2. setStatus race → RESULT_PUBLISHED       (đã có)
  3. createPrizesForRace                     (đã có)
  4. payoutBetsForRace → notifyIntents       (đã có)
  5. [NEW] credit RACE_WIN_REWARD per result
```

Side-effect (syncTournamentStatus, notification, audit) giữ nguyên sau commit.

## 4. Fix D#2 — `cascadeCancel` tôn trọng terminal states

### Vấn đề
`tournaments.service.ts:cascadeCancel` dùng raw `updateMany` không lọc trạng thái:
- Race: ép tất cả → CANCELLED, kể cả RESULT_PUBLISHED (terminal theo `RACE_STATUS_FLOW`).
- Registration: ép tất cả non-CANCELLED → CANCELLED, kể cả APPROVED (vi phạm guard của registrations service). Enum `WITHDRAWN` đã có nhưng chưa dùng trong luồng này.

### Thiết kế
File: `be/src/tournaments/tournaments.service.ts`, method `cascadeCancel`.

**Race cancellation** — thêm `$nin` loại trừ terminal states:
```ts
await this.raceModel.updateMany(
  {
    tournamentId,
    status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
  },
  { $set: { status: RaceStatus.CANCELLED } },
);
```
Dùng `updateMany` (không gọi `setStatus` từng race) — đây là admin bulk op, filter `$nin` đảm bảo ngữ nghĩa đúng.

**Registration cancellation** — tách thành 2 `updateMany`:
```ts
// PENDING → CANCELLED (hủy thông thường)
await this.registrationModel.updateMany(
  { raceId: { $in: raceIds }, status: RegistrationStatus.PENDING },
  { $set: { status: RegistrationStatus.CANCELLED } },
);
// APPROVED → WITHDRAWN (bị hủy bởi hệ thống, phân biệt với tự hủy)
await this.registrationModel.updateMany(
  { raceId: { $in: raceIds }, status: RegistrationStatus.APPROVED },
  { $set: { status: RegistrationStatus.WITHDRAWN } },
);
```
REJECTED/CANCELLED/WITHDRAWN giữ nguyên — không bị chạm.

**Lấy `raceIds`:** sau khi fetch races của tournament, extract `_id` list (đã có trong flow hiện tại).

## 5. Fix D#3 — `RaceCheck.updateStatus` state guard

### Vấn đề
`race-checks.service.ts:updateStatus` gán `check.status = dto.status` trực tiếp — không validate transition. Cho phép PASSED→PENDING (lùi) hoặc FAILED→PASSED (bỏ qua retry).

### Thiết kế

**Thêm flow map vào schema:**
File: `be/src/race-checks/schemas/race-check.schema.ts`

```ts
export const RACE_CHECK_STATUS_FLOW: Record<RaceCheckStatus, RaceCheckStatus[]> = {
  [RaceCheckStatus.PENDING]: [RaceCheckStatus.PASSED, RaceCheckStatus.FAILED],
  [RaceCheckStatus.PASSED]: [],                        // terminal
  [RaceCheckStatus.FAILED]: [RaceCheckStatus.PENDING], // cho phép retry
};
```

**Guard trong service:**
File: `be/src/race-checks/race-checks.service.ts`, trong `updateStatus`, trước `check.status = dto.status`:

```ts
import { RACE_CHECK_STATUS_FLOW } from './schemas/race-check.schema';

const allowed = RACE_CHECK_STATUS_FLOW[check.status];
if (!allowed.includes(dto.status)) {
  throw new BadRequestException(
    `Invalid status transition: ${check.status} → ${dto.status}`,
  );
}
```

**Rationale transitions:**
- `PENDING → PASSED/FAILED`: bình thường
- `PASSED → (nothing)`: terminal, đã pass không thể lùi
- `FAILED → PENDING`: cho phép retry check sau khi fix vấn đề

## 6. Thứ tự task (TDD bottom-up)

1. **D#3** — RaceCheck state guard (độc lập, nhỏ nhất)
2. **D#2** — cascadeCancel fix (độc lập, tournaments module)
3. **D#1** — credit RACE_WIN_REWARD trong publishByRace (phụ thuộc vào hiểu publishByRace flow)

## 7. Tiêu chí thành công

- [ ] `npm run build` exit 0.
- [ ] `npm run lint` 0 problems.
- [ ] `npm test` toàn bộ xanh.
- [ ] Test mới: RACE_WIN_REWARD được credit đúng ownerId/points/session trong publishByRace; credit bị skip nếu đã tồn tại; cascadeCancel bỏ qua RESULT_PUBLISHED race; APPROVED registration → WITHDRAWN; RaceCheck reject invalid transition.
- [ ] Caller cũ không truyền session không đổi hành vi.
