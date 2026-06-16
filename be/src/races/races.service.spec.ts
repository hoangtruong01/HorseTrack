import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { RacesService } from './races.service';
import { Race, RaceStatus } from './schemas/race.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RaceCheck } from '../race-checks/schemas/race-check.schema';
import { RefereeAssignment } from '../referee-assignments/schemas/referee-assignment.schema';
import { TournamentsService } from '../tournaments/tournaments.service';
import { PredictionsService } from '../predictions/predictions.service';
import { TournamentStatus } from '../tournaments/schemas/tournament.schema';

describe('RacesService', () => {
  let service: RacesService;
  let raceModel: {
    findOne: jest.Mock;
    findById: jest.Mock;
    countDocuments: jest.Mock;
    aggregate: jest.Mock;
  };
  let tournamentsService: {
    findOne: jest.Mock;
    updateStatus: jest.Mock;
  };
  let predictionsService: {
    cancelPredictionsForRace: jest.Mock;
  };

  const raceId = new Types.ObjectId().toHexString();
  const tournamentId = new Types.ObjectId();

  function makeRace(status: RaceStatus) {
    return {
      _id: new Types.ObjectId(raceId),
      status,
      tournamentId,
      trackCondition: 'GOOD',
      weatherSnapshot: 'SUNNY',
      deletedAt: undefined,
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
    };
  }

  function makeTournament(status: TournamentStatus) {
    return {
      _id: new Types.ObjectId(),
      status,
    };
  }

  beforeEach(async () => {
    raceModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue([]),
    };

    tournamentsService = {
      findOne: jest.fn(),
      updateStatus: jest.fn(),
    };

    predictionsService = {
      cancelPredictionsForRace: jest.fn().mockResolvedValue(undefined),
    };

    const refereeAssignmentModel = { findOne: jest.fn() };
    const registrationModel = { find: jest.fn().mockResolvedValue([]) };
    const raceCheckModel = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        { provide: getModelToken(Race.name), useValue: raceModel },
        {
          provide: getModelToken(Registration.name),
          useValue: registrationModel,
        },
        { provide: getModelToken(RaceCheck.name), useValue: raceCheckModel },
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: refereeAssignmentModel,
        },
        { provide: TournamentsService, useValue: tournamentsService },
        { provide: PredictionsService, useValue: predictionsService },
      ],
    }).compile();

    service = module.get(RacesService);

    // Delegate service.findOne sang raceModel.findOne để mỗi test chỉ cần set raceModel.findOne.mockReturnValue
    jest
      .spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve(raceModel.findOne()));
  });

  describe('setStatus', () => {
    it('ghi status FINISHED→RESULT_PUBLISHED, KHÔNG gọi tournamentsService.updateStatus', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);

      await service.setStatus(raceId, RaceStatus.RESULT_PUBLISHED);

      expect(race.save).toHaveBeenCalled();
      expect(tournamentsService.updateStatus).not.toHaveBeenCalled();
    });

    it('throw BadRequestException nếu transition không hợp lệ', async () => {
      const race = makeRace(RaceStatus.SCHEDULED);
      raceModel.findOne.mockReturnValue(race);

      await expect(
        service.setStatus(raceId, RaceStatus.RESULT_PUBLISHED),
      ).rejects.toThrow(BadRequestException);
    });

    it('gọi cancelPredictionsForRace khi transition sang CANCELLED', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);

      await service.setStatus(raceId, RaceStatus.CANCELLED);

      expect(predictionsService.cancelPredictionsForRace).toHaveBeenCalledWith(
        raceId,
      );
    });

    it('nhận session và truyền vào race.save({ session })', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);
      const fakeSession = {} as unknown as ClientSession;

      await service.setStatus(raceId, RaceStatus.RESULT_PUBLISHED, fakeSession);

      expect(race.save).toHaveBeenCalledWith({ session: fakeSession });
    });

    it('SCHEDULED→CANCELLED gọi cancelPredictionsForRace', async () => {
      const race = makeRace(RaceStatus.SCHEDULED);
      raceModel.findOne.mockReturnValue(race);

      await service.setStatus(raceId, RaceStatus.CANCELLED);

      expect(predictionsService.cancelPredictionsForRace).toHaveBeenCalledWith(
        raceId,
      );
    });

    it('transition từ terminal state RESULT_PUBLISHED ném BadRequestException', async () => {
      const race = makeRace(RaceStatus.RESULT_PUBLISHED);
      raceModel.findOne.mockReturnValue(race);

      await expect(
        service.setStatus(raceId, RaceStatus.CANCELLED),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('syncTournamentStatus', () => {
    it('không throw khi tournamentsService.findOne ném lỗi (swallowed)', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);
      tournamentsService.findOne.mockRejectedValue(new Error('not found'));

      await expect(
        service.syncTournamentStatus(raceId),
      ).resolves.toBeUndefined();
    });

    it('gọi tournamentsService.updateStatus COMPLETED khi race FINISHED và không còn race active', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);
      const tournament = makeTournament(TournamentStatus.ONGOING);
      tournamentsService.findOne.mockResolvedValue(tournament);
      raceModel.countDocuments.mockResolvedValue(0);

      await service.syncTournamentStatus(raceId);

      expect(tournamentsService.updateStatus).toHaveBeenCalledWith(
        tournament._id.toString(),
        TournamentStatus.COMPLETED,
      );
    });

    it('race LIVE + tournament OPEN_REGISTRATION → gọi updateStatus CLOSED_REGISTRATION rồi ONGOING', async () => {
      const race = makeRace(RaceStatus.LIVE);
      raceModel.findOne.mockReturnValue(race);
      const tournament = makeTournament(TournamentStatus.OPEN_REGISTRATION);
      tournamentsService.findOne.mockResolvedValue(tournament);
      tournamentsService.updateStatus.mockResolvedValue(undefined);

      await service.syncTournamentStatus(raceId);

      expect(tournamentsService.updateStatus).toHaveBeenCalledTimes(2);
      expect(tournamentsService.updateStatus).toHaveBeenNthCalledWith(
        1,
        tournament._id.toString(),
        TournamentStatus.CLOSED_REGISTRATION,
      );
      expect(tournamentsService.updateStatus).toHaveBeenNthCalledWith(
        2,
        tournament._id.toString(),
        TournamentStatus.ONGOING,
      );
    });
  });

  describe('updateStatus', () => {
    it('vẫn cascade (gọi syncTournamentStatus)', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);

      const syncSpy = jest
        .spyOn(service, 'syncTournamentStatus')
        .mockResolvedValue(undefined);

      await service.updateStatus(raceId, RaceStatus.RESULT_PUBLISHED);

      expect(syncSpy).toHaveBeenCalledWith(raceId);
    });

    it('trả về RaceDocument đã save', async () => {
      const race = makeRace(RaceStatus.FINISHED);
      raceModel.findOne.mockReturnValue(race);
      jest.spyOn(service, 'syncTournamentStatus').mockResolvedValue(undefined);

      const result = await service.updateStatus(
        raceId,
        RaceStatus.RESULT_PUBLISHED,
      );

      expect(result).toBe(race);
    });
  });
});
