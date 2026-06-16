# Group C BE Bugfixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vá 6 bug correctness/security nhóm C: luồng tiền cashout atomic, `rejectedBy` ghi đúng, guard kết quả PUBLISHED, kiểm referee APPROVED, siết role list phân công.

**Architecture:** Tái dùng pattern transaction của P0#3 — `WalletService` inject `@InjectConnection() Connection`, bọc luồng tiền trong `session.withTransaction`, luồng `session` vào `ledgerService.debit/credit` (đã nhận `session?`) và `Model.create/findOneAndUpdate/save`. Các fix referee/race-results là guard/annotation độc lập.

**Tech Stack:** NestJS, Mongoose, Jest. MongoDB cần replica set cho transaction (Atlas OK).

---

## File Structure

- `be/src/wallet/wallet.service.ts` — Fix 1 (requestCashout), Fix 2 (processCashout tx), Fix 3 (rejectedBy). Thêm `@InjectConnection`.
- `be/src/wallet/wallet.service.spec.ts` — test cho cả 3 fix; thêm provider `getConnectionToken` + mock session.
- `be/src/race-results/race-results.service.ts` — Fix 4 (guard PUBLISHED trong `applyViolationsToResults`).
- `be/src/race-results/race-results.service.spec.ts` — test guard; thêm `exists` vào mock `resultModel`.
- `be/src/referee-assignments/referee-assignments.service.ts` — Fix 5 (kiểm `approvalStatus === APPROVED`).
- `be/src/referee-assignments/referee-assignments.service.spec.ts` — **TẠO MỚI**, test Fix 5.
- `be/src/referee-assignments/referee-assignments.controller.ts` — Fix 6 (`@Roles(ADMIN)` cho findByRace).

Quy ước: lệnh chạy từ thư mục `be/`. Commit **không** kèm `Co-Authored-By`.

---

## Task 1: Fix 3 — `processCashout` ghi `rejectedBy` (quick win, làm suite xanh)

**Files:**
- Modify: `be/src/wallet/wallet.service.ts:161-170`
- Test: `be/src/wallet/wallet.service.spec.ts:123-153` (đã tồn tại, đang đỏ ở dòng 151)

- [ ] **Step 1: Chạy test hiện có để xác nhận đỏ**

Run: `npm test -- wallet.service.spec`
Expected: FAIL tại `wallet.service.spec.ts:151` — `expect(request.rejectedBy).toEqual(...)` nhận `undefined` (code đang set `approvedBy`).

- [ ] **Step 2: Sửa nhánh REJECTED/FAILED ghi `rejectedBy`**

Trong `wallet.service.ts`, đổi block (hiện ở `:161-170`):

```ts
    } else if (
      status === CashoutStatus.REJECTED ||
      status === CashoutStatus.FAILED
    ) {
      request.rejectedBy = new Types.ObjectId(handlerId);
      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id },
        { status: TransactionStatus.FAILED },
      );
    }
```

(Chỉ đổi `request.approvedBy` → `request.rejectedBy`; phần còn lại giữ nguyên.)

- [ ] **Step 3: Chạy lại test, xác nhận xanh**

Run: `npm test -- wallet.service.spec`
Expected: PASS toàn bộ file (gồm dòng 151).

- [ ] **Step 4: Chạy toàn bộ suite xác nhận không vỡ gì khác**

Run: `npm test`
Expected: tất cả PASS (suite xanh hoàn toàn).

- [ ] **Step 5: Commit**

```bash
git add be/src/wallet/wallet.service.ts
git commit -m "fix(wallet): record rejectedBy for REJECTED/FAILED cashout (C#3)"
```

---

## Task 2: Fix 2 — `processCashout` bọc transaction (chống double-refund)

**Files:**
- Modify: `be/src/wallet/wallet.service.ts` (imports, constructor, toàn bộ `processCashout`)
- Test: `be/src/wallet/wallet.service.spec.ts` (beforeEach + 4 test processCashout)

- [ ] **Step 1: Cập nhật test — thêm mock connection và kỳ vọng `session`**

Trong `wallet.service.spec.ts`:

(a) Thêm import:
```ts
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
```

(b) Thêm helper `makeSession` và biến `mockConnection` (đặt cạnh các khai báo mock, trước `beforeEach`):
```ts
  let mockConnection: { startSession: jest.Mock };

  function makeSession() {
    const endSession = jest.fn().mockResolvedValue(undefined);
    const withTransaction = jest
      .fn()
      .mockImplementation(async (fn: () => Promise<void>) => {
        await fn();
      });
    return { withTransaction, endSession };
  }
```

(c) Trong `beforeEach`, thêm vào phần khởi tạo mock và providers:
```ts
    mockConnection = { startSession: jest.fn() };
    mockConnection.startSession.mockResolvedValue(makeSession());
```
và trong mảng `providers` thêm:
```ts
        { provide: getConnectionToken(), useValue: mockConnection },
```

(d) Test REJECTED (`:138-149`): thêm `session` vào kỳ vọng `credit` và `findOneAndUpdate`. Lấy session đang dùng và đổi 2 assertion:
```ts
    const session = makeSession();
    mockConnection.startSession.mockResolvedValue(session);
    // ... gọi processCashout ...
    expect(ledgerService.credit).toHaveBeenCalledWith({
      userId: userId.toHexString(),
      points: 1000,
      sourceType: LedgerSourceType.REDEMPTION,
      sourceId: cashoutId.toHexString(),
      note: `Hoàn điểm do yêu cầu quy đổi bị từ chối (Mã: ${request.redemptionCode})`,
      createdBy: handlerId,
      session,
    });
    expect(transactionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { cashoutRequestId: cashoutId },
      { status: TransactionStatus.FAILED },
      { session },
    );
    expect(request.save).toHaveBeenCalledWith({ session });
```

(e) Test PAID (`:99-121`): đổi kỳ vọng `findOneAndUpdate` và `save` thêm `{ session }` tương tự (lấy `session` qua `mockConnection.startSession.mockResolvedValue(session)` trong test).

(f) Test APPROVED (`:81-97`): không gọi credit/findOneAndUpdate; chỉ cần đổi `expect(request.save).toHaveBeenCalled()` → `expect(request.save).toHaveBeenCalledWith({ session })` (sau khi set `mockConnection.startSession.mockResolvedValue(session)`).

- [ ] **Step 2: Chạy test, xác nhận đỏ**

Run: `npm test -- wallet.service.spec`
Expected: FAIL — code chưa truyền `session`/chưa inject connection.

- [ ] **Step 3: Inject connection vào WalletService**

Trong `wallet.service.ts`, đổi imports:
```ts
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
```
Thêm vào constructor (sau `ledgerService`):
```ts
    @InjectConnection() private connection: Connection,
```

- [ ] **Step 4: Bọc `processCashout` trong transaction**

Thay thân `processCashout` (giữ phần `findById` + guard "already processed" trước transaction) bằng:

```ts
  async processCashout(
    id: string,
    status: CashoutStatus,
    handlerId: string,
    rejectReason?: string,
  ): Promise<CashoutRequestDocument> {
    const request = await this.cashoutModel.findById(id);
    if (!request) throw new NotFoundException('Cashout request not found');

    if (
      request.status === CashoutStatus.PAID ||
      request.status === CashoutStatus.REJECTED ||
      request.status === CashoutStatus.FAILED
    ) {
      throw new BadRequestException('Request has already been processed');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        if (status === CashoutStatus.PAID) {
          await this.ledgerService.updateNote(
            String(request._id),
            LedgerSourceType.REDEMPTION,
            `Yêu cầu quy đổi ${request.pointsRedeemed} điểm thưởng (Mã: ${request.redemptionCode}) - Đã thanh toán thành công.`,
          );
        } else if (status === CashoutStatus.REJECTED) {
          await this.ledgerService.updateNote(
            String(request._id),
            LedgerSourceType.REDEMPTION,
            `Yêu cầu quy đổi ${request.pointsRedeemed} điểm thưởng (Mã: ${request.redemptionCode}) - Bị từ chối.`,
          );
          await this.ledgerService.credit({
            userId: String(request.userId),
            points: request.pointsRedeemed,
            sourceType: LedgerSourceType.REDEMPTION,
            sourceId: String(request._id),
            note: `Hoàn điểm do yêu cầu quy đổi bị từ chối (Mã: ${request.redemptionCode})${rejectReason ? `: ${rejectReason}` : ''}`,
            createdBy: handlerId,
            session,
          });
        } else if (status === CashoutStatus.FAILED) {
          await this.ledgerService.updateNote(
            String(request._id),
            LedgerSourceType.REDEMPTION,
            `Yêu cầu quy đổi ${request.pointsRedeemed} điểm thưởng (Mã: ${request.redemptionCode}) - Thất bại/Lỗi.`,
          );
          await this.ledgerService.credit({
            userId: String(request.userId),
            points: request.pointsRedeemed,
            sourceType: LedgerSourceType.REDEMPTION,
            sourceId: String(request._id),
            note: `Hoàn điểm do yêu cầu quy đổi gặp lỗi (Mã: ${request.redemptionCode})${rejectReason ? `: ${rejectReason}` : ''}`,
            createdBy: handlerId,
            session,
          });
        }

        request.status = status;
        if (rejectReason) {
          request.rejectReason = rejectReason;
        }

        if (status === CashoutStatus.APPROVED) {
          request.approvedBy = new Types.ObjectId(handlerId);
        } else if (status === CashoutStatus.PAID) {
          request.paidBy = new Types.ObjectId(handlerId);
          request.paidAt = new Date();
          await this.transactionModel.findOneAndUpdate(
            { cashoutRequestId: request._id },
            { status: TransactionStatus.SUCCESS },
            { session },
          );
        } else if (
          status === CashoutStatus.REJECTED ||
          status === CashoutStatus.FAILED
        ) {
          request.rejectedBy = new Types.ObjectId(handlerId);
          await this.transactionModel.findOneAndUpdate(
            { cashoutRequestId: request._id },
            { status: TransactionStatus.FAILED },
            { session },
          );
        }

        await request.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return request;
  }
```

> Lưu ý: `updateNote` không nhận session (ghi nhãn cosmetic, idempotent) — giữ chữ ký cũ, nằm trong callback là chấp nhận được.

- [ ] **Step 5: Chạy test, xác nhận xanh**

Run: `npm test -- wallet.service.spec`
Expected: PASS toàn bộ.

- [ ] **Step 6: Build + lint**

Run: `npm run build && npm run lint`
Expected: build exit 0, lint 0 problem.

- [ ] **Step 7: Commit**

```bash
git add be/src/wallet/wallet.service.ts be/src/wallet/wallet.service.spec.ts
git commit -m "fix(wallet): wrap processCashout refund in a transaction (C#2)"
```

---

## Task 3: Fix 1 — `requestCashout` transaction + đảo thứ tự

**Files:**
- Modify: `be/src/wallet/wallet.service.ts` (toàn bộ `requestCashout`)
- Test: `be/src/wallet/wallet.service.spec.ts` (thêm describe `requestCashout`)

- [ ] **Step 1: Viết test mới cho requestCashout**

Thêm vào `wallet.service.spec.ts` (mở rộng mock `cashoutModel`/`transactionModel` để có `create`/`findOne`). Cập nhật khai báo mock đầu file:
```ts
  let cashoutModel: { findById: jest.Mock; findOne: jest.Mock; create: jest.Mock };
  let transactionModel: { findOneAndUpdate: jest.Mock; create: jest.Mock };
```
Trong `beforeEach` đổi khởi tạo:
```ts
    cashoutModel = {
      findById: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    transactionModel = {
      findOneAndUpdate: jest.fn(),
      create: jest.fn().mockResolvedValue([{}]),
    };
```
Thêm describe:
```ts
  describe('requestCashout', () => {
    const dto = { pointsToRedeem: 1000 } as any;
    const requesterId = userId.toHexString();

    it('debits via ledger before creating wallet transaction, all within a session', async () => {
      const session = makeSession();
      mockConnection.startSession.mockResolvedValue(session);
      ledgerService.getBalance.mockResolvedValue(5000);
      const createdDoc = { _id: cashoutId };
      cashoutModel.create.mockResolvedValue([createdDoc]);

      const result = await service.requestCashout(dto, requesterId);

      expect(cashoutModel.create).toHaveBeenCalledWith(
        [expect.objectContaining({ pointsRedeemed: 1000 })],
        { session },
      );
      expect(ledgerService.debit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: requesterId,
          points: 1000,
          sourceId: String(cashoutId),
          session,
        }),
      );
      expect(transactionModel.create).toHaveBeenCalledWith(
        [expect.objectContaining({ cashoutRequestId: cashoutId })],
        { session },
      );
      expect(result).toBe(createdDoc);
    });

    it('throws BadRequest when balance is insufficient (no doc, no debit)', async () => {
      ledgerService.getBalance.mockResolvedValue(100);

      await expect(service.requestCashout(dto, requesterId)).rejects.toThrow(
        BadRequestException,
      );
      expect(cashoutModel.create).not.toHaveBeenCalled();
      expect(ledgerService.debit).not.toHaveBeenCalled();
    });

    it('does not create wallet transaction if debit fails', async () => {
      const session = makeSession();
      mockConnection.startSession.mockResolvedValue(session);
      ledgerService.getBalance.mockResolvedValue(5000);
      cashoutModel.create.mockResolvedValue([{ _id: cashoutId }]);
      ledgerService.debit.mockRejectedValue(new Error('debit failed'));

      await expect(service.requestCashout(dto, requesterId)).rejects.toThrow(
        'debit failed',
      );
      expect(transactionModel.create).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Chạy test, xác nhận đỏ**

Run: `npm test -- wallet.service.spec`
Expected: FAIL — code cũ gọi `cashoutModel.create({...})` (object, không session) và `transactionModel.create({...})`.

- [ ] **Step 3: Viết lại requestCashout**

Thay thân `requestCashout`:

```ts
  async requestCashout(
    dto: CreateCashoutDto,
    userId: string,
  ): Promise<CashoutRequestDocument> {
    // Use ledger as source of truth for points balance
    const currentPoints = await this.ledgerService.getBalance(userId);
    if (currentPoints < dto.pointsToRedeem) {
      throw new BadRequestException(
        `Insufficient points. Available: ${currentPoints}, required: ${dto.pointsToRedeem}`,
      );
    }

    // Generate unique 6-digit uppercase alphanumeric redemption code
    let redemptionCode = '';
    let isUnique = false;
    while (!isUnique) {
      redemptionCode =
        'RWD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await this.cashoutModel.findOne({ redemptionCode });
      if (!existing) {
        isUnique = true;
      }
    }

    let request!: CashoutRequestDocument;
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const [created] = await this.cashoutModel.create(
          [
            {
              userId,
              requestedAmount: 0,
              redemptionCode,
              pointsRedeemed: dto.pointsToRedeem,
              status: CashoutStatus.PENDING,
            },
          ],
          { session },
        );
        request = created;

        // Debit points via ledger immediately (same session)
        await this.ledgerService.debit({
          userId,
          points: dto.pointsToRedeem,
          sourceType: LedgerSourceType.REDEMPTION,
          sourceId: String(created._id),
          note: `Yêu cầu quy đổi ${dto.pointsToRedeem} điểm thưởng (Mã: ${redemptionCode}). mang mã này ra quầy để nhận thưởng.`,
          session,
        });

        // Record pending wallet transaction (same session)
        await this.transactionModel.create(
          [
            {
              userId,
              type: TransactionType.REWARD_CASHOUT,
              amount: 0,
              points: dto.pointsToRedeem,
              description: `Cashout requested for ${dto.pointsToRedeem} reward points (Code: ${redemptionCode}). Bring this code to the counter to receive the reward.`,
              status: TransactionStatus.PENDING,
              cashoutRequestId: created._id,
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    return request;
  }
```

- [ ] **Step 4: Chạy test, xác nhận xanh**

Run: `npm test -- wallet.service.spec`
Expected: PASS toàn bộ.

- [ ] **Step 5: Build + lint**

Run: `npm run build && npm run lint`
Expected: build exit 0, lint 0 problem.

- [ ] **Step 6: Commit**

```bash
git add be/src/wallet/wallet.service.ts be/src/wallet/wallet.service.spec.ts
git commit -m "fix(wallet): make requestCashout atomic, debit before recording (C#1)"
```

---

## Task 4: Fix 4 — guard PUBLISHED trong `applyViolationsToResults`

**Files:**
- Modify: `be/src/race-results/race-results.service.ts:632`
- Test: `be/src/race-results/race-results.service.spec.ts`

- [ ] **Step 1: Thêm `exists` vào mock resultModel + viết test**

Trong `race-results.service.spec.ts` `beforeEach`, đổi khởi tạo `resultModel`:
```ts
    resultModel = {
      find: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      exists: jest.fn().mockResolvedValue(null),
    };
```
và cập nhật kiểu khai báo:
```ts
  let resultModel: {
    find: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    exists: jest.Mock;
  };
```
Thêm describe mới:
```ts
  describe('applyViolationsToResults', () => {
    it('throws when results are already PUBLISHED', async () => {
      resultModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(service.applyViolationsToResults(raceId)).rejects.toThrow(
        'Không thể áp dụng vi phạm cho kết quả đã công bố',
      );
      expect(resultModel.find).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Chạy test, xác nhận đỏ**

Run: `npm test -- race-results.service.spec`
Expected: FAIL — chưa có guard, `applyViolationsToResults` gọi `resultModel.find` và không throw.

- [ ] **Step 3: Thêm guard ở đầu hàm**

Trong `race-results.service.ts`, ngay đầu thân `applyViolationsToResults` (trước `const results = await this.resultModel.find(...)`):
```ts
    const publishedExists = await this.resultModel.exists({
      raceId: new Types.ObjectId(raceId),
      status: RaceResultStatus.PUBLISHED,
    });
    if (publishedExists) {
      throw new BadRequestException(
        'Không thể áp dụng vi phạm cho kết quả đã công bố',
      );
    }
```
(`BadRequestException` và `RaceResultStatus` đã được import trong file.)

- [ ] **Step 4: Chạy test, xác nhận xanh**

Run: `npm test -- race-results.service.spec`
Expected: PASS toàn bộ file (các test publishByRace cũ không gọi exists → vẫn xanh).

- [ ] **Step 5: Build + lint**

Run: `npm run build && npm run lint`
Expected: build exit 0, lint 0 problem.

- [ ] **Step 6: Commit**

```bash
git add be/src/race-results/race-results.service.ts be/src/race-results/race-results.service.spec.ts
git commit -m "fix(race-results): guard applyViolationsToResults against PUBLISHED results (C#4)"
```

---

## Task 5: Fix 5 — referee `create` kiểm `approvalStatus === APPROVED`

**Files:**
- Modify: `be/src/referee-assignments/referee-assignments.service.ts:55-63` (thêm block sau existsForUser)
- Test: `be/src/referee-assignments/referee-assignments.service.spec.ts` (**TẠO MỚI**)

- [ ] **Step 1: Tạo spec file với test đỏ**

Create `be/src/referee-assignments/referee-assignments.service.spec.ts`:
```ts
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RefereeAssignmentsService } from './referee-assignments.service';
import { RefereeAssignment } from './schemas/referee-assignment.schema';
import { Race } from '../races/schemas/race.schema';
import { UsersService } from '../users/users.service';
import { RoleName } from '../users/schemas/user.schema';
import { RefereeProfilesService } from '../referee-profiles/referee-profiles.service';
import { RacesService } from '../races/races.service';
import { RefereeApprovalStatus } from '../referee-profiles/schemas/referee-profile.schema';

describe('RefereeAssignmentsService', () => {
  let service: RefereeAssignmentsService;
  let usersService: { findById: jest.Mock };
  let refereeProfilesService: {
    existsForUser: jest.Mock;
    findByUserId: jest.Mock;
  };
  let assignmentModel: { create: jest.Mock };

  const refereeUserId = new Types.ObjectId().toHexString();
  const assignedBy = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    usersService = { findById: jest.fn() };
    refereeProfilesService = {
      existsForUser: jest.fn(),
      findByUserId: jest.fn(),
    };
    assignmentModel = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefereeAssignmentsService,
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: assignmentModel,
        },
        { provide: getModelToken(Race.name), useValue: { findOne: jest.fn() } },
        { provide: UsersService, useValue: usersService },
        { provide: RefereeProfilesService, useValue: refereeProfilesService },
        { provide: RacesService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get(RefereeAssignmentsService);
  });

  it('rejects assignment when referee profile is not APPROVED', async () => {
    usersService.findById.mockResolvedValue({ roles: [RoleName.REFEREE] });
    refereeProfilesService.existsForUser.mockResolvedValue(true);
    refereeProfilesService.findByUserId.mockResolvedValue({
      approvalStatus: RefereeApprovalStatus.PENDING,
    });

    await expect(
      service.create({ refereeUserId, raceId: 'r1' } as any, assignedBy),
    ).rejects.toThrow(BadRequestException);
    expect(assignmentModel.create).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ**

Run: `npm test -- referee-assignments.service.spec`
Expected: FAIL — code chưa kiểm approvalStatus; sau existsForUser sẽ đi tiếp gọi `racesService.findOne` (trả undefined) thay vì throw BadRequest.

- [ ] **Step 3: Thêm block kiểm APPROVED**

Trong `referee-assignments.service.ts`, ngay sau block existsForUser (`:59-63`), thêm:
```ts
    // 2b. Validate referee profile is APPROVED
    const profile = await this.refereeProfilesService.findByUserId(
      dto.refereeUserId,
    );
    if (profile.approvalStatus !== RefereeApprovalStatus.APPROVED) {
      throw new BadRequestException(
        'Referee profile must be APPROVED before assignment',
      );
    }
```
(`RefereeApprovalStatus` đã được import ở `:26`; `BadRequestException` đã import.)

- [ ] **Step 4: Chạy test, xác nhận xanh**

Run: `npm test -- referee-assignments.service.spec`
Expected: PASS.

- [ ] **Step 5: Build + lint**

Run: `npm run build && npm run lint`
Expected: build exit 0, lint 0 problem.

- [ ] **Step 6: Commit**

```bash
git add be/src/referee-assignments/referee-assignments.service.ts be/src/referee-assignments/referee-assignments.service.spec.ts
git commit -m "fix(referee-assignments): require APPROVED profile before assignment (C#5)"
```

---

## Task 6: Fix 6 — `@Roles(ADMIN)` cho `GET /referee-assignments/race/:raceId`

**Files:**
- Modify: `be/src/referee-assignments/referee-assignments.controller.ts:49-56`

> Không viết unit test: đây là metadata decorator (role enforcement ở tầng guard/integration). Verify bằng build + lint + inspection. Residual risk: enforcement thực tế chỉ kiểm ở runtime qua `RolesGuard` — đã dùng đồng nhất ở các endpoint khác cùng controller.

- [ ] **Step 1: Thêm guard + roles cho findByRace**

Trong `referee-assignments.controller.ts`, đổi block `@Get('race/:raceId')` (`:49-56`):
```ts
  @Get('race/:raceId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List assignments for a race (Admin)' })
  findByRace(
    @Param('raceId') raceId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findByRace(raceId, pagination.page, pagination.limit);
  }
```
(`RolesGuard`, `Roles`, `RoleName` đã được import sẵn trong controller.)

- [ ] **Step 2: Build + lint**

Run: `npm run build && npm run lint`
Expected: build exit 0, lint 0 problem.

- [ ] **Step 3: Chạy toàn bộ suite lần cuối**

Run: `npm test`
Expected: tất cả PASS.

- [ ] **Step 4: Commit**

```bash
git add be/src/referee-assignments/referee-assignments.controller.ts
git commit -m "fix(referee-assignments): restrict findByRace to ADMIN (C#6)"
```

---

## Definition of Done

- [ ] 6 commit (C#1..C#6), không `Co-Authored-By`.
- [ ] `npm run build` exit 0.
- [ ] `npm run lint` 0 problem.
- [ ] `npm test` toàn bộ xanh (gồm `wallet.service.spec.ts` rejectedBy + test mới).
- [ ] Caller cũ không truyền session không đổi hành vi.
