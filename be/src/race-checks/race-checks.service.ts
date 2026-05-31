import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RacesService } from '../races/races.service';
import { RaceStatus } from '../races/schemas/race.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import { CreateRaceCheckDto } from './dto/create-race-check.dto';
import { UpdateRaceCheckDto } from './dto/update-race-check.dto';
import {
  RaceCheck,
  RaceCheckDocument,
  RaceCheckStatus,
} from './schemas/race-check.schema';

@Injectable()
export class RaceChecksService {
  constructor(
    @InjectModel(RaceCheck.name)
    private checkModel: Model<RaceCheckDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    private racesService: RacesService,
  ) {}

  async create(
    dto: CreateRaceCheckDto,
    checkedBy: string,
  ): Promise<RaceCheckDocument> {
    // 1. Race must be in CHECKING status
    const race = await this.racesService.findOne(dto.raceId);
    if (race.status !== RaceStatus.CHECKING) {
      throw new BadRequestException(
        'Pre-race checks can only be submitted when race is in CHECKING status',
      );
    }

    // 2. Referee must have an ACCEPTED assignment for this race
    const assignment = await this.assignmentModel.findOne({
      raceId: dto.raceId,
      refereeUserId: checkedBy,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You must have an accepted referee assignment to submit race checks',
      );
    }

    // 3. Registration must exist, belong to this race, and be APPROVED
    const registration = await this.registrationModel.findById(
      dto.raceRegistrationId,
    );
    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    const registrationRaceId = String(
      (registration.raceId as unknown as { _id?: string })?._id ??
        registration.raceId,
    );
    if (registrationRaceId !== dto.raceId) {
      throw new BadRequestException(
        'Registration does not belong to this race',
      );
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new BadRequestException(
        'Registration is not approved for race checks',
      );
    }

    if (String(registration.horseId) !== dto.horseId) {
      throw new BadRequestException(
        'Horse does not match the selected registration',
      );
    }

    // 4. One check per (raceId, raceRegistrationId) — unique index handles it
    const existing = await this.checkModel.findOne({
      raceId: dto.raceId,
      raceRegistrationId: dto.raceRegistrationId,
    });
    if (existing) {
      throw new ConflictException(
        'A race check already exists for this registration in this race',
      );
    }

    return this.checkModel.create({
      raceId: new Types.ObjectId(dto.raceId),
      raceRegistrationId: new Types.ObjectId(dto.raceRegistrationId),
      horseId: new Types.ObjectId(dto.horseId),
      checkedBy: new Types.ObjectId(checkedBy),
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateRaceCheckDto,
    checkedBy: string,
  ): Promise<RaceCheckDocument> {
    const check = await this.checkModel.findById(id);
    if (!check) throw new NotFoundException('Race check not found');

    if (String(check.checkedBy) !== checkedBy) {
      throw new ForbiddenException('You can only update checks you submitted');
    }

    check.status = dto.status;
    if (dto.healthNote !== undefined) check.healthNote = dto.healthNote;
    if (dto.equipmentNote !== undefined)
      check.equipmentNote = dto.equipmentNote;
    if (dto.status !== RaceCheckStatus.PENDING) {
      check.checkedAt = new Date();
    }

    return check.save();
  }

  async findByRace(raceId: string) {
    return this.checkModel
      .find({ raceId })
      .populate('raceRegistrationId', 'status')
      .populate('horseId', 'name breed')
      .populate('checkedBy', 'fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Returns true if all APPROVED registrations for the race have a PASSED check */
  async areAllPassed(raceId: string): Promise<boolean> {
    const approvedCount = await this.registrationModel.countDocuments({
      raceId,
      status: RegistrationStatus.APPROVED,
    });

    if (approvedCount === 0) return false;

    const passedCount = await this.checkModel.countDocuments({
      raceId,
      status: RaceCheckStatus.PASSED,
    });

    return passedCount >= approvedCount;
  }
}
