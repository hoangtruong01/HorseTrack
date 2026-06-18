# Group D BE State-Machine Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vá 3 bug state-machine P1 nhóm D: credit RACE_WIN_REWARD khi publish kết quả race, cascadeCancel tôn trọng terminal states và chuyển APPROVED→WITHDRAWN, RaceCheck.updateStatus reject transition không hợp lệ.

**Architecture:** 3 task độc lập, TDD bottom-up (test đỏ → implement → xanh → commit). D#3 chỉ chạm race-checks module, D#2 chỉ chạm tournaments module, D#1 thêm ledger injection vào race-results module.

**Tech Stack:** NestJS, Mongoose (MongoDB Atlas), Jest. Tất cả lệnh chạy từ `be/`. Commit không có `Co-Authored-By`.

**Spec:** `docs/superpowers/specs/2026-06-17-be-group-d-state-machine-design.md`

---

### Task 1: D#3 — RaceCheck.updateStatus state guard

**Files:**
- Modify: `be/src/race-checks/schemas/race-check.schema.ts`
- Modify: `be/src/race-checks/race-checks.service.ts`
- Create: `be/src/race-checks/race-checks.service.spec.ts`

**Context:** `updateStatus` (line 127 của service) hiện gán `check.status = dto.status` trực tiếp, không validate transition. Ta thêm constant `RACE_CHECK_STATUS_FLOW` vào schema rồi guard vào service — cùng pattern với `RACE_STATUS_FLOW` trong races.

- [ ] **Step 1: Tạo spec với test đỏ**

Tạo `be/src/race-checks/race-checks.service.spec.ts`:

```ts
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RaceChecksService } from './race-checks.service';
import { RaceCheck, RaceCheckStatus } from './schemas/race-check.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RefereeAssignment } from '../referee-assignments/schemas/referee-assignment.schema';
import { RacesService } from '../races/races.service';
import { UpdateRaceCheckDto } from './dto/update-race-check.dto';

describe('RaceChecksService', () => {
  let service: RaceChecksService;
  let checkModel: { findById: jest.Mock };

  // refereeId phải là hex string để String(new Types.ObjectId(refereeId)) === refereeId
  const refereeId = new Types.ObjectId().toHexString();

  function makeCheck(status: RaceCheckStatus) {
    return {
      _id: new Types.ObjectId(),
      checkedBy: new Types.ObjectId(refereeId),
      status,
      save: jest.fn().mockResolvedValue(undefined),
    };
  }

  beforeEach(async () => {
    checkModel = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaceChecksService,
        { provide: getModelToken(RaceCheck.name), useValue: checkModel },
        {
          provide: getModelToken(Registration.name),
          useValue: { countDocuments: jest.fn() },
        },
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: { findOne: jest.fn() },
        },
        { provide: RacesService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get(RaceChecksService);
  });

  describe('updateStatus', () => {
    it('rejects PASSED → PENDING (terminal state cannot transition)', async () => {
      const check = makeCheck(RaceCheckStatus.PASSED);
      checkModel.findById.mockResolvedValue(check);

      await expect(
        service.updateStatus(
          new Types.ObjectId().toHexString(),
          { status: RaceCheckStatus.PENDING } as UpdateRaceCheckDto,
          refereeId,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(check.save).not.toHaveBeenCalled();
    });

    it('rejects FAILED → PASSED (must retry via PENDING first)', async () => {
      const check = makeCheck(RaceCheckStatus.FAILED);
      checkModel.findById.mockResolvedValue(check);

      await expect(
        service.updateStatus(
          new Types.ObjectId().toHexString(),
          { status: RaceCheckStatus.PASSED } as UpdateRaceCheckDto,
          refereeId,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(check.save).not.toHaveBeenCalled();
    });

    it('allows PENDING → PASSED', async () => {
      const check = makeCheck(RaceCheckStatus.PENDING);
      checkModel.findById.mockResolvedValue(check);

      await service.updateStatus(
        new Types.ObjectId().toHexString(),
        { status: RaceCheckStatus.PASSED } as UpdateRaceCheckDto,
        refereeId,
      );

      expect(check.save).toHaveBeenCalled();
    });

    it('allows FAILED → PENDING (retry)', async () => {
      const check = makeCheck(RaceCheckStatus.FAILED);
      checkModel.findById.mockResolvedValue(check);

      await service.updateStatus(
        new Types.ObjectId().toHexString(),
        { status: RaceCheckStatus.PENDING } as UpdateRaceCheckDto,
        refereeId,
      );

      expect(check.save).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận đỏ**

```bash
cd be && npx jest race-checks.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: 2 test "rejects" FAIL (chưa throw), 2 test "allows" PASS.

- [ ] **Step 3: Thêm `RACE_CHECK_STATUS_FLOW` vào schema**

Trong `be/src/race-checks/schemas/race-check.schema.ts`, sau block enum `RaceCheckStatus` (sau dòng `FAILED = 'failed',`) và trước `@Schema(...)`, thêm:

```ts
export const RACE_CHECK_STATUS_FLOW: Record<RaceCheckStatus, RaceCheckStatus[]> = {
  [RaceCheckStatus.PENDING]: [RaceCheckStatus.PASSED, RaceCheckStatus.FAILED],
  [RaceCheckStatus.PASSED]: [],
  [RaceCheckStatus.FAILED]: [RaceCheckStatus.PENDING],
};
```

- [ ] **Step 4: Thêm guard vào `updateStatus`**

Trong `be/src/race-checks/race-checks.service.ts`:

**4a.** Sửa import từ schema — thêm `RACE_CHECK_STATUS_FLOW` vào named imports:

```ts
import {
  RaceCheck,
  RaceCheckDocument,
  RaceCheckStatus,
  RACE_CHECK_STATUS_FLOW,
} from './schemas/race-check.schema';
```

**4b.** Trong `updateStatus`, sau block `if (String(check.checkedBy) !== checkedBy)` và TRƯỚC dòng `check.status = dto.status;`, thêm:

```ts
    const allowed = RACE_CHECK_STATUS_FLOW[check.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${check.status} → ${dto.status}`,
      );
    }
```

Sau khi edit, đoạn `updateStatus` trông như sau (từ `if (!check)` đến `check.status = dto.status`):

```ts
    const check = await this.checkModel.findById(id);
    if (!check) throw new NotFoundException('Race check not found');

    if (String(check.checkedBy) !== checkedBy) {
      throw new ForbiddenException('You can only update checks you submitted');
    }

    const allowed = RACE_CHECK_STATUS_FLOW[check.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${check.status} → ${dto.status}`,
      );
    }

    check.status = dto.status;
```

- [ ] **Step 5: Chạy test để xác nhận xanh**

```bash
cd be && npx jest race-checks.service.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: 4 PASS, 0 FAIL.

- [ ] **Step 6: Chạy lint**

```bash
cd be && npm run lint -- --max-warnings=0 2>&1 | tail -5
```

Expected: 0 problems.

- [ ] **Step 7: Commit**

```bash
git add be/src/race-checks/schemas/race-check.schema.ts \
        be/src/race-checks/race-checks.service.ts \
        be/src/race-checks/race-checks.service.spec.ts
git commit -m "fix(race-checks): reject invalid status transitions via RACE_CHECK_STATUS_FLOW (D#3)"
```

---

### Task 2: D#2 — cascadeCancel tôn trọng terminal race states

**Files:**
- Modify: `be/src/tournaments/tournaments.service.ts`
- Create: `be/src/tournaments/tournaments.service.spec.ts`

**Context:** `cascadeCancel` trong `tournaments.service.ts` có 2 bugs:
1. Race updateMany dùng `TERMINAL_RACE_STATUSES` (bao gồm LIVE, FINISHED) — thiếu nhất quán với spec; ta đổi về `[RESULT_PUBLISHED, CANCELLED]`.
2. Registration updateMany dùng `tournamentId` và ép tất cả về CANCELLED kể cả APPROVED — ta tách thành 2 `updateMany` riêng dùng `raceId: { $in: raceIds }`.

`TERMINAL_RACE_STATUSES` const sẽ trở thành unused sau khi fix → xóa luôn.

- [ ] **Step 1: Tạo spec với test đỏ**

Tạo `be/src/tournaments/tournaments.service.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TournamentsService } from './tournaments.service';
import { Tournament } from './schemas/tournament.schema';
import { Race, RaceStatus } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  Prediction,
  PredictionStatus,
} from '../predictions/schemas/prediction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let raceModel: { find: jest.Mock; updateMany: jest.Mock };
  let registrationModel: { updateMany: jest.Mock; distinct: jest.Mock };
  let predictionModel: { find: jest.Mock; updateMany: jest.Mock };
  let notificationsService: { send: jest.Mock };
  let auditLogsService: { log: jest.Mock };
  let ledgerService: { credit: jest.Mock };

  const tournamentId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    raceModel = {
      find: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    registrationModel = {
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      distinct: jest.fn().mockResolvedValue([]),
    };
    predictionModel = {
      find: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    notificationsService = { send: jest.fn().mockResolvedValue(undefined) };
    auditLogsService = { log: jest.fn().mockResolvedValue(undefined) };
    ledgerService = { credit: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        {
          provide: getModelToken(Tournament.name),
          useValue: {
            findById: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
            }),
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        { provide: getModelToken(Race.name), useValue: raceModel },
        {
          provide: getModelToken(Registration.name),
          useValue: registrationModel,
        },
        { provide: getModelToken(Prediction.name), useValue: predictionModel },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: RewardPointLedgerService, useValue: ledgerService },
      ],
    }).compile();

    service = module.get(TournamentsService);
  });

  describe('cascadeCancel', () => {
    it('does NOT cancel RESULT_PUBLISHED or CANCELLED races', async () => {
      raceModel.find.mockResolvedValue([]);

      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(raceModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
        }),
        expect.anything(),
      );
    });

    it('transitions PENDING registrations to CANCELLED', async () => {
      const raceOid = new Types.ObjectId();
      raceModel.find.mockResolvedValue([{ _id: raceOid }]);

      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).toHaveBeenCalledWith(
        { raceId: { $in: [raceOid] }, status: RegistrationStatus.PENDING },
        { $set: { status: RegistrationStatus.CANCELLED } },
      );
    });

    it('transitions APPROVED registrations to WITHDRAWN (not CANCELLED)', async () => {
      const raceOid = new Types.ObjectId();
      raceModel.find.mockResolvedValue([{ _id: raceOid }]);

      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).toHaveBeenCalledWith(
        { raceId: { $in: [raceOid] }, status: RegistrationStatus.APPROVED },
        { $set: { status: RegistrationStatus.WITHDRAWN } },
      );
    });

    it('does NOT call registrationModel.updateMany when no cancellable races', async () => {
      raceModel.find.mockResolvedValue([]); // no cancellable races

      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận đỏ**

```bash
cd be && npx jest tournaments.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: test "does NOT cancel RESULT_PUBLISHED" FAIL (hiện dùng TERMINAL_RACE_STATUSES), "APPROVED → WITHDRAWN" FAIL (hiện set CANCELLED), test "PENDING → CANCELLED" PASS hoặc FAIL tùy filter.

- [ ] **Step 3: Xóa `TERMINAL_RACE_STATUSES` constant**

Trong `be/src/tournaments/tournaments.service.ts`, xóa hoàn toàn constant sau import block (lines 33–38):

```ts
const TERMINAL_RACE_STATUSES = [
  RaceStatus.LIVE,
  RaceStatus.FINISHED,
  RaceStatus.RESULT_PUBLISHED,
  RaceStatus.CANCELLED,
];
```

- [ ] **Step 4: Sửa races fetch filter trong `cascadeCancel`**

Trong `cascadeCancel`, đổi query `raceModel.find`:

Từ:
```ts
    const races = await this.raceModel.find({
      tournamentId,
      status: { $nin: TERMINAL_RACE_STATUSES },
    });
```

Thành:
```ts
    const races = await this.raceModel.find({
      tournamentId,
      status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
    });
```

- [ ] **Step 5: Sửa `Promise.all` block — race updateMany và loại registration updateMany**

Trong `cascadeCancel`, đổi toàn bộ `Promise.all([...])` (bao gồm cả 3 entries: raceModel.updateMany, registrationModel.updateMany, predictionModel.updateMany):

Từ:
```ts
    await Promise.all([
      // Cancel non-terminal races
      this.raceModel.updateMany(
        { tournamentId, status: { $nin: TERMINAL_RACE_STATUSES } },
        { $set: { status: RaceStatus.CANCELLED } },
      ),
      // Cancel all non-cancelled registrations
      this.registrationModel.updateMany(
        { tournamentId, status: { $ne: RegistrationStatus.CANCELLED } },
        { $set: { status: RegistrationStatus.CANCELLED } },
      ),
      // Cancel pending predictions for all races in tournament
      raceIds.length > 0
        ? this.predictionModel.updateMany(
            { raceId: { $in: raceIds }, status: PredictionStatus.PENDING },
            { $set: { status: PredictionStatus.CANCELLED } },
          )
        : Promise.resolve(),
    ]);
```

Thành:
```ts
    await Promise.all([
      // Cancel non-terminal races (skip RESULT_PUBLISHED and already CANCELLED)
      this.raceModel.updateMany(
        {
          tournamentId,
          status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
        },
        { $set: { status: RaceStatus.CANCELLED } },
      ),
      // Cancel pending predictions for cancelled races
      raceIds.length > 0
        ? this.predictionModel.updateMany(
            { raceId: { $in: raceIds }, status: PredictionStatus.PENDING },
            { $set: { status: PredictionStatus.CANCELLED } },
          )
        : Promise.resolve(),
    ]);

    // PENDING registrations → CANCELLED; APPROVED registrations → WITHDRAWN
    if (raceIds.length > 0) {
      await this.registrationModel.updateMany(
        { raceId: { $in: raceIds }, status: RegistrationStatus.PENDING },
        { $set: { status: RegistrationStatus.CANCELLED } },
      );
      await this.registrationModel.updateMany(
        { raceId: { $in: raceIds }, status: RegistrationStatus.APPROVED },
        { $set: { status: RegistrationStatus.WITHDRAWN } },
      );
    }
```

- [ ] **Step 6: Chạy test để xác nhận xanh**

```bash
cd be && npx jest tournaments.service.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: 4 PASS, 0 FAIL.

- [ ] **Step 7: Chạy build để kiểm tra compile**

```bash
cd be && npm run build 2>&1 | tail -10
```

Expected: exit 0, không có TS error.

- [ ] **Step 8: Chạy lint**

```bash
cd be && npm run lint -- --max-warnings=0 2>&1 | tail -5
```

Expected: 0 problems.

- [ ] **Step 9: Commit**

```bash
git add be/src/tournaments/tournaments.service.ts \
        be/src/tournaments/tournaments.service.spec.ts
git commit -m "fix(tournaments): cascadeCancel skips RESULT_PUBLISHED races, APPROVED→WITHDRAWN (D#2)"
```

---

### Task 3: D#1 — Credit RACE_WIN_REWARD trong publishByRace

**Files:**
- Modify: `be/src/race-results/race-results.service.ts`
- Modify: `be/src/race-results/race-results.module.ts`
- Modify: `be/src/race-results/race-results.service.spec.ts`

**Context:** `publishByRace` chạy trong `session.withTransaction`. Sau `payoutBetsForRace`, ta thêm vòng lặp credit `RACE_WIN_REWARD` cho mỗi result `outcome === FINISHED && points > 0`. Guard idempotency bằng `ledgerService.exists(...)` trước khi credit.

`RaceResultsService` hiện KHÔNG inject `RewardPointLedgerService` → cần thêm vào constructor và `race-results.module.ts`.

- [ ] **Step 1: Cập nhật spec — thêm `ledgerService` mock vào beforeEach**

Trong `be/src/race-results/race-results.service.spec.ts`:

**1a.** Thêm imports (sau các import hiện có):

```ts
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';
```

**1b.** Thêm khai báo biến `ledgerService` vào block `let` declarations (cùng nhóm với `auditLogsService`, `notificationsService`):

```ts
  let ledgerService: { credit: jest.Mock; exists: jest.Mock };
```

**1c.** Trong `beforeEach`, thêm khởi tạo mock (ngay sau `notificationsService = ...`):

```ts
    ledgerService = {
      credit: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
    };
```

**1d.** Trong `Test.createTestingModule`, thêm provider (ngay sau `{ provide: NotificationsService, ... }`):

```ts
        { provide: RewardPointLedgerService, useValue: ledgerService },
```

- [ ] **Step 2: Thêm test đỏ cho credit behavior**

Trong `be/src/race-results/race-results.service.spec.ts`, thêm `describe` block mới **bên trong** `describe('publishByRace')` (sau test "retry-safety"):

```ts
    describe('RACE_WIN_REWARD credit', () => {
      const resultId1 = new Types.ObjectId();
      const owner1 = new Types.ObjectId();
      const resultId2 = new Types.ObjectId();
      const owner2 = new Types.ObjectId();

      const finishedResults = [
        {
          _id: resultId1,
          raceId: new Types.ObjectId(),
          ownerId: owner1,
          rank: 1,
          points: 10,
          outcome: RaceResultOutcome.FINISHED,
          status: RaceResultStatus.CONFIRMED,
        },
        {
          _id: resultId2,
          raceId: new Types.ObjectId(),
          ownerId: owner2,
          rank: 2,
          points: 7,
          outcome: RaceResultOutcome.FINISHED,
          status: RaceResultStatus.CONFIRMED,
        },
      ];

      it('credits ledger for each FINISHED result with points > 0', async () => {
        const session = makeSession();
        mockConnection.startSession.mockResolvedValue(session);
        racesService.findOne.mockResolvedValue({
          status: RaceStatus.FINISHED,
          prize: 1000,
          name: 'Race',
        });
        resultModel.find.mockResolvedValue(finishedResults);
        ledgerService.exists.mockResolvedValue(false);

        await service.publishByRace(raceId, publisherId);

        expect(ledgerService.credit).toHaveBeenCalledTimes(2);
        expect(ledgerService.credit).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: String(owner1),
            points: 10,
            sourceType: LedgerSourceType.RACE_WIN_REWARD,
            sourceId: String(resultId1),
            session,
          }),
        );
      });

      it('skips credit when already credited (idempotency)', async () => {
        const session = makeSession();
        mockConnection.startSession.mockResolvedValue(session);
        racesService.findOne.mockResolvedValue({
          status: RaceStatus.FINISHED,
          prize: 1000,
          name: 'Race',
        });
        resultModel.find.mockResolvedValue(finishedResults);
        ledgerService.exists.mockResolvedValue(true);

        await service.publishByRace(raceId, publisherId);

        expect(ledgerService.credit).not.toHaveBeenCalled();
      });

      it('does not credit DID_NOT_FINISH results', async () => {
        const dnfResult = {
          _id: new Types.ObjectId(),
          raceId: new Types.ObjectId(),
          ownerId: new Types.ObjectId(),
          rank: undefined,
          points: 0,
          outcome: RaceResultOutcome.DID_NOT_FINISH,
          status: RaceResultStatus.CONFIRMED,
        };
        const session = makeSession();
        mockConnection.startSession.mockResolvedValue(session);
        racesService.findOne.mockResolvedValue({
          status: RaceStatus.FINISHED,
          prize: 1000,
          name: 'Race',
        });
        resultModel.find.mockResolvedValue([dnfResult]);
        ledgerService.exists.mockResolvedValue(false);

        await service.publishByRace(raceId, publisherId);

        expect(ledgerService.credit).not.toHaveBeenCalled();
      });
    });
```

- [ ] **Step 3: Chạy test để xác nhận đỏ**

```bash
cd be && npx jest race-results.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: compile error vì `RaceResultsService` chưa inject `RewardPointLedgerService` (provider không match constructor). Hoặc test "credits ledger" FAIL.

- [ ] **Step 4: Thêm imports và inject `ledgerService` vào `RaceResultsService`**

Trong `be/src/race-results/race-results.service.ts`:

**4a.** Thêm imports (sau các imports hiện có, ví dụ sau `import { RoleName } từ ...`):

```ts
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';
```

**4b.** Trong constructor, thêm `ledgerService` ở cuối (sau `@InjectConnection() private connection: Connection`):

```ts
    private ledgerService: RewardPointLedgerService,
```

Constructor sau khi sửa:

```ts
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    @InjectModel(Jockey.name)
    private jockeyModel: Model<Jockey>,
    @InjectModel(RaceViolation.name)
    private violationModel: Model<RaceViolationDocument>,
    private racesService: RacesService,
    private prizesService: PrizesService,
    private predictionsService: PredictionsService,
    private auditLogsService: AuditLogsService,
    private notificationsService: NotificationsService,
    @InjectConnection() private connection: Connection,
    private ledgerService: RewardPointLedgerService,
  ) {}
```

- [ ] **Step 5: Thêm `RewardPointLedgerModule` vào `race-results.module.ts`**

Trong `be/src/race-results/race-results.module.ts`:

**5a.** Thêm import:

```ts
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';
```

**5b.** Thêm `RewardPointLedgerModule` vào mảng `imports` (sau `NotificationsModule`):

```ts
    NotificationsModule,
    RewardPointLedgerModule,
```

- [ ] **Step 6: Thêm credit loop vào `publishByRace`**

Trong `be/src/race-results/race-results.service.ts`, trong `publishByRace`, sau `payoutBetsForRace` và TRƯỚC dấu `});` kết thúc callback `withTransaction`, thêm:

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

Vị trí chính xác trong `withTransaction`:

```ts
      await session.withTransaction(async () => {
        notifyIntents = [];

        await Promise.all(results.map(...));                        // step 1

        await this.racesService.setStatus(...);                    // step 2

        await this.prizesService.createPrizesForRace(raceId, session);  // step 3

        notifyIntents = await this.predictionsService.payoutBetsForRace(raceId, session);  // step 4

        // [NEW] step 5 — credit rank points
        for (const result of results) {
          if (result.outcome === RaceResultOutcome.FINISHED && result.points > 0) {
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
      });  // <-- đây là dấu đóng của withTransaction callback
```

- [ ] **Step 7: Chạy test để xác nhận xanh**

```bash
cd be && npx jest race-results.service.spec.ts --no-coverage 2>&1 | tail -15
```

Expected: tất cả test (bao gồm test cũ và 3 test mới) PASS.

- [ ] **Step 8: Chạy build và lint**

```bash
cd be && npm run build 2>&1 | tail -10 && npm run lint -- --max-warnings=0 2>&1 | tail -5
```

Expected: build exit 0, lint 0 problems.

- [ ] **Step 9: Commit**

```bash
git add be/src/race-results/race-results.service.ts \
        be/src/race-results/race-results.module.ts \
        be/src/race-results/race-results.service.spec.ts
git commit -m "feat(race-results): credit RACE_WIN_REWARD in publishByRace transaction (D#1)"
```

---

## Tiêu chí thành công

- [ ] `npm run build` exit 0.
- [ ] `npm run lint` 0 problems.
- [ ] `npx jest --no-coverage` toàn bộ xanh.
- [ ] D#3: PASSED→PENDING ném `BadRequestException`; FAILED→PENDING được phép.
- [ ] D#2: `raceModel.updateMany` được gọi với `$nin: [RESULT_PUBLISHED, CANCELLED]`; `registrationModel.updateMany` APPROVED→WITHDRAWN.
- [ ] D#1: `ledgerService.credit` được gọi với đúng `userId`, `points`, `session` bên trong transaction; bị skip nếu `exists` trả về `true`.
