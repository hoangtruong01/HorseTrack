import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { Race, RaceDocument } from '../races/schemas/race.schema';
import { Horse, HorseDocument } from '../horses/schemas/horse.schema';
import {
  Prize,
  PrizeDocument,
  PrizePaymentStatus,
} from './schemas/prize.schema';

@Injectable()
export class PrizesService {
  constructor(
    @InjectModel(Prize.name) private prizeModel: Model<PrizeDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
  ) {}

  /** Generate prize for the race winner when results are published */
  async createPrizesForRace(raceId: string): Promise<PrizeDocument[]> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');

    const amount = race.prize ?? 0;
    if (amount === 0) return [];

    const winnerResult = await this.resultModel.findOne({
      raceId,
      status: RaceResultStatus.PUBLISHED,
      rank: 1,
    });
    if (!winnerResult) return [];

    const existing = await this.prizeModel.findOne({
      raceId,
      horseId: winnerResult.horseId,
    });
    if (existing) return [];

    const horse = await this.horseModel.findById(winnerResult.horseId);
    if (!horse) return [];

    const prize = await this.prizeModel.create({
      tournamentId: race.tournamentId,
      raceId: new Types.ObjectId(raceId),
      horseId: winnerResult.horseId,
      ownerId: horse.ownerId,
      rank: 1,
      amount,
      status: PrizePaymentStatus.PENDING,
    });

    return [prize];
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prizeModel
        .find()
        .populate('tournamentId', 'name')
        .populate('raceId', 'name')
        .populate('horseId', 'name')
        .populate('ownerId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.prizeModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyPrizes(ownerId: string, page = 1, limit = 20) {
    const filter = { ownerId };
    const [data, total] = await Promise.all([
      this.prizeModel
        .find(filter)
        .populate('tournamentId', 'name')
        .populate('raceId', 'name')
        .populate('horseId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.prizeModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(
    id: string,
    status: PrizePaymentStatus,
  ): Promise<PrizeDocument> {
    const prize = await this.prizeModel.findById(id);
    if (!prize) throw new NotFoundException('Prize not found');

    prize.status = status;
    if (status === PrizePaymentStatus.PAID) {
      prize.paidAt = new Date();
    } else {
      prize.paidAt = undefined;
    }
    return prize.save();
  }
}
