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
  breed?: string;
  ownerName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs: number;
  rank?: number;
}

export interface JockeyRankingEntry {
  jockeyUserId: string;
  jockeyName?: string;
  experienceYears?: number;
  skillLevel?: string;
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
          breed: '$horse.breed',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTimeMs: 1,
        },
      },
    ];

    const raw = await this.resultModel.aggregate<any>(pipeline);
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

    const raw = await this.resultModel.aggregate<any>(pipeline);
    return raw.map(
      (entry, index): JockeyRankingEntry => ({ ...entry, rank: index + 1 }),
    );
  }

  async getGlobalHorseRankings(): Promise<RankingEntry[]> {
    const pipeline = [
      {
        $match: {
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
      { $sort: { wins: -1 as const, totalPoints: -1 as const, totalFinishTimeMs: 1 as const } },
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
        $lookup: {
          from: 'users',
          localField: 'horse.ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          horseId: '$_id',
          horseName: '$horse.name',
          breed: '$horse.breed',
          ownerName: '$owner.fullName',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTimeMs: 1,
        },
      },
    ];

    const raw = await this.resultModel.aggregate<any>(pipeline);
    return raw.map(
      (entry, index): RankingEntry => ({ ...entry, rank: index + 1 }),
    );
  }

  async getGlobalJockeyRankings(): Promise<JockeyRankingEntry[]> {
    const pipeline = [
      {
        $match: {
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
      { $sort: { wins: -1 as const, totalPoints: -1 as const, totalFinishTimeMs: 1 as const } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'jockeys',
          localField: '_id',
          foreignField: 'userId',
          as: 'jockeyProfile',
        },
      },
      { $unwind: { path: '$jockeyProfile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          jockeyUserId: '$_id',
          jockeyName: '$user.fullName',
          experienceYears: '$jockeyProfile.experienceYears',
          skillLevel: '$jockeyProfile.skillLevel',
          totalPoints: 1,
          totalRaces: 1,
          wins: 1,
          totalFinishTimeMs: 1,
        },
      },
    ];

    const raw = await this.resultModel.aggregate<any>(pipeline);
    return raw.map(
      (entry, index): JockeyRankingEntry => ({ ...entry, rank: index + 1 }),
    );
  }
}
