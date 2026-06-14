import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RacesService } from '../races/races.service';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { CreateRefereeReportDto } from './dto/create-report.dto';
import {
  RefereeReport,
  RefereeReportDocument,
} from './schemas/referee-report.schema';

@Injectable()
export class RefereeReportsService {
  constructor(
    @InjectModel(RefereeReport.name)
    private reportModel: Model<RefereeReportDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    private racesService: RacesService,
  ) {}

  async create(
    dto: CreateRefereeReportDto,
    refereeId: string,
  ): Promise<RefereeReportDocument> {
    // Verify race exists and referee has an accepted assignment
    await this.racesService.findOne(dto.raceId);
    const assignment = await this.assignmentModel.findOne({
      raceId: dto.raceId,
      refereeUserId: refereeId,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You are not an accepted referee for this race',
      );
    }

    return this.reportModel.create({ ...dto, refereeId });
  }

  async findByRace(raceId: string) {
    return this.reportModel
      .find({ raceId: new Types.ObjectId(raceId) })
      .populate('refereeId', 'fullName email')
      .populate('horseId', 'name breed')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.reportModel
        .find()
        .populate('raceId', 'name')
        .populate('refereeId', 'fullName email')
        .populate('horseId', 'name breed')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.reportModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
