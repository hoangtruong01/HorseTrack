import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RaceResultsService } from './race-results.service';
import {
  RaceResult,
  RaceResultOutcome,
  RaceResultStatus,
} from './schemas/race-result.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RefereeAssignment } from '../referee-assignments/schemas/referee-assignment.schema';
import { Jockey } from '../jockeys/schemas/jockey.schema';
import { RaceViolation } from '../race-violations/schemas/race-violation.schema';
import { RacesService } from '../races/races.service';
import { PrizesService } from '../prizes/prizes.service';
import { PredictionsService } from '../predictions/predictions.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RaceStatus } from '../races/schemas/race.schema';
import { NotificationType } from '../notifications/schemas/notification.schema';

describe('RaceResultsService', () => {
  let service: RaceResultsService;
  let resultModel: {
    find: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    exists: jest.Mock;
  };
  let racesService: {
    findOne: jest.Mock;
    setStatus: jest.Mock;
    syncTournamentStatus: jest.Mock;
    updateStatus: jest.Mock;
  };
  let prizesService: { createPrizesForRace: jest.Mock };
  let predictionsService: { payoutBetsForRace: jest.Mock };
  let auditLogsService: { log: jest.Mock };
  let notificationsService: { send: jest.Mock };
  let mockConnection: {
    startSession: jest.Mock;
  };

  const raceId = new Types.ObjectId().toHexString();
  const publisherId = new Types.ObjectId().toHexString();

  function makeResult(rank: number, outcome = RaceResultOutcome.FINISHED) {
    return {
      _id: new Types.ObjectId(),
      raceId: new Types.ObjectId(raceId),
      ownerId: new Types.ObjectId(),
      rank,
      outcome,
      status: RaceResultStatus.CONFIRMED,
    };
  }

  function makeSession(failFn?: (fn: () => Promise<void>) => Promise<void>) {
    const endSession = jest.fn().mockResolvedValue(undefined);
    const withTransaction = failFn
      ? jest.fn().mockImplementation(failFn)
      : jest.fn().mockImplementation(async (fn: () => Promise<void>) => {
          await fn();
        });
    return { withTransaction, endSession };
  }

  beforeEach(async () => {
    resultModel = {
      find: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      exists: jest.fn().mockResolvedValue(null),
    };
    racesService = {
      findOne: jest.fn(),
      setStatus: jest.fn().mockResolvedValue({}),
      syncTournamentStatus: jest.fn().mockResolvedValue({}),
      updateStatus: jest.fn().mockResolvedValue({}),
    };
    prizesService = {
      createPrizesForRace: jest.fn().mockResolvedValue([]),
    };
    predictionsService = {
      payoutBetsForRace: jest.fn().mockResolvedValue([]),
    };
    auditLogsService = { log: jest.fn().mockResolvedValue(undefined) };
    notificationsService = { send: jest.fn().mockResolvedValue(undefined) };
    mockConnection = { startSession: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaceResultsService,
        { provide: getModelToken(RaceResult.name), useValue: resultModel },
        {
          provide: getModelToken(Registration.name),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getModelToken(Jockey.name),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getModelToken(RaceViolation.name),
          useValue: { findOne: jest.fn() },
        },
        { provide: RacesService, useValue: racesService },
        { provide: PrizesService, useValue: prizesService },
        { provide: PredictionsService, useValue: predictionsService },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get(RaceResultsService);
  });

  describe('publishByRace', () => {
    it('publishByRace: payout ném lỗi → rollback, KHÔNG gọi syncTournamentStatus/notification/audit', async () => {
      const session = makeSession(async (fn) => {
        await fn(); // chạy fn, để lỗi nổi lên (mô phỏng abort tự động)
      });
      mockConnection.startSession.mockResolvedValue(session);

      racesService.findOne.mockResolvedValue({
        status: RaceStatus.FINISHED,
        prize: 1000,
        name: 'Test Race',
      });
      resultModel.find.mockResolvedValue([makeResult(1), makeResult(2)]);
      predictionsService.payoutBetsForRace.mockRejectedValue(
        new Error('payout failed'),
      );

      await expect(service.publishByRace(raceId, publisherId)).rejects.toThrow(
        'payout failed',
      );

      expect(racesService.syncTournamentStatus).not.toHaveBeenCalled();
      expect(notificationsService.send).not.toHaveBeenCalled();
      expect(auditLogsService.log).not.toHaveBeenCalled();
    });

    it('publishByRace: happy path → setStatus với RESULT_PUBLISHED + session, syncTournamentStatus + notification + audit ĐƯỢC gọi sau commit', async () => {
      const winnerOwnerId = new Types.ObjectId();
      const winnerResult = {
        _id: new Types.ObjectId(),
        raceId: new Types.ObjectId(raceId),
        ownerId: winnerOwnerId,
        rank: 1,
        outcome: RaceResultOutcome.FINISHED,
        status: RaceResultStatus.CONFIRMED,
      };
      const results = [winnerResult, makeResult(2)];

      const session = makeSession();
      mockConnection.startSession.mockResolvedValue(session);

      racesService.findOne.mockResolvedValue({
        status: RaceStatus.FINISHED,
        prize: 5000,
        name: 'Grand Prix',
      });
      resultModel.find.mockResolvedValue(results);
      predictionsService.payoutBetsForRace.mockResolvedValue([
        {
          userId: 'user1',
          title: 'Bạn thắng!',
          body: 'Chúc mừng',
          type: NotificationType.REWARD,
        },
      ]);

      const res = await service.publishByRace(raceId, publisherId);

      // setStatus phải được gọi với session bên trong tx
      expect(racesService.setStatus).toHaveBeenCalledWith(
        raceId,
        RaceStatus.RESULT_PUBLISHED,
        session,
      );

      // session phải được forward vào createPrizesForRace và payoutBetsForRace
      expect(prizesService.createPrizesForRace).toHaveBeenCalledWith(
        raceId,
        session,
      );
      expect(predictionsService.payoutBetsForRace).toHaveBeenCalledWith(
        raceId,
        session,
      );

      // side-effects sau commit
      expect(racesService.syncTournamentStatus).toHaveBeenCalledWith(raceId);

      // winner notification
      expect(notificationsService.send).toHaveBeenCalledWith(
        String(winnerOwnerId),
        'Chiến thắng vang dội!',
        expect.stringContaining('Grand Prix'),
        NotificationType.REWARD,
      );

      // payout intent notification
      expect(notificationsService.send).toHaveBeenCalledWith(
        'user1',
        'Bạn thắng!',
        'Chúc mừng',
        NotificationType.REWARD,
      );

      expect(auditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: publisherId,
          action: 'race_result.publish',
        }),
      );

      expect(res.message).toContain('published');
    });

    it('publishByRace: retry-safety — withTransaction chạy callback 2 lần, notifyIntents KHÔNG bị nhân đôi', async () => {
      const winnerOwnerId = new Types.ObjectId();
      const winnerResult = {
        _id: new Types.ObjectId(),
        raceId: new Types.ObjectId(raceId),
        ownerId: winnerOwnerId,
        rank: 1,
        outcome: RaceResultOutcome.FINISHED,
        status: RaceResultStatus.CONFIRMED,
      };
      const results = [winnerResult, makeResult(2)];

      // withTransaction gọi fn() 2 lần (mô phỏng Mongo driver retry)
      const session = makeSession(async (fn) => {
        await fn(); // lần 1
        await fn(); // lần 2
      });
      mockConnection.startSession.mockResolvedValue(session);

      racesService.findOne.mockResolvedValue({
        status: RaceStatus.FINISHED,
        prize: 3000,
        name: 'Retry Race',
      });
      resultModel.find.mockResolvedValue(results);

      const payoutIntent = {
        userId: 'user1',
        title: 'Thắng cược!',
        body: 'Chúc mừng',
        type: NotificationType.REWARD,
      };
      // Mỗi lần gọi trả về 1 intent
      predictionsService.payoutBetsForRace.mockResolvedValue([payoutIntent]);

      await service.publishByRace(raceId, publisherId);

      // notificationsService.send được gọi cho winner (1 lần) + 1 intent (1 lần) = 2 lần tổng
      // KHÔNG phải 3 lần (winner + intent lần 1 + intent lần 2)
      const sendCalls = notificationsService.send.mock.calls as [
        string,
        ...unknown[],
      ][];
      const payoutSendCalls = sendCalls.filter((call) => call[0] === 'user1');
      expect(payoutSendCalls).toHaveLength(1);
      expect(notificationsService.send).toHaveBeenCalledTimes(2); // winner + 1 intent
    });
  });

  describe('applyViolationsToResults', () => {
    it('throws when results are already PUBLISHED', async () => {
      resultModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      const svc = service as unknown as {
        applyViolationsToResults: (id: string) => Promise<void>;
      };
      await expect(svc.applyViolationsToResults(raceId)).rejects.toThrow(
        'Không thể áp dụng vi phạm cho kết quả đã công bố',
      );
      expect(resultModel.find).not.toHaveBeenCalled();
    });
  });
});
