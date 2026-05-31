import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { RacesService } from '../races/races.service';

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
    private racesService: RacesService,
  ) {}

  async getHorseRankings(tournamentId: string): Promise<RankingEntry[]> {
    const racesResult = await this.racesService.findByTournament(
      tournamentId,
      1,
      1000,
    );
    const raceIds = racesResult.data.map((r) => r._id);

    const pipeline = [
      {
        $match: {
          raceId: { $in: raceIds },
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
    const racesResult = await this.racesService.findByTournament(
      tournamentId,
      1,
      1000,
    );
    const raceIds = racesResult.data.map((r) => r._id);

    const pipeline = [
      {
        $match: {
          raceId: { $in: raceIds },
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
