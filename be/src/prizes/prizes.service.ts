import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { Race, RaceDocument } from '../races/schemas/race.schema';
import {
  Tournament,
  TournamentDocument,
} from '../tournaments/schemas/tournament.schema';
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
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
  ) {}

  /** Automatically generate prizes when a race result is published */
  async createPrizesForRace(raceId: string): Promise<PrizeDocument[]> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');

    const tournament = await this.tournamentModel.findById(race.tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');

    const results = await this.resultModel.find({
      raceId,
      status: RaceResultStatus.PUBLISHED,
    });

    const pool = tournament.prizePool ?? 0;
    const prizes: PrizeDocument[] = [];

    for (const res of results) {
      // Look up horse owner
      const horse = await this.horseModel.findById(res.horseId);
      if (!horse) continue;

      let amount = 0;
      if (res.rank === 1) {
        amount = pool > 0 ? Math.round(pool * 0.5) : 5000;
      } else if (res.rank === 2) {
        amount = pool > 0 ? Math.round(pool * 0.3) : 3000;
      } else if (res.rank === 3) {
        amount = pool > 0 ? Math.round(pool * 0.2) : 2000;
      }

      if (amount > 0) {
        // Prevent duplicate prize for the same horse and race
        const existing = await this.prizeModel.findOne({
          raceId,
          horseId: res.horseId,
        });
        if (!existing) {
          const prize = await this.prizeModel.create({
            tournamentId: race.tournamentId,
            raceId: new Types.ObjectId(raceId),
            horseId: res.horseId,
            ownerId: horse.ownerId,
            rank: res.rank,
            amount,
            status: PrizePaymentStatus.PENDING,
          });
          prizes.push(prize);
        }
      }
    }

    return prizes;
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
