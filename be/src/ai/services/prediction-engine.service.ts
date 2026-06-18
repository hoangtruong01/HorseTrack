import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Race, type RaceDocument } from '../../races/schemas/race.schema';
import {
  Registration,
  type RegistrationDocument,
  RegistrationStatus,
} from '../../registrations/schemas/registration.schema';
import { Horse, type HorseDocument } from '../../horses/schemas/horse.schema';
import {
  RaceResult,
  type RaceResultDocument,
} from '../../race-results/schemas/race-result.schema';
import {
  RaceRecord,
  type RaceRecordDocument,
} from '../../race-records/schemas/race-record.schema';
import {
  Jockey,
  type JockeyDocument,
} from '../../jockeys/schemas/jockey.schema';
import {
  AIPredictionSuggestion,
  type AIPredictionSuggestionDocument,
  PredictionSource,
} from '../schemas/ai-prediction-suggestion.schema';
import { StrengthScoreService } from './strength-score.service';
import type { HorsePredictionMeta } from './llm.service';
import { LlmService } from './llm.service';

interface EntryData {
  horseId: Types.ObjectId;
  score: number;
  hasHistory: boolean;
  meta: Omit<
    HorsePredictionMeta,
    'predictedRank' | 'winProbability' | 'strengthScore'
  >;
}

@Injectable()
export class PredictionEngineService {
  constructor(
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(RaceResult.name)
    private raceResultModel: Model<RaceResultDocument>,
    @InjectModel(RaceRecord.name)
    private raceRecordModel: Model<RaceRecordDocument>,
    @InjectModel(Jockey.name) private jockeyModel: Model<JockeyDocument>,
    @InjectModel(AIPredictionSuggestion.name)
    private predictionModel: Model<AIPredictionSuggestionDocument>,
    private readonly strengthScore: StrengthScoreService,
    private readonly llm: LlmService,
  ) {}

  async generateForRace(
    raceId: string,
  ): Promise<AIPredictionSuggestionDocument> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException(`Race ${raceId} không tồn tại`);

    const registrations = await this.registrationModel.find({
      raceId: new Types.ObjectId(raceId),
      status: RegistrationStatus.APPROVED,
    });

    if (!registrations.length) {
      throw new BadRequestException(
        'Race chưa có ngựa đăng ký hợp lệ để sinh dự đoán',
      );
    }

    const raceDate = race.startTime;
    const entries = await Promise.all(
      registrations.map((reg) => this.buildEntry(reg, raceDate)),
    );

    const scores = entries.map((e) => e.score);
    const winProbs = softmax(scores, 15);
    const sortedIdx = [...scores.keys()].sort((a, b) => scores[b] - scores[a]);

    const rankings = sortedIdx.map((origIdx, rankIdx) => ({
      horseId: entries[origIdx].horseId,
      predictedRank: rankIdx + 1,
      winProbability: winProbs[origIdx],
      strengthScore: entries[origIdx].score,
    }));

    const horsesWithHistory = entries.filter((e) => e.hasHistory).length;
    const confidenceLevel = Math.round(
      40 + 60 * (horsesWithHistory / entries.length),
    );

    const horsesForLlm: HorsePredictionMeta[] = rankings.map((r) => {
      const entry = entries.find((e) => e.horseId.equals(r.horseId))!;
      return {
        ...entry.meta,
        predictedRank: r.predictedRank,
        winProbability: r.winProbability,
        strengthScore: r.strengthScore,
      };
    });

    const llmReasoning = await this.llm.generatePredictionReasoning(
      horsesForLlm,
      {
        raceName: race.name,
        distanceMeters: race.distanceMeters,
        raceType: race.raceType,
        trackCondition: race.trackCondition,
        weather: race.weather,
      },
    );
    const source = llmReasoning
      ? PredictionSource.LLM
      : PredictionSource.RULE_BASED;
    const reasoning =
      llmReasoning ??
      'Dự đoán được tổng hợp từ lịch sử thi đấu và các chỉ số sức mạnh của từng ngựa.';

    return this.predictionModel.findOneAndUpdate(
      { raceId: new Types.ObjectId(raceId) },
      {
        $set: {
          rankings,
          source,
          confidenceLevel,
          reasoning,
          generatedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    ).populate('rankings.horseId', 'name breed') as Promise<AIPredictionSuggestionDocument>;
  }

  private async buildEntry(
    reg: RegistrationDocument,
    raceDate: Date,
  ): Promise<EntryData> {
    const fallback = (horseId: Types.ObjectId): EntryData => ({
      horseId,
      score: 50,
      hasHistory: false,
      meta: {
        name: 'Ngựa',
        healthStatus: 'HEALTHY',
        winCount: 0,
        totalRaces: 0,
        recentRanks: [],
        avgSpeedKmh: 0,
      },
    });

    try {
      const horseId = reg.horseId;
      const horse = await this.horseModel.findById(horseId);
      if (!horse) return fallback(horseId);

      const results = await this.raceResultModel
        .find({ horseId })
        .sort({ createdAt: -1 })
        .limit(20);

      const records = await this.raceRecordModel
        .find({ horseId })
        .sort({ createdAt: -1 })
        .limit(10);

      let jockey: JockeyDocument | null = null;
      if (reg.jockeyUserId) {
        jockey = await this.jockeyModel.findOne({ userId: reg.jockeyUserId });
      }

      const lastRaceDate =
        results.length > 0
          ? new Date(
              (results[0] as RaceResultDocument & { createdAt?: Date })
                .createdAt ?? 0,
            )
          : null;

      const scoreResult = this.strengthScore.compute(
        horse,
        results,
        records,
        jockey,
        lastRaceDate,
        raceDate,
      );

      const winCount = results.filter((r) => r.rank === 1).length;
      const recentRanks = results
        .slice(0, 3)
        .map((r) => r.rank)
        .filter((r): r is number => r != null);
      const avgSpeedKmh =
        records.length > 0
          ? records.reduce((sum, r) => sum + (r.speed ?? 0), 0) / records.length
          : 0;

      return {
        horseId,
        score: scoreResult.strengthScore,
        hasHistory: results.length > 0,
        meta: {
          name: horse.name,
          breed: horse.breed,
          age: horse.age,
          healthStatus: horse.healthStatus,
          winCount,
          totalRaces: results.length,
          recentRanks,
          avgSpeedKmh,
          jockeySkill: jockey?.skillLevel,
        },
      };
    } catch {
      return fallback(reg.horseId);
    }
  }
}

function softmax(scores: number[], temperature = 15): number[] {
  if (!scores.length) return [];
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - max) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
