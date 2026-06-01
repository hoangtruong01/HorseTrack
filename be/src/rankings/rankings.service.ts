import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';

export interface RankingEntry {
  horseId: string;
  horseName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs: number;
  rank?: number;
}

export interface JockeyRankingEntry {
  jockeyUserId: string;
  jockeyName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs: number;
  rank?: number;
}

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
  ) {}

  async getHorseRankings(tournamentId: string): Promise<RankingEntry[]> {
    const pipeline = [
      {
        $match: {
          tournamentId: new Types.ObjectId(tournamentId),
          status: RaceResultStatus.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$horseId',
          totalPoints: { $sum: '$points' },
          totalRaces: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] } },
          totalFinishTimeMs: { $sum: { $ifNull: ['$finishTimeMs', 0] } },
        },
      },
      { $sort: { totalPoints: -1 as const, totalFinishTimeMs: 1 as const } },
      {
        $lookup: {
          from: 'horses',
          localField: '_id',
          foreignField: '_id',
          as: 'horse',
        },
      },
      { $unwind: { path: '$horse', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          horseId: '$_id',
          horseName: '$horse.name',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTimeMs: 1,
        },
      },
    ];

    const raw = await this.resultModel.aggregate<{
      horseId: string;
      horseName?: string;
      totalPoints: number;
      totalRaces: number;
      wins: number;
      totalFinishTimeMs: number;
    }>(pipeline);
    return raw.map(
      (entry, index): RankingEntry => ({ ...entry, rank: index + 1 }),
    );
  }

  async getJockeyRankings(tournamentId: string): Promise<JockeyRankingEntry[]> {
    const pipeline = [
      {
        $match: {
          tournamentId: new Types.ObjectId(tournamentId),
          status: RaceResultStatus.PUBLISHED,
          jockeyUserId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$jockeyUserId',
          totalPoints: { $sum: '$points' },
          totalRaces: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] } },
          totalFinishTimeMs: { $sum: { $ifNull: ['$finishTimeMs', 0] } },
        },
      },
      { $sort: { totalPoints: -1 as const, totalFinishTimeMs: 1 as const } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'jockey',
        },
      },
      { $unwind: { path: '$jockey', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          jockeyUserId: '$_id',
          jockeyName: '$jockey.fullName',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTimeMs: 1,
        },
      },
    ];

    const raw = await this.resultModel.aggregate<{
      jockeyUserId: string;
      jockeyName?: string;
      totalPoints: number;
      totalRaces: number;
      wins: number;
      totalFinishTimeMs: number;
    }>(pipeline);
    return raw.map(
      (entry, index): JockeyRankingEntry => ({ ...entry, rank: index + 1 }),
    );
  }
}
