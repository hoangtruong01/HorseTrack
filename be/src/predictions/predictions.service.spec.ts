import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PredictionsService } from './predictions.service';
import { Prediction, PredictionStatus } from './schemas/prediction.schema';
import { Race } from '../races/schemas/race.schema';
import {
  RaceResult,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

describe('PredictionsService', () => {
  let service: PredictionsService;
  let predictionModel: {
    find: jest.Mock;
    findOneAndUpdate: jest.Mock;
    create?: jest.Mock;
    findOne?: jest.Mock;
    countDocuments?: jest.Mock;
    updateMany?: jest.Mock;
    findByIdAndDelete?: jest.Mock;
  };
  let resultModel: { find: jest.Mock };
  let raceModel: { findById?: jest.Mock };
  let registrationModel: { findOne?: jest.Mock };
  let ledgerService: {
    credit: jest.Mock;
    debit: jest.Mock;
    getBalance?: jest.Mock;
  };
  let notificationsService: { send: jest.Mock };

  const raceId = new Types.ObjectId().toHexString();
  const horseId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const predictionId = new Types.ObjectId();

  function makePrediction(
    betPoints = 5,
    predictedHorseId: Types.ObjectId = horseId,
  ) {
    return {
      _id: predictionId,
      userId,
      raceId: new Types.ObjectId(raceId),
      predictedHorseId,
      status: PredictionStatus.PENDING,
      betPoints,
    };
  }

  function makeWinner(hId: Types.ObjectId = horseId) {
    return {
      raceId: new Types.ObjectId(raceId),
      horseId: hId,
      rank: 1,
      status: RaceResultStatus.PUBLISHED,
    };
  }

  beforeEach(async () => {
    predictionModel = {
      find: jest.fn(),
      findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };
    resultModel = { find: jest.fn() };
    raceModel = { findById: jest.fn() };
    registrationModel = { findOne: jest.fn() };
    ledgerService = {
      credit: jest.fn().mockResolvedValue(undefined),
      debit: jest.fn().mockResolvedValue(undefined),
    };
    notificationsService = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionsService,
        {
          provide: getConnectionToken(),
          useValue: { startSession: jest.fn() },
        },
        { provide: getModelToken(Prediction.name), useValue: predictionModel },
        { provide: getModelToken(Race.name), useValue: raceModel },
        { provide: getModelToken(RaceResult.name), useValue: resultModel },
        {
          provide: getModelToken(Registration.name),
          useValue: registrationModel,
        },
        { provide: RewardPointLedgerService, useValue: ledgerService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(PredictionsService);
  });

  describe('payoutBetsForRace', () => {
    it('payoutBetsForRace: trả notify intents và KHÔNG tự gửi notification', async () => {
      const prediction = makePrediction(5);
      const winner = makeWinner();

      // resultModel.find trả về winner, session chain
      resultModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([winner]),
      });

      // predictionModel.find trả về prediction, session chain
      predictionModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([prediction]),
      });

      // findOneAndUpdate exec trả về updated prediction (not null → not skipped)
      const updatedPrediction = { ...prediction, status: PredictionStatus.WON };
      predictionModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPrediction),
      });

      const intents = await service.payoutBetsForRace(raceId);

      expect(Array.isArray(intents)).toBe(true);
      expect(intents.length).toBeGreaterThan(0);
      expect(intents[0]).toEqual(
        expect.objectContaining({
          userId: String(userId),
          title: 'Dự đoán chính xác!',
          type: NotificationType.PREDICTION,
        }),
      );
      expect(notificationsService.send).not.toHaveBeenCalled();
    });

    it('payoutBetsForRace: trả mảng rỗng khi không có prediction PENDING', async () => {
      resultModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([makeWinner()]),
      });
      predictionModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([]),
      });

      const intents = await service.payoutBetsForRace(raceId);

      expect(intents).toEqual([]);
      expect(notificationsService.send).not.toHaveBeenCalled();
    });

    it('payoutBetsForRace: nhánh THUA có cược (betPoints >= 2) — intent đúng, không credit, không send', async () => {
      const wrongHorseId = new Types.ObjectId();
      const losingPrediction = makePrediction(5, wrongHorseId);
      const winner = makeWinner(horseId); // winner là horseId, prediction đoán wrongHorseId

      resultModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([winner]),
      });
      predictionModel.find.mockReturnValue({
        session: jest.fn().mockResolvedValue([losingPrediction]),
      });

      const updatedPrediction = {
        ...losingPrediction,
        status: PredictionStatus.LOST,
      };
      predictionModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPrediction),
      });

      const intents = await service.payoutBetsForRace(raceId);

      expect(intents.length).toBe(1);
      expect(intents[0].title).toBe('Dự đoán không chính xác');
      expect(ledgerService.credit).not.toHaveBeenCalled();
      expect(notificationsService.send).not.toHaveBeenCalled();
    });
  });
});
