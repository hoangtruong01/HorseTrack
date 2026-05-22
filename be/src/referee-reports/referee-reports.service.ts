import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RacesService } from '../races/races.service';
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
    private racesService: RacesService,
  ) {}

  async create(
    dto: CreateRefereeReportDto,
    refereeId: string,
  ): Promise<RefereeReportDocument> {
    // 1. Verify race exists and referee is assigned to it
    const race = await this.racesService.findOne(dto.raceId);
    const isAssigned = race.refereeIds.some(
      (rId) => String(rId) === refereeId,
    );
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this race');
    }

    return this.reportModel.create({
      ...dto,
      refereeId,
    });
  }

  async findByRace(raceId: string) {
    return this.reportModel
      .find({ raceId })
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
