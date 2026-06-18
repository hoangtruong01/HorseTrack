# Transaction Integrity (Points & Payout) — Implementation Plan (Plan 2/5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Loại bỏ nguy cơ lệch số dư điểm và double-credit khi payout — `User.points` là nguồn sự thật, `credit/debit` ghi nguyên tử kèm audit, và `publishByRace` chạy lại an toàn (idempotent).

**Architecture (Path A — Idempotent-safe, đã chốt qua brainstorm):**
1. `getBalance` đọc thẳng `User.points` (nguồn sự thật duy nhất) thay vì snapshot `balanceAfter` của ledger.
2. `RewardPointLedgerService.credit/debit` bọc hai thao tác (`$inc User.points` + tạo audit row) trong **một MongoDB transaction nội bộ** → audit row luôn đi cùng thay đổi số dư. Dùng `@InjectConnection` theo đúng pattern đã có ở `ArrangementEngineService.applyArrangement`.
3. `publishByRace` là flow do admin bấm và đã idempotent một phần; sửa bug thứ tự ở `createPrizesForRace` để mỗi lần credit owner/jockey được guard bằng `ledgerService.exists(...)` TRƯỚC khi credit (giống nhánh referee) → admin bấm lại không double-credit.

**Tech Stack:** NestJS 11, Mongoose 9 (transactions chạy trên MongoDB Atlas — đã xác nhận qua arrangement-engine), Jest 30 + ts-jest. Test theo pattern `src/wallet/wallet.service.spec.ts`.

**Cơ sở:** Audit `be/docs/audit-2026-06-14-service-integration.md` mục 4.3 + P0 #3; quyết định brainstorm: nguồn sự thật = `User.points`; cơ chế = Path A.

**Lệnh verify chuẩn (từ `be/`):** `npm run build` · `npm test` · `npm run lint`.

**Ngoài phạm vi (plan khác):** `cascadeCancel` transaction → Plan 4. Wrapping cashout trong transaction → không làm (đã chọn Path A). `payoutBetsForRace` đã an toàn nhờ atomic status guard → không đổi.

---

## File Structure

**Sửa:**
- `be/src/reward-point-ledger/reward-point-ledger.service.ts` — `getBalance` đọc User.points; `credit`/`debit` bọc transaction nội bộ.
- `be/src/prizes/prizes.service.ts` — guard credit owner/jockey bằng `ledgerService.exists` trước khi credit.

**Test:**
- `be/src/reward-point-ledger/reward-point-ledger.service.spec.ts` — tạo mới.
- `be/src/prizes/prizes.service.spec.ts` — đã có; bổ sung test re-run không double-credit.

---

## Task 1: `getBalance` đọc `User.points` (nguồn sự thật)

Hiện `getBalance` đọc `balanceAfter` của row ledger mới nhất (snapshot) → lệch khi audit row thiếu/không đúng thứ tự. Đổi sang đọc thẳng `User.points`.

**Files:**
- Modify: `be/src/reward-point-ledger/reward-point-ledger.service.ts` (`getBalance`, dòng 33-39)
- Test (create): `be/src/reward-point-ledger/reward-point-ledger.service.spec.ts`

- [ ] **Step 1: Viết test thất bại**

Tạo `be/src/reward-point-ledger/reward-point-ledger.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RewardPointLedger } from './schemas/reward-point-ledger.schema';
import { User } from '../users/schemas/user.schema';
import { RewardPointLedgerService } from './reward-point-ledger.service';

describe('RewardPointLedgerService.getBalance', () => {
  let service: RewardPointLedgerService;
  let userModel: { findById: jest.Mock };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    userModel = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardPointLedgerService,
        { provide: getModelToken(RewardPointLedger.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getConnectionToken(), useValue: {} },
      ],
    }).compile();

    service = module.get(RewardPointLedgerService);
  });

  it('reads the balance from User.points (source of truth)', async () => {
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ points: 250 }),
      }),
    });

    const balance = await service.getBalance(userId);

    expect(balance).toBe(250);
    expect(userModel.findById).toHaveBeenCalledWith(userId);
  });

  it('returns 0 when user not found', async () => {
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    expect(await service.getBalance(userId)).toBe(0);
  });
});
```

- [ ] **Step 2: Chạy test cho thất bại**

Run: `cd be && npx jest src/reward-point-ledger/reward-point-ledger.service.spec.ts`
Expected: FAIL — `getBalance` hiện đọc ledgerModel, chưa gọi `userModel.findById`.

- [ ] **Step 3: Sửa `getBalance`**

Trong `be/src/reward-point-ledger/reward-point-ledger.service.ts` thay:
```typescript
  async getBalance(userId: string): Promise<number> {
    const latest = await this.ledgerModel
      .findOne({ userId: this.buildUserIdFilter(userId) })
      .sort({ createdAt: -1 })
      .exec();
    return latest?.balanceAfter ?? 0;
  }
```
bằng:
```typescript
  async getBalance(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).select('points').exec();
    return user?.points ?? 0;
  }
```

- [ ] **Step 4: Chạy test cho pass**

Run: `cd be && npx jest src/reward-point-ledger/reward-point-ledger.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Build + full test**

Run: `cd be && npm run build && npm test`
Expected: exit 0; tất cả PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(ledger): getBalance reads User.points as single source of truth

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `credit`/`debit` ghi nguyên tử kèm audit (transaction nội bộ)

Hiện `$inc User.points` và `ledgerModel.create` là hai thao tác rời. Bọc chúng trong một transaction để audit row luôn đi cùng thay đổi số dư.

**Files:**
- Modify: `be/src/reward-point-ledger/reward-point-ledger.service.ts` (constructor + `credit` + `debit`)
- Test: `be/src/reward-point-ledger/reward-point-ledger.service.spec.ts` (bổ sung)

- [ ] **Step 1: Viết test thất bại (commit transaction được gọi)**

Thêm vào file spec ở Task 1 một describe block mới:
```typescript
import { getConnectionToken } from '@nestjs/mongoose'; // đã import ở trên

describe('RewardPointLedgerService.credit (atomic)', () => {
  let service: RewardPointLedgerService;
  let userModel: { findByIdAndUpdate: jest.Mock };
  let ledgerModel: { create: jest.Mock };
  let session: {
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    abortTransaction: jest.Mock;
    endSession: jest.Mock;
  };
  let connection: { startSession: jest.Mock };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
    };
    connection = { startSession: jest.fn().mockResolvedValue(session) };
    userModel = {
      findByIdAndUpdate: jest.fn().mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ points: 300 }),
        }),
      }),
    };
    ledgerModel = {
      create: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId() }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardPointLedgerService,
        { provide: getModelToken(RewardPointLedger.name), useValue: ledgerModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get(RewardPointLedgerService);
  });

  it('commits the $inc and the ledger row in one transaction', async () => {
    await service.credit({
      userId,
      points: 100,
      sourceType: 'race_win_reward' as never,
    });

    expect(connection.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    // ledger row created within the session
    expect(ledgerModel.create).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ pointsDelta: 100, balanceAfter: 300 }),
      ]),
      { session },
    );
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test cho thất bại**

Run: `cd be && npx jest src/reward-point-ledger/reward-point-ledger.service.spec.ts -t "one transaction"`
Expected: FAIL — code hiện chưa dùng session (ledgerModel.create gọi không kèm `{ session }`).

- [ ] **Step 3: Thêm InjectConnection + bọc transaction**

Trong `be/src/reward-point-ledger/reward-point-ledger.service.ts`:

a) Cập nhật import:
```typescript
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
```

b) Thêm vào constructor:
```typescript
  constructor(
    @InjectModel(RewardPointLedger.name)
    private ledgerModel: Model<RewardPointLedgerDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}
```

c) Thay `credit`:
```typescript
  async credit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          params.userId,
          { $inc: { points: params.points } },
          { new: true },
        )
        .session(session)
        .exec();

      const balanceAfter = updatedUser?.points ?? params.points;

      const [entry] = await this.ledgerModel.create(
        [
          {
            userId: new Types.ObjectId(params.userId),
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            pointsDelta: params.points,
            balanceAfter,
            note: params.note,
            createdBy: params.createdBy,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return entry;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
```

d) Thay `debit` (giữ nguyên guard `$gte` nguyên tử, chuyển hai thao tác vào session):
```typescript
  async debit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(params.userId),
            points: { $gte: params.points },
          },
          { $inc: { points: -params.points } },
          { new: true },
        )
        .session(session)
        .exec();

      if (!updatedUser) {
        await session.abortTransaction();
        const currentBalance = await this.getBalance(params.userId);
        throw new BadRequestException(
          `Insufficient points. Current balance: ${currentBalance}, required: ${params.points}`,
        );
      }

      const [entry] = await this.ledgerModel.create(
        [
          {
            userId: new Types.ObjectId(params.userId),
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            pointsDelta: -params.points,
            balanceAfter: updatedUser.points,
            note: params.note,
            createdBy: params.createdBy,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return entry;
    } catch (err) {
      if (session.inTransaction()) await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
```
Lưu ý: nhánh `!updatedUser` đã `abortTransaction()` rồi mới throw; khối `catch` dùng `session.inTransaction()` để tránh abort lần hai.

- [ ] **Step 4: Chạy test cho pass**

Run: `cd be && npx jest src/reward-point-ledger/reward-point-ledger.service.spec.ts`
Expected: tất cả PASS (getBalance + credit transaction).

- [ ] **Step 5: Build + full test**

Run: `cd be && npm run build && npm test`
Expected: exit 0; tất cả PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(ledger): wrap credit/debit balance change and audit row in one transaction

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Prize owner/jockey — guard credit bằng `ledger.exists` trước khi credit

Hiện `createPrizesForRace` credit owner/jockey TRƯỚC rồi mới tạo Prize doc. Nếu crash giữa hai bước, admin bấm publish lại → không thấy Prize → credit lần hai. Sửa: kiểm tra `ledgerService.exists(userId, RACE_WIN_REWARD, raceId)` trước khi credit (giống nhánh referee đã làm đúng).

**Files:**
- Modify: `be/src/prizes/prizes.service.ts` (`createPrizesForRace`, nhánh owner ~78-106 và jockey ~110-138)
- Test: `be/src/prizes/prizes.service.spec.ts` (bổ sung)

- [ ] **Step 1: Đọc spec hiện có để khớp pattern**

Mở `be/src/prizes/prizes.service.spec.ts` để nắm cách mock `ledgerService`, `raceModel`, `resultModel`, `horseModel`, `registrationModel`, `prizeModel`, `assignmentModel`. Giữ đúng style đó.

- [ ] **Step 2: Viết test thất bại — re-run không double-credit owner**

Thêm test: dựng một race có `prize > 0`, một winner result rank 1 PUBLISHED, horse có `ownerId`. Mock `ledgerService.exists` trả `true` cho owner (mô phỏng đã credit ở lần publish trước nhưng Prize doc chưa kịp tạo). Kỳ vọng `ledgerService.credit` KHÔNG được gọi cho owner.

Khung test (điều chỉnh tên mock cho khớp spec hiện có):
```typescript
it('does not re-credit the owner when a RACE_WIN_REWARD ledger entry already exists', async () => {
  // race.prize > 0, winnerResult rank 1 PUBLISHED, horse with ownerId, no jockey
  // registrationModel.findOne -> null (default 30% jockey share)
  // prizeModel.findOne -> null (no existing Prize doc)
  // ledgerService.exists -> true for the owner
  ledgerService.exists.mockResolvedValue(true);

  await service.createPrizesForRace(raceId);

  expect(ledgerService.credit).not.toHaveBeenCalledWith(
    expect.objectContaining({ sourceType: LedgerSourceType.RACE_WIN_REWARD }),
  );
});
```

- [ ] **Step 3: Chạy test cho thất bại**

Run: `cd be && npx jest src/prizes/prizes.service.spec.ts -t "re-credit the owner"`
Expected: FAIL — code hiện chỉ guard bằng `existingOwnerPrize`, không bằng `ledger.exists`, nên vẫn credit.

- [ ] **Step 4: Sửa nhánh owner**

Trong `be/src/prizes/prizes.service.ts`, nhánh owner: thay điều kiện guard. Hiện tại:
```typescript
            const existingOwnerPrize = await this.prizeModel.findOne({
              raceId: new Types.ObjectId(raceId),
              horseId: winnerResult.horseId,
              ownerId: horse.ownerId,
            });

            if (!existingOwnerPrize) {
              // Credit owner's ledger directly
              await this.ledgerService.credit({ ... });
              const ownerPrize = await this.prizeModel.create({ ... });
              createdPrizes.push(ownerPrize);
            }
```
Đổi thành: guard credit bằng `ledger.exists` (durable), vẫn tạo Prize doc nếu chưa có:
```typescript
            const alreadyCredited = await this.ledgerService.exists(
              String(horse.ownerId),
              LedgerSourceType.RACE_WIN_REWARD,
              raceId,
            );

            if (!alreadyCredited) {
              await this.ledgerService.credit({
                userId: String(horse.ownerId),
                points: ownerAmount,
                sourceType: LedgerSourceType.RACE_WIN_REWARD,
                sourceId: raceId,
                note: `Received ${ownerSharePct}% winner reward for race "${race.name}" (Horse: ${horse.name})`,
              });
            }

            const existingOwnerPrize = await this.prizeModel.findOne({
              raceId: new Types.ObjectId(raceId),
              horseId: winnerResult.horseId,
              ownerId: horse.ownerId,
            });
            if (!existingOwnerPrize) {
              const ownerPrize = await this.prizeModel.create({
                tournamentId: race.tournamentId,
                raceId: new Types.ObjectId(raceId),
                horseId: winnerResult.horseId,
                ownerId: horse.ownerId,
                rank: 1,
                amount: ownerAmount,
                status: PrizePaymentStatus.PAID,
                paidAt: new Date(),
              });
              createdPrizes.push(ownerPrize);
            }
```

- [ ] **Step 5: Sửa nhánh jockey tương tự**

Áp dụng đúng cùng pattern cho nhánh jockey (dùng `String(winnerResult.jockeyUserId)` làm userId trong `ledger.exists` và `ledger.credit`; vẫn guard tạo Prize bằng `existingJockeyPrize`).

- [ ] **Step 6: Chạy test cho pass + full**

Run: `cd be && npx jest src/prizes/prizes.service.spec.ts`
Expected: tất cả PASS (test cũ + test re-run mới).

- [ ] **Step 7: Build + lint + full test**

Run: `cd be && npm run build && npm run lint && npm test`
Expected: exit 0; tất cả PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(prizes): guard winner credit with ledger.exists to prevent double-credit on republish

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (đã thực hiện)

- **Spec coverage:** 3 quyết định brainstorm → Task 1 (getBalance←User.points), Task 2 (credit/debit transaction nội bộ), Task 3 (prize guard exists). `payoutBetsForRace` đã an toàn → không task. `cascadeCancel`/cashout → ngoài phạm vi như đã ghi.
- **Placeholder scan:** không có TBD/TODO; mọi step có code/lệnh cụ thể (test owner/jockey tham chiếu mock của spec hiện có — Step 1 yêu cầu đọc spec để khớp tên mock, vì spec hiện có do tồn tại sẵn không trích nguyên văn được).
- **Type consistency:** `getBalance` trả `Promise<number>` không đổi; `credit/debit` vẫn trả `Promise<RewardPointLedgerDocument>` (dùng `const [entry] = await create([...])`). `@InjectConnection() connection: Connection` khớp pattern arrangement-engine. `ledgerService.exists(userId, sourceType, sourceId)` đúng chữ ký hiện có (`reward-point-ledger.service.ts:41`).

---

## Không thuộc Plan này (plan kế tiếp)
- **Plan 3 — AI arrangement:** `applyArrangement` tạo Registration từ `proposedRaces[].entries`.
- **Plan 4 — Race-results & state-machine:** `RaceResult.points`, `cascadeCancel` (gồm cả wrapping transaction khi rework), `RaceCheck` guard.
- **Plan 5 — Service boundary + cleanup.**
