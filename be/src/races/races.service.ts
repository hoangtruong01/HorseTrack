import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import {
  Race,
  RaceDocument,
  RaceStatus,
  RACE_STATUS_FLOW,
} from './schemas/race.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  RaceCheck,
  RaceCheckDocument,
  RaceCheckStatus,
} from '../race-checks/schemas/race-check.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';

const LOCKED_STATUSES = [
  RaceStatus.LIVE,
  RaceStatus.FINISHED,
  RaceStatus.RESULT_PUBLISHED,
];

@Injectable()
export class RacesService {
  constructor(
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RaceCheck.name)
    private raceCheckModel: Model<RaceCheckDocument>,
    @InjectModel(RefereeAssignment.name)
    private refereeAssignmentModel: Model<RefereeAssignmentDocument>,
    private tournamentsService: TournamentsService,
  ) {}

  async create(dto: CreateRaceDto, createdBy: string): Promise<RaceDocument> {
    const tournament = await this.tournamentsService.findOne(dto.tournamentId);

    // Validate startTime within tournament dates
    const startTime = new Date(dto.startTime);
    if (startTime < tournament.startDate || startTime > tournament.endDate) {
      throw new BadRequestException(
        'Race startTime must be within tournament startDate and endDate',
      );
    }

    return this.raceModel.create({
      ...dto,
      createdBy,
    } as unknown as Partial<RaceDocument>);
  }

  async findAll(page = 1, limit = 20) {
    const filter = { deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('tournamentId', 'name')
        .populate('createdBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startTime: -1 })
        .exec(),
      this.raceModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByTournament(tournamentId: string, page = 1, limit = 20) {
    const filter = { tournamentId, deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('createdBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startTime: 1 })
        .exec(),
      this.raceModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<RaceDocument> {
    const race = await this.raceModel
      .findById(id)
      .populate('tournamentId', 'name startDate endDate')
      .populate('createdBy', 'fullName')
      .exec();
    if (!race || race.deletedAt) {
      throw new NotFoundException('Race not found');
    }
    return race;
  }

  async update(id: string, dto: UpdateRaceDto): Promise<RaceDocument> {
    const race = await this.findOne(id);
    if (LOCKED_STATUSES.includes(race.status)) {
      throw new BadRequestException(
        'Cannot update a race that is live, finished, or has published results',
      );
    }
    Object.assign(race, dto);
    return race.save();
  }

  async updateStatus(id: string, status: RaceStatus): Promise<RaceDocument> {
    const race = await this.findOne(id);

    const allowedTransitions = RACE_STATUS_FLOW[race.status] || [];
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${race.status} to ${status}`,
      );
    }

    // Guard: CHECKING → READY requires all checks passed + at least 1 referee accepted
    if (status === RaceStatus.READY) {
      await this.validateReadyConditions(id);
    }

    race.status = status;
    return race.save();
  }

  /** Enforce pre-race conditions before READY transition */
  private async validateReadyConditions(raceId: string): Promise<void> {
    // 1. At least 1 referee_assignment must be ACCEPTED
    const acceptedReferee = await this.refereeAssignmentModel.findOne({
      raceId,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!acceptedReferee) {
      throw new BadRequestException(
        'Race cannot be marked READY: no referee has accepted the assignment',
      );
    }

    // 2. All APPROVED registrations must have a PASSED race_check
    const approvedRegs = await this.registrationModel.find({
      raceId,
      status: RegistrationStatus.APPROVED,
    });
    if (approvedRegs.length === 0) {
      throw new BadRequestException(
        'Race cannot be marked READY: no approved horse registrations',
      );
    }

    const passedChecks = await this.raceCheckModel.countDocuments({
      raceId,
      status: RaceCheckStatus.PASSED,
    });
    if (passedChecks < approvedRegs.length) {
      throw new BadRequestException(
        `Race cannot be marked READY: ${approvedRegs.length - passedChecks} horse(s) have not passed pre-race check`,
      );
    }
  }

  async softDelete(id: string): Promise<void> {
    const race = await this.findOne(id);
    if (
      race.status === RaceStatus.FINISHED ||
      race.status === RaceStatus.RESULT_PUBLISHED
    ) {
      throw new BadRequestException(
        'Cannot delete a finished or result published race',
      );
    }
    race.deletedAt = new Date();
    await race.save();
  }
}
