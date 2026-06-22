import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RaceChecksService } from './race-checks.service';
import { RaceCheck, RaceCheckStatus } from './schemas/race-check.schema';
import { Registration } from '../registrations/schemas/registration.schema';
import { RefereeAssignment } from '../referee-assignments/schemas/referee-assignment.schema';
import { RacesService } from '../races/races.service';

describe('RaceChecksService', () => {
  let service: RaceChecksService;
  let checkModel: { findById: jest.Mock };
  let assignmentModel: { findOne: jest.Mock };

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
    assignmentModel = { findOne: jest.fn().mockResolvedValue({ _id: 'assignmentId' }) };

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
          useValue: assignmentModel,
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
          { status: RaceCheckStatus.PENDING },
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
          { status: RaceCheckStatus.PASSED },
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
        { status: RaceCheckStatus.PASSED },
        refereeId,
      );

      expect(check.save).toHaveBeenCalled();
    });

    it('allows FAILED → PENDING (retry)', async () => {
      const check = makeCheck(RaceCheckStatus.FAILED);
      checkModel.findById.mockResolvedValue(check);

      await service.updateStatus(
        new Types.ObjectId().toHexString(),
        { status: RaceCheckStatus.PENDING },
        refereeId,
      );

      expect(check.save).toHaveBeenCalled();
    });
  });
});
