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
  totalFinishTime: number;
  rank?: number;
}

export interface HorseAggregateRanking {
  horseId: string;
  horseName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTime: number;
}

export interface JockeyAggregateRanking {
  jockeyId: string;
  jockeyName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTime: number;
}

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    private racesService: RacesService,
  ) {}

  async getHorseRankings(tournamentId: string): Promise<RankingEntry[]> {
    // Get all race ids for this tournament
    const racesResult = await this.racesService.findByTournament(
      tournamentId,
      1,
      1000,
    );
    const raceIds = racesResult.data.map((r) => r._id);

    // Aggregate published results
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
          wins: {
            $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] },
          },
          totalFinishTime: { $sum: { $ifNull: ['$finishTime', 0] } },
        },
      },
      {
        $sort: { totalPoints: -1 as const, totalFinishTime: 1 as const },
      },
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
          totalFinishTime: 1,
        },
      },
    ];

    const results = await this.resultModel.aggregate(pipeline);

    // Assign rank
    return results.map(
      (entry: HorseAggregateRanking, index): RankingEntry => ({
        ...entry,
        rank: index + 1,
      }),
    );
  }

  async getJockeyRankings(tournamentId: string) {
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
          jockeyId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$jockeyId',
          totalPoints: { $sum: '$points' },
          totalRaces: { $sum: 1 },
          wins: {
            $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] },
          },
          totalFinishTime: { $sum: { $ifNull: ['$finishTime', 0] } },
        },
      },
      {
        $sort: { totalPoints: -1 as const, totalFinishTime: 1 as const },
      },
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
          jockeyId: '$_id',
          jockeyName: '$jockey.fullName',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTime: 1,
        },
      },
    ];

    const results = await this.resultModel.aggregate(pipeline);
    return results.map((entry: JockeyAggregateRanking, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}
