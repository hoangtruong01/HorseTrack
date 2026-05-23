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
import { Race, RaceDocument, RaceStatus, RACE_STATUS_FLOW } from './schemas/race.schema';

@Injectable()
export class RacesService {
  constructor(
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    private tournamentsService: TournamentsService,
  ) {}

  async create(dto: CreateRaceDto): Promise<RaceDocument> {
    // Validate tournament exists
    await this.tournamentsService.findOne(dto.tournamentId);

    // Check duplicate horse ids
    const horseIds = dto.horses.map((h) => h.horseId);
    if (new Set(horseIds).size !== horseIds.length) {
      throw new BadRequestException('Duplicate horse in race');
    }

    // Check duplicate jockey ids (only among those assigned)
    const jockeyIds = dto.horses
      .filter((h) => h.jockeyId)
      .map((h) => h.jockeyId!);
    if (new Set(jockeyIds).size !== jockeyIds.length) {
      throw new BadRequestException('A jockey cannot ride two horses in the same race');
    }

    return this.raceModel.create(dto as any);
  }

  async findAll(page = 1, limit = 20) {
    const filter = { deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('tournamentId', 'name')
        .populate('horses.horseId', 'name breed')
        .populate('horses.jockeyId', 'fullName')
        .populate('refereeIds', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ scheduledAt: -1 })
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
        .populate('horses.horseId', 'name breed')
        .populate('horses.jockeyId', 'fullName')
        .populate('refereeIds', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ scheduledAt: 1 })
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
      .populate('tournamentId', 'name')
      .populate('horses.horseId', 'name breed')
      .populate('horses.jockeyId', 'fullName')
      .populate('refereeIds', 'fullName')
      .exec();
    if (!race || race.deletedAt) {
      throw new NotFoundException('Race not found');
    }
    return race;
  }

  /** Races assigned to a specific referee */
  async findMyAssigned(refereeId: string, page = 1, limit = 20) {
    const filter = { refereeIds: refereeId, deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('tournamentId', 'name')
        .populate('horses.horseId', 'name breed')
        .populate('horses.jockeyId', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ scheduledAt: 1 })
        .exec(),
      this.raceModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateRaceDto): Promise<RaceDocument> {
    const race = await this.findOne(id);
    if (race.status === RaceStatus.FINISHED || race.status === RaceStatus.RESULT_PUBLISHED) {
      throw new BadRequestException('Cannot update a finished or result published race');
    }
    Object.assign(race, dto);
    return race.save();
  }

  async updateStatus(id: string, status: RaceStatus): Promise<RaceDocument> {
    const race = await this.findOne(id);
    
    // Validate status transition
    const allowedTransitions = RACE_STATUS_FLOW[race.status] || [];
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${race.status} to ${status}`,
      );
    }

    race.status = status;
    return race.save();
  }

  async softDelete(id: string): Promise<void> {
    const race = await this.findOne(id);
    if (race.status === RaceStatus.FINISHED || race.status === RaceStatus.RESULT_PUBLISHED) {
      throw new BadRequestException('Cannot delete a finished or result published race');
    }
    race.deletedAt = new Date();
    await race.save();
  }
}
