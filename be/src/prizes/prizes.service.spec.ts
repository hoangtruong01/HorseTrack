/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { Prize, PrizePaymentStatus } from './schemas/prize.schema';
import {
  RaceResult,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { Race } from '../races/schemas/race.schema';
import { Horse } from '../horses/schemas/horse.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RefereeAssignment } from '../referee-assignments/schemas/referee-assignment.schema';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Types } from 'mongoose';

/** Helper: tạo mock query object hỗ trợ .session() chainable */
function makeQuery<T>(value: T) {
  const sessionFn = jest.fn().mockResolvedValue(value);
  return { session: sessionFn };
}

describe('PrizesService', () => {
  let service: PrizesService;
  let ledgerService: RewardPointLedgerService;

  const mockPrizeModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockResultModel = {
    findOne: jest.fn(),
  };

  const mockRaceModel = {
    findById: jest.fn(),
  };

  const mockHorseModel = {
    findById: jest.fn(),
  };

  const mockRegistrationModel = {
    findOne: jest.fn(),
  };

  const mockAssignmentModel = {
    find: jest.fn(),
  };

  const mockLedgerService = {
    credit: jest.fn(),
    exists: jest.fn(),
  };

  const mockNotificationsService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrizesService,
        {
          provide: getModelToken(Prize.name),
          useValue: mockPrizeModel,
        },
        {
          provide: getModelToken(RaceResult.name),
          useValue: mockResultModel,
        },
        {
          provide: getModelToken(Race.name),
          useValue: mockRaceModel,
        },
        {
          provide: getModelToken(Horse.name),
          useValue: mockHorseModel,
        },
        {
          provide: getModelToken(Registration.name),
          useValue: mockRegistrationModel,
        },
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: mockAssignmentModel,
        },
        {
          provide: RewardPointLedgerService,
          useValue: mockLedgerService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<PrizesService>(PrizesService);
    ledgerService = module.get<RewardPointLedgerService>(
      RewardPointLedgerService,
    );

    jest.clearAllMocks();
    mockAssignmentModel.find.mockReturnValue(makeQuery([]));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPrizesForRace', () => {
    const raceId = new Types.ObjectId().toString();
    const tournamentId = new Types.ObjectId();
    const horseId = new Types.ObjectId();
    const ownerId = new Types.ObjectId();
    const jockeyUserId = new Types.ObjectId();

    it('should throw NotFoundException if race is not found', async () => {
      mockRaceModel.findById.mockReturnValue(makeQuery(null));

      await expect(service.createPrizesForRace(raceId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return [] if race prize is 0', async () => {
      mockRaceModel.findById.mockReturnValue(
        makeQuery({ _id: raceId, prize: 0 }),
      );

      const result = await service.createPrizesForRace(raceId);
      expect(result).toEqual([]);
      expect(mockResultModel.findOne).not.toHaveBeenCalled();
    });

    it('should split prize points 70/30 and credit both owner and jockey', async () => {
      const prizeAmount = 1000;
      const expectedOwnerPoints = 700;
      const expectedJockeyPoints = 300;

      mockRaceModel.findById.mockReturnValue(
        makeQuery({
          _id: raceId,
          tournamentId,
          prize: prizeAmount,
          name: 'Super Race',
        }),
      );

      mockResultModel.findOne.mockReturnValue(
        makeQuery({
          raceId,
          horseId,
          jockeyUserId,
          rank: 1,
          status: RaceResultStatus.PUBLISHED,
        }),
      );

      mockHorseModel.findById.mockReturnValue(
        makeQuery({
          _id: horseId,
          ownerId,
          name: 'Lightning Bolt',
        }),
      );

      mockRegistrationModel.findOne.mockReturnValue(makeQuery(null));

      // No existing prizes
      mockPrizeModel.findOne.mockReturnValue(makeQuery(null));

      // Mock Prize creation — dạng mảng vì service dùng create([{...}], { session })
      const mockOwnerPrizeDoc = { ownerId, amount: expectedOwnerPoints };
      const mockJockeyPrizeDoc = {
        ownerId: jockeyUserId,
        amount: expectedJockeyPoints,
      };
      mockPrizeModel.create
        .mockResolvedValueOnce([mockOwnerPrizeDoc])
        .mockResolvedValueOnce([mockJockeyPrizeDoc]);

      const result = await service.createPrizesForRace(raceId);

      // Verify split math and ledger credits
      expect(ledgerService.credit).toHaveBeenCalledTimes(2);

      // Check Owner credit call
      expect(ledgerService.credit).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          userId: String(ownerId),
          points: expectedOwnerPoints,
          sourceType: LedgerSourceType.RACE_WIN_REWARD,
          sourceId: raceId,
          note: `Received 70% winner reward for race "Super Race" (Horse: Lightning Bolt)`,
        }),
      );

      // Check Jockey credit call
      expect(ledgerService.credit).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId: String(jockeyUserId),
          points: expectedJockeyPoints,
          sourceType: LedgerSourceType.RACE_WIN_REWARD,
          sourceId: raceId,
          note: `Received 30% winner reward for race "Super Race" (Jockey share)`,
        }),
      );

      // Check Prize collection records created — dạng mảng + options
      expect(mockPrizeModel.create).toHaveBeenCalledTimes(2);
      expect(mockPrizeModel.create).toHaveBeenNthCalledWith(
        1,
        [
          {
            tournamentId,
            raceId: expect.any(Types.ObjectId),
            horseId,
            ownerId,
            rank: 1,
            amount: expectedOwnerPoints,
            status: PrizePaymentStatus.PAID,
            paidAt: expect.any(Date),
          },
        ],
        expect.anything(),
      );

      expect(mockPrizeModel.create).toHaveBeenNthCalledWith(
        2,
        [
          {
            tournamentId,
            raceId: expect.any(Types.ObjectId),
            horseId,
            ownerId: jockeyUserId,
            rank: 1,
            amount: expectedJockeyPoints,
            status: PrizePaymentStatus.PAID,
            paidAt: expect.any(Date),
          },
        ],
        expect.anything(),
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockOwnerPrizeDoc);
      expect(result[1]).toEqual(mockJockeyPrizeDoc);
    });

    it('should handle uneven numbers and ensure sum is exact without losing fractional values', async () => {
      const prizeAmount = 15; // 70% = 10.5 -> 11, 30% = 4.5 -> 4
      const expectedOwnerPoints = 11;
      const expectedJockeyPoints = 4;

      mockRaceModel.findById.mockReturnValue(
        makeQuery({
          _id: raceId,
          tournamentId,
          prize: prizeAmount,
          name: 'Super Race',
        }),
      );

      mockResultModel.findOne.mockReturnValue(
        makeQuery({
          raceId,
          horseId,
          jockeyUserId,
          rank: 1,
          status: RaceResultStatus.PUBLISHED,
        }),
      );

      mockHorseModel.findById.mockReturnValue(
        makeQuery({
          _id: horseId,
          ownerId,
          name: 'Lightning Bolt',
        }),
      );

      mockRegistrationModel.findOne.mockReturnValue(makeQuery(null));
      mockPrizeModel.findOne.mockReturnValue(makeQuery(null));
      mockPrizeModel.create
        .mockResolvedValueOnce([{ ownerId, amount: expectedOwnerPoints }])
        .mockResolvedValueOnce([
          { ownerId: jockeyUserId, amount: expectedJockeyPoints },
        ]);

      await service.createPrizesForRace(raceId);

      // Verify exact sum holds
      expect(expectedOwnerPoints + expectedJockeyPoints).toBe(prizeAmount);

      expect(ledgerService.credit).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          userId: String(ownerId),
          points: expectedOwnerPoints,
          sourceType: LedgerSourceType.RACE_WIN_REWARD,
          sourceId: raceId,
          note: expect.any(String),
        }),
      );

      expect(ledgerService.credit).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId: String(jockeyUserId),
          points: expectedJockeyPoints,
          sourceType: LedgerSourceType.RACE_WIN_REWARD,
          sourceId: raceId,
          note: expect.any(String),
        }),
      );
    });

    it('does not re-credit the owner when a RACE_WIN_REWARD ledger entry already exists (republish safety)', async () => {
      const prizeAmount = 1000;

      mockRaceModel.findById.mockReturnValue(
        makeQuery({
          _id: raceId,
          tournamentId,
          prize: prizeAmount,
          name: 'Super Race',
        }),
      );

      mockResultModel.findOne.mockReturnValue(
        makeQuery({
          raceId,
          horseId,
          jockeyUserId: null,
          rank: 1,
          status: RaceResultStatus.PUBLISHED,
        }),
      );

      mockHorseModel.findById.mockReturnValue(
        makeQuery({
          _id: horseId,
          ownerId,
          name: 'Lightning Bolt',
        }),
      );

      // No registration -> default 30% jockey share, but jockeyUserId is null so jockey branch skipped
      mockRegistrationModel.findOne.mockReturnValue(makeQuery(null));

      // No existing Prize doc — simulates crash-before-Prize scenario
      mockPrizeModel.findOne.mockReturnValue(makeQuery(null));

      // Ledger entry already exists for owner (credit already happened before crash)
      mockLedgerService.exists.mockResolvedValue(true);

      // create vẫn có thể được gọi (Prize doc chưa tồn tại), phải trả về mảng
      mockPrizeModel.create.mockResolvedValue([{ ownerId, amount: 1000 }]);

      await service.createPrizesForRace(raceId);

      expect(ledgerService.credit).not.toHaveBeenCalled();
    });

    it('createPrizesForRace: truyền session xuống resultModel.findOne và ledger.credit', async () => {
      const session = {} as unknown as import('mongoose').ClientSession;
      const prizeAmount = 1000;

      const raceQuerySpy = makeQuery({
        _id: raceId,
        tournamentId,
        prize: prizeAmount,
        name: 'Session Race',
      });
      mockRaceModel.findById.mockReturnValue(raceQuerySpy);

      const resultQuerySpy = makeQuery({
        raceId,
        horseId,
        jockeyUserId,
        rank: 1,
        status: RaceResultStatus.PUBLISHED,
      });
      mockResultModel.findOne.mockReturnValue(resultQuerySpy);

      mockHorseModel.findById.mockReturnValue(
        makeQuery({
          _id: horseId,
          ownerId,
          name: 'Session Horse',
        }),
      );

      mockRegistrationModel.findOne.mockReturnValue(makeQuery(null));
      const prizeQuerySpy = makeQuery(null);
      mockPrizeModel.findOne.mockReturnValue(prizeQuerySpy);
      mockLedgerService.exists.mockResolvedValue(false);
      mockPrizeModel.create
        .mockResolvedValueOnce([{ ownerId, amount: 700 }])
        .mockResolvedValueOnce([{ ownerId: jockeyUserId, amount: 300 }]);

      await service.createPrizesForRace(raceId, session);

      // raceModel.findById phải được gọi với .session(session)
      expect(raceQuerySpy.session).toHaveBeenCalledWith(session);

      // resultModel.findOne phải được gọi với .session(session)
      expect(resultQuerySpy.session).toHaveBeenCalledWith(session);

      // prizeModel.findOne phải được gọi với .session(session)
      expect(prizeQuerySpy.session).toHaveBeenCalledWith(session);

      // ledger.credit phải được gọi với session
      expect(ledgerService.credit).toHaveBeenCalledWith(
        expect.objectContaining({ session }),
      );
    });
  });
});
