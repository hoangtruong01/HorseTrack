import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TournamentsService } from './tournaments.service';
import { Tournament } from './schemas/tournament.schema';
import { Race, RaceStatus } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import { Prediction } from '../predictions/schemas/prediction.schema';
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
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              withTransaction: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
              endSession: jest.fn().mockResolvedValue(undefined),
            }),
          },
        },
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
      const raceOid = new Types.ObjectId();
      raceModel.find.mockResolvedValue([{ _id: raceOid }]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      // Filtering happens at find level — updateMany is scoped to exact raceIds
      expect(raceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
        }),
      );
      expect(raceModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [raceOid] } },
        { $set: { status: RaceStatus.CANCELLED } },
        expect.objectContaining({ session: expect.any(Object) }),
      );
    });

    it('transitions PENDING registrations to CANCELLED', async () => {
      const raceOid = new Types.ObjectId();
      raceModel.find.mockResolvedValue([{ _id: raceOid }]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).toHaveBeenCalledWith(
        { raceId: { $in: [raceOid] }, status: RegistrationStatus.PENDING },
        { $set: { status: RegistrationStatus.CANCELLED } },
        expect.objectContaining({ session: expect.any(Object) }),
      );
    });

    it('transitions APPROVED registrations to WITHDRAWN (not CANCELLED)', async () => {
      const raceOid = new Types.ObjectId();
      raceModel.find.mockResolvedValue([{ _id: raceOid }]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).toHaveBeenCalledWith(
        { raceId: { $in: [raceOid] }, status: RegistrationStatus.APPROVED },
        { $set: { status: RegistrationStatus.WITHDRAWN } },
        expect.objectContaining({ session: expect.any(Object) }),
      );
    });

    it('does NOT call registrationModel.updateMany when no cancellable races', async () => {
      raceModel.find.mockResolvedValue([]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (service as any).cascadeCancel(tournamentId, 'Test Tournament');

      expect(registrationModel.updateMany).not.toHaveBeenCalled();
    });
  });
});
