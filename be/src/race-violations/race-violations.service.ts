import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
import { CreateViolationDto } from './dto/create-violation.dto';
import {
  RaceViolation,
  RaceViolationDocument,
} from './schemas/race-violation.schema';

@Injectable()
export class RaceViolationsService {
  constructor(
    @InjectModel(RaceViolation.name)
    private violationModel: Model<RaceViolationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    private racesService: RacesService,
  ) {}

  async create(
    dto: CreateViolationDto,
    reportedBy: string,
  ): Promise<RaceViolationDocument> {
    const race = await this.racesService.findOne(dto.raceId);

    if (
      race.status !== RaceStatus.LIVE &&
      race.status !== RaceStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Violations can only be reported during LIVE or FINISHED races',
      );
    }

    // Reporter must be an accepted referee for this race
    const assignment = await this.assignmentModel.findOne({
      raceId: new Types.ObjectId(dto.raceId),
      refereeUserId: new Types.ObjectId(reportedBy),
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You must be an accepted referee to report violations',
      );
    }

    return this.violationModel.create({
      ...dto,
      raceId: new Types.ObjectId(dto.raceId),
      raceRegistrationId: dto.raceRegistrationId
        ? new Types.ObjectId(dto.raceRegistrationId)
        : undefined,
      horseId: dto.horseId ? new Types.ObjectId(dto.horseId) : undefined,
      jockeyUserId: dto.jockeyUserId
        ? new Types.ObjectId(dto.jockeyUserId)
        : undefined,
      reportedBy: new Types.ObjectId(reportedBy),
    });
  }

  async findByRace(raceId: string) {
    return this.violationModel
      .find({ raceId: new Types.ObjectId(raceId) })
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .populate('reportedBy', 'fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.violationModel
        .find()
        .populate('raceId', 'name')
        .populate('horseId', 'name breed')
        .populate('reportedBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.violationModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
