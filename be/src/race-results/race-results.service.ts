import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RacesService } from '../races/races.service';
import { RaceStatus } from '../races/schemas/race.schema';
import { CreateRaceResultDto } from './dto/create-race-result.dto';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from './schemas/race-result.schema';
import { PrizesService } from '../prizes/prizes.service';
import { BetsService } from '../bets/bets.service';

/** Points by rank */
const POINTS_MAP: Record<number, number> = { 1: 10, 2: 7, 3: 5, 4: 3 };
const DEFAULT_POINTS = 1;

@Injectable()
export class RaceResultsService {
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    private racesService: RacesService,
    private prizesService: PrizesService,
    private betsService: BetsService,
  ) {}

  async create(
    dto: CreateRaceResultDto,
    recordedBy: string,
  ): Promise<RaceResultDocument> {
    const race = await this.racesService.findOne(dto.raceId);

    // Only assigned referee can record
    const isAssigned = race.refereeIds.some(
      (r) => String(r) === recordedBy,
    );
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this race');
    }

    // Duplicate horse check
    const existingHorse = await this.resultModel.findOne({
      raceId: dto.raceId,
      horseId: dto.horseId,
    });
    if (existingHorse) {
      throw new ConflictException('Result already exists for this horse in this race');
    }

    // Duplicate rank check
    const existingRank = await this.resultModel.findOne({
      raceId: dto.raceId,
      rank: dto.rank,
    });
    if (existingRank) {
      throw new BadRequestException(`Rank ${dto.rank} is already taken in this race`);
    }

    const points = dto.violation
      ? 0
      : (POINTS_MAP[dto.rank] ?? DEFAULT_POINTS);

    return this.resultModel.create({
      ...dto,
      points,
      recordedBy,
    });
  }

  async findByRace(raceId: string) {
    return this.resultModel
      .find({ raceId })
      .populate('horseId', 'name breed')
      .populate('jockeyId', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ rank: 1 })
      .exec();
  }

  async findByTournament(tournamentId: string) {
    // Get all race ids for this tournament
    const racesResult = await this.racesService.findByTournament(tournamentId, 1, 1000);
    const raceIds = racesResult.data.map((r) => r._id);
    return this.resultModel
      .find({ raceId: { $in: raceIds } })
      .populate('raceId', 'name raceNumber')
      .populate('horseId', 'name breed')
      .populate('jockeyId', 'fullName')
      .sort({ raceId: 1, rank: 1 })
      .exec();
  }

  async publishByRace(raceId: string, publishedBy: string) {
    const race = await this.racesService.findOne(raceId);
    const results = await this.resultModel.find({ raceId });

    if (results.length === 0) {
      throw new BadRequestException('No results to publish for this race');
    }

    // Update all results to PUBLISHED
    await this.resultModel.updateMany(
      { raceId },
      {
        status: RaceResultStatus.PUBLISHED,
        publishedBy,
        publishedAt: new Date(),
      },
    );

    // Update race status to FINISHED
    await this.racesService.updateStatus(raceId, RaceStatus.FINISHED);

    // Auto-create prizes
    await this.prizesService.createPrizesForRace(raceId);

    // Resolve bets
    await this.betsService.payoutBetsForRace(raceId);

    return { message: 'Results published, race marked as FINISHED, prizes generated, and bets resolved' };
  }
}
