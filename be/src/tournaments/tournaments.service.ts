import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import {
  Tournament,
  TournamentDocument,
  TournamentStatus,
  TOURNAMENT_STATUS_FLOW,
} from './schemas/tournament.schema';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
  ) {}

  async create(
    dto: CreateTournamentDto,
    createdBy: string,
  ): Promise<TournamentDocument> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }
    if (
      dto.registrationStartDate &&
      dto.registrationEndDate &&
      new Date(dto.registrationStartDate) >= new Date(dto.registrationEndDate)
    ) {
      throw new BadRequestException(
        'registrationStartDate must be before registrationEndDate',
      );
    }
    return this.tournamentModel.create({ ...dto, createdBy });
  }

  async findAll(page = 1, limit = 20) {
    const filter = { deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.tournamentModel
        .find(filter)
        .populate('createdBy', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.tournamentModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .exec();
    if (!tournament || tournament.deletedAt) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(
    id: string,
    dto: UpdateTournamentDto,
  ): Promise<TournamentDocument> {
    const tournament = await this.findOne(id);

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('startDate must be before endDate');
      }
    }

    // Don't allow editing COMPLETED / CANCELLED tournaments
    if (
      tournament.status === TournamentStatus.COMPLETED ||
      tournament.status === TournamentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update a completed or cancelled tournament',
      );
    }

    Object.assign(tournament, dto);
    return tournament.save();
  }

  async updateStatus(
    id: string,
    newStatus: TournamentStatus,
  ): Promise<TournamentDocument> {
    const tournament = await this.findOne(id);
    const allowed = TOURNAMENT_STATUS_FLOW[tournament.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${tournament.status} to ${newStatus}`,
      );
    }

    tournament.status = newStatus;
    return tournament.save();
  }

  async softDelete(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    if (
      tournament.status === TournamentStatus.ONGOING ||
      tournament.status === TournamentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot delete an ongoing or completed tournament',
      );
    }
    tournament.deletedAt = new Date();
    await tournament.save();
  }
}
