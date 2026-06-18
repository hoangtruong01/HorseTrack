# Critical Findings Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 CRITICAL findings từ audit `docs/audit-2026-06-18-status-sync.md` — đảm bảo atomicity của prediction creation, tự động revert race status khi điều kiện READY bị vi phạm, và bảo vệ cascade cancel bằng transaction.

**Architecture:** Mỗi fix là surgical — không refactor, không thay đổi signature public. Task 1 là prerequisite của Tasks 3 và 4 (phải update RACE_STATUS_FLOW trước khi các service dùng READY→CHECKING revert).

**Tech Stack:** NestJS, Mongoose 7+, MongoDB transactions (replica set), `@nestjs/mongoose` InjectConnection

## Global Constraints

- Không thay đổi public API / controller / DTO
- Mongoose `create([doc], { session })` — dùng array syntax khi cần session
- Mọi `updateMany()` trong transaction phải nhận `{ session }` option
- Notifications và audit logs luôn nằm NGOÀI transaction boundary
- Không dùng `--no-verify` khi commit

---

## File Map

| File | Thay đổi |
|------|---------|
| `src/races/schemas/race.schema.ts` | Thêm `CHECKING` vào allowed transitions của `READY` |
| `src/predictions/predictions.service.ts` | Thêm `@InjectConnection`, bọc `create + debit` trong transaction |
| `src/race-checks/race-checks.service.ts` | Cascade revert race về `CHECKING` khi check → `FAILED` |
| `src/referee-assignments/referee-assignments.service.ts` | Cascade revert race về `CHECKING` khi referee cuối bị REMOVED hoặc DECLINED |
| `src/tournaments/tournaments.service.ts` | Thêm `@InjectConnection`, bọc ledger loop + updateMany trong transaction |
| `src/ai/services/payos.service.ts` | Throw `BadRequestException` thay vì silently return khi PayOS chưa config |

---

## Task 1 — Prerequisite: RACE_STATUS_FLOW cho phép READY → CHECKING

**Files:**
- Modify: `src/races/schemas/race.schema.ts:20`

**Mục đích:** Tasks 3 và 4 cần gọi `racesService.setStatus(raceId, CHECKING)` từ trạng thái READY. Hiện tại `RACE_STATUS_FLOW[READY]` chỉ có `[LIVE, CANCELLED]` — transition sẽ throw. Fix này mở thêm đường revert.

- [ ] **Step 1: Sửa RACE_STATUS_FLOW**

Tại `src/races/schemas/race.schema.ts` line 20, sửa:

```typescript
// TRƯỚC
[RaceStatus.READY]: [RaceStatus.LIVE, RaceStatus.CANCELLED],

// SAU
[RaceStatus.READY]: [RaceStatus.LIVE, RaceStatus.CHECKING, RaceStatus.CANCELLED],
```

- [ ] **Step 2: Verify lint pass**

```bash
npm run lint -- --max-warnings=0
```

Expected: no errors on `race.schema.ts`

- [ ] **Step 3: Commit**

```bash
git add src/races/schemas/race.schema.ts
git commit -m "fix(races): allow READY→CHECKING revert in RACE_STATUS_FLOW"
```

---

## Task 2 — T-1-1: `predictions.create()` atomic

**Files:**
- Modify: `src/predictions/predictions.service.ts`

**Vấn đề:** Hiện tại prediction được tạo tại line 112, sau đó mới debit điểm tại line 121 — hai bước độc lập. Crash giữa chừng = user có prediction mà không bị trừ điểm.

**Fix:** Inject `Connection`, bọc cả hai bước trong `session.withTransaction()`.

- [ ] **Step 1: Thêm import và inject Connection**

Tại đầu file `src/predictions/predictions.service.ts`, sửa imports:

```typescript
// Thêm Connection vào import mongoose
import { ClientSession, Connection, Model, Types } from 'mongoose';

// Thêm InjectConnection vào import @nestjs/mongoose
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
```

Trong constructor, thêm dòng đầu tiên:

```typescript
constructor(
  @InjectConnection() private connection: Connection,  // THÊM DÒNG NÀY
  @InjectModel(Prediction.name)
  private predictionModel: Model<PredictionDocument>,
  // ... các inject khác giữ nguyên
```

- [ ] **Step 2: Bọc create + debit trong transaction**

Trong method `create()`, thay thế đoạn từ line 112 đến 130:

```typescript
// TRƯỚC (lines 112-130)
const prediction = await this.predictionModel.create({
  raceId: new Types.ObjectId(dto.raceId),
  userId: new Types.ObjectId(userId),
  predictedHorseId: new Types.ObjectId(dto.predictedHorseId),
  status: PredictionStatus.PENDING,
  betPoints: betAmount,
});

if (betAmount >= 2) {
  await this.ledgerService.debit({
    userId,
    points: betAmount,
    sourceType: LedgerSourceType.PREDICTION_REWARD,
    sourceId: String(prediction._id),
    note: `Đặt cược dự đoán ${betAmount} điểm cho trận đấu ${race.name}`,
  });
}

return prediction;
```

```typescript
// SAU
const session = await this.connection.startSession();
let prediction: PredictionDocument;
try {
  await session.withTransaction(async () => {
    [prediction] = await this.predictionModel.create(
      [
        {
          raceId: new Types.ObjectId(dto.raceId),
          userId: new Types.ObjectId(userId),
          predictedHorseId: new Types.ObjectId(dto.predictedHorseId),
          status: PredictionStatus.PENDING,
          betPoints: betAmount,
        },
      ],
      { session },
    );
    if (betAmount >= 2) {
      await this.ledgerService.debit({
        userId,
        points: betAmount,
        sourceType: LedgerSourceType.PREDICTION_REWARD,
        sourceId: String(prediction!._id),
        note: `Đặt cược dự đoán ${betAmount} điểm cho trận đấu ${race.name}`,
        session,
      });
    }
  });
} finally {
  await session.endSession();
}
return prediction!;
```

- [ ] **Step 3: Verify TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `predictions.service.ts`

- [ ] **Step 4: Commit**

```bash
git add src/predictions/predictions.service.ts
git commit -m "fix(predictions): wrap create + debit in transaction to prevent free-bet exploit"
```

---

## Task 3 — S-2-1: RaceCheck FAILED → revert Race về CHECKING

**Files:**
- Modify: `src/race-checks/race-checks.service.ts`

**Vấn đề:** Khi referee revert check từ PASSED → FAILED, race vẫn ở READY. Race có thể tiến lên LIVE với ngựa không đạt tiêu chuẩn.

**Prerequisite:** Task 1 phải hoàn thành trước.

- [ ] **Step 1: Thêm RaceStatus import**

Đầu file `src/race-checks/race-checks.service.ts`, xác nhận import đã có:

```typescript
import { RaceStatus } from '../races/schemas/race.schema';
```

(Đã có ở line 11 — không cần thêm)

- [ ] **Step 2: Thêm cascade sau check.save()**

Trong `updateStatus()`, thay thế `return check.save();` ở cuối method:

```typescript
// TRƯỚC (line 146)
return check.save();
```

```typescript
// SAU
const saved = await check.save();

if (dto.status === RaceCheckStatus.FAILED) {
  const race = await this.racesService.findOne(String(check.raceId));
  if (race.status === RaceStatus.READY) {
    await this.racesService.setStatus(String(check.raceId), RaceStatus.CHECKING);
  }
}

return saved;
```

- [ ] **Step 3: Verify TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `race-checks.service.ts`

- [ ] **Step 4: Commit**

```bash
git add src/race-checks/race-checks.service.ts
git commit -m "fix(race-checks): revert race to CHECKING when check fails after READY"
```

---

## Task 4 — S-2-2: Referee REMOVED/DECLINED → revert Race về CHECKING

**Files:**
- Modify: `src/referee-assignments/referee-assignments.service.ts`

**Vấn đề:** Khi referee assignment bị REMOVED hoặc referee DECLINED, nếu không còn ACCEPTED referee nào thì race đang READY không có người chủ trì — nhưng race không bị revert.

**Prerequisite:** Task 1 phải hoàn thành trước.

- [ ] **Step 1: Thêm private helper `revertRaceIfNoAcceptedReferee`**

Thêm method private vào cuối class `RefereeAssignmentsService`, trước dấu `}` đóng class:

```typescript
private async revertRaceIfNoAcceptedReferee(raceId: string): Promise<void> {
  const acceptedCount = await this.assignmentModel.countDocuments({
    raceId: new Types.ObjectId(raceId),
    status: RefereeAssignmentStatus.ACCEPTED,
  });
  if (acceptedCount === 0) {
    const race = await this.racesService.findOne(raceId);
    if (race.status === RaceStatus.READY) {
      await this.racesService.setStatus(raceId, RaceStatus.CHECKING);
    }
  }
}
```

- [ ] **Step 2: Gọi helper trong `removeAssignment()`**

Thay thế toàn bộ method `removeAssignment()`:

```typescript
// TRƯỚC
async removeAssignment(id: string): Promise<RefereeAssignmentDocument> {
  const assignment = await this.assignmentModel.findById(id);
  if (!assignment) throw new NotFoundException('Assignment not found');
  assignment.status = RefereeAssignmentStatus.REMOVED;
  return assignment.save();
}
```

```typescript
// SAU
async removeAssignment(id: string): Promise<RefereeAssignmentDocument> {
  const assignment = await this.assignmentModel.findById(id);
  if (!assignment) throw new NotFoundException('Assignment not found');
  assignment.status = RefereeAssignmentStatus.REMOVED;
  const saved = await assignment.save();
  await this.revertRaceIfNoAcceptedReferee(String(assignment.raceId));
  return saved;
}
```

- [ ] **Step 3: Gọi helper trong `respond()` khi DECLINED**

Thay thế đoạn cuối method `respond()`:

```typescript
// TRƯỚC (lines 209-214)
assignment.status =
  dto.status === RespondStatus.ACCEPTED
    ? RefereeAssignmentStatus.ACCEPTED
    : RefereeAssignmentStatus.DECLINED;

return assignment.save();
```

```typescript
// SAU
assignment.status =
  dto.status === RespondStatus.ACCEPTED
    ? RefereeAssignmentStatus.ACCEPTED
    : RefereeAssignmentStatus.DECLINED;

const saved = await assignment.save();

if (assignment.status === RefereeAssignmentStatus.DECLINED) {
  await this.revertRaceIfNoAcceptedReferee(String(assignment.raceId));
}

return saved;
```

- [ ] **Step 4: Verify TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `referee-assignments.service.ts`

- [ ] **Step 5: Commit**

```bash
git add src/referee-assignments/referee-assignments.service.ts
git commit -m "fix(referee-assignments): revert race to CHECKING when last accepted referee is removed or declines"
```

---

## Task 5 — T-4-1: `cascadeCancel()` transaction

**Files:**
- Modify: `src/tournaments/tournaments.service.ts`

**Vấn đề:** Ledger loop tại line 219–236 refund điểm từng prediction không có transaction. Nếu crash giữa loop, một số users được hoàn tiền, số còn lại không — và status update (`updateMany`) cũng chạy sau đó mà không biết loop đã xử lý đến đâu.

**Fix:** Inject `Connection`, bọc toàn bộ ledger loop + tất cả `updateMany` trong một transaction. Notifications/audit logs giữ ngoài.

- [ ] **Step 1: Thêm import và inject Connection**

Sửa import `@nestjs/mongoose` tại đầu file:

```typescript
// Thêm InjectConnection
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
```

Thêm `Connection` vào import mongoose:

```typescript
import { Connection, Model, Types } from 'mongoose';
```

Thêm `@InjectConnection()` vào constructor — đặt TRƯỚC `@InjectModel`:

```typescript
constructor(
  @InjectConnection() private connection: Connection,  // THÊM DÒNG NÀY
  @InjectModel(Tournament.name)
  private tournamentModel: Model<TournamentDocument>,
  // ... các inject khác giữ nguyên
```

- [ ] **Step 2: Refactor `cascadeCancel()` — tách transactional writes khỏi side effects**

Thay thế toàn bộ method `cascadeCancel()` (lines 202–285):

```typescript
private async cascadeCancel(
  tournamentId: string,
  tournamentName: string,
): Promise<void> {
  const races = await this.raceModel.find({
    tournamentId,
    status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
  });
  const raceIds = races.map((r) => r._id);

  if (raceIds.length === 0) return;

  const pendingPredictions = await this.predictionModel.find({
    raceId: { $in: raceIds },
    status: PredictionStatus.PENDING,
  });

  // ── Transactional: ledger refunds + status updates ──────────────────────
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      for (const p of pendingPredictions) {
        if (p.betPoints && p.betPoints >= 2) {
          await this.ledgerService.credit({
            userId: String(p.userId),
            points: p.betPoints,
            sourceType: LedgerSourceType.PREDICTION_REWARD,
            sourceId: String(p._id),
            note: `Hoàn trả cược dự đoán (+${p.betPoints} điểm) do giải đấu bị hủy`,
            session,
          });
        }
      }

      await Promise.all([
        this.raceModel.updateMany(
          { _id: { $in: raceIds } },
          { $set: { status: RaceStatus.CANCELLED } },
          { session },
        ),
        this.predictionModel.updateMany(
          { raceId: { $in: raceIds }, status: PredictionStatus.PENDING },
          { $set: { status: PredictionStatus.CANCELLED } },
          { session },
        ),
        this.registrationModel.updateMany(
          { raceId: { $in: raceIds }, status: RegistrationStatus.PENDING },
          { $set: { status: RegistrationStatus.CANCELLED } },
          { session },
        ),
        this.registrationModel.updateMany(
          { raceId: { $in: raceIds }, status: RegistrationStatus.APPROVED },
          { $set: { status: RegistrationStatus.WITHDRAWN } },
          { session },
        ),
      ]);
    });
  } finally {
    await session.endSession();
  }

  // ── Side effects: notifications (best-effort, ngoài transaction) ────────
  for (const p of pendingPredictions) {
    if (p.betPoints && p.betPoints >= 2) {
      await this.notificationsService.send(
        String(p.userId),
        'Dự đoán bị hủy',
        `Giải đấu bị hủy, bạn được hoàn trả ${p.betPoints} điểm cược dự đoán.`,
        NotificationType.PREDICTION,
      );
    }
  }

  const ownerIds = await this.registrationModel.distinct('ownerId', {
    tournamentId,
  });
  if (ownerIds.length > 0) {
    await Promise.all(
      ownerIds.map((ownerId) =>
        this.notificationsService.send(
          String(ownerId),
          'Tournament Cancelled',
          `Tournament "${tournamentName}" has been cancelled. Your registrations have been cancelled.`,
          NotificationType.RACE,
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Verify TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `tournaments.service.ts`

- [ ] **Step 4: Commit**

```bash
git add src/tournaments/tournaments.service.ts
git commit -m "fix(tournaments): wrap cascadeCancel ledger loop in transaction to prevent partial refunds"
```

---

## Task 6 — P-3-1: PayOS webhook hardening

**Files:**
- Modify: `src/ai/services/payos.service.ts`

**Clarification:** Sau khi review code, `payos.webhooks.verify()` tại line 111 ĐÃ xác thực HMAC-SHA256 signature của PayOS — finding CRITICAL trong audit bị đánh giá quá cao. Tuy nhiên còn một gap thực: khi `this.payos === null` (credentials chưa cấu hình), endpoint trả về `void` với status 200 thay vì báo lỗi. Điều này che giấu misconfiguration.

- [ ] **Step 1: Throw thay vì silently return khi PayOS chưa config**

Trong `handleWebhook()`, thay thế đoạn đầu method:

```typescript
// TRƯỚC (lines 100-105)
async handleWebhook(body: unknown): Promise<void> {
  if (!this.payos) {
    this.logger.error(
      'PayOS webhook nhận được nhưng PAYOS credentials chưa cấu hình — payment sẽ kẹt PENDING. Kiểm tra biến môi trường PAYOS_*.',
    );
    return;
  }
```

```typescript
// SAU
async handleWebhook(body: unknown): Promise<void> {
  if (!this.payos) {
    this.logger.error(
      'PayOS webhook nhận được nhưng PAYOS credentials chưa cấu hình. Kiểm tra biến môi trường PAYOS_*.',
    );
    throw new BadRequestException(
      'PayOS chưa được cấu hình — webhook bị từ chối',
    );
  }
```

Đảm bảo `BadRequestException` đã được import ở đầu file (đã có tại line 1).

- [ ] **Step 2: Verify TypeScript compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/ai/services/payos.service.ts
git commit -m "fix(ai): reject webhook with 400 when PayOS credentials not configured"
```

---

## Kiểm tra tổng thể sau tất cả tasks

- [ ] **Run lint toàn bộ dự án**

```bash
npm run lint
```

Expected: 0 errors

- [ ] **Run TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Khởi động dev server và verify không có startup error**

```bash
npm run start:dev
```

Expected: server khởi động thành công, không có lỗi module injection hay schema validation

---

## Notes

- **Task thứ tự bắt buộc:** Task 1 → Task 3 và Task 4 (Tasks 3 & 4 phụ thuộc vào READY→CHECKING trong flow)
- **Task 2 và 5 độc lập** — có thể thực hiện song song với nhau và với Task 1
- **Task 6 độc lập** — không phụ thuộc gì
- **P-3-1 re-evaluation:** PayOS webhook đã có signature verification qua SDK (`payos.webhooks.verify()`). Finding này thực chất là MEDIUM, không phải CRITICAL. Plan vẫn fix gap còn lại (null payos case).
