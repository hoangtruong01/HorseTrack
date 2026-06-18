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
  let assignmentModel: { findOne: jest.Mock; create: jest.Mock };

  const refereeUserId = new Types.ObjectId().toHexString();
  const assignedBy = new Types.ObjectId().toHexString();
  const raceId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    usersService = { findById: jest.fn() };
    refereeProfilesService = {
      existsForUser: jest.fn(),
      findByUserId: jest.fn(),
    };
    assignmentModel = {
      findOne: jest.fn().mockResolvedValue(null), // stub duplicate-check (step 5)
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefereeAssignmentsService,
        {
          provide: getModelToken(RefereeAssignment.name),
          useValue: assignmentModel,
        },
        {
          provide: getModelToken(Race.name),
          useValue: { findOne: jest.fn() },
        },
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
      service.create({ refereeUserId, raceId }, assignedBy),
    ).rejects.toThrow(BadRequestException);
    expect(assignmentModel.create).not.toHaveBeenCalled();
  });
});
