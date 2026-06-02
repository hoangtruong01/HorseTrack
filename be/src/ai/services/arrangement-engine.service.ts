import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
  Tournament,
  type TournamentDocument,
} from '../../tournaments/schemas/tournament.schema';
import {
  Registration,
  type RegistrationDocument,
  RegistrationStatus,
} from '../../registrations/schemas/registration.schema';
import { Horse, type HorseDocument } from '../../horses/schemas/horse.schema';
import { HorseHealthStatus } from '../../horses/schemas/horse.schema';
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
import { Race, type RaceDocument } from '../../races/schemas/race.schema';
import { RaceStatus } from '../../races/schemas/race.schema';
import {
  AIRaceArrangementSuggestion,
  type AIRaceArrangementSuggestionDocument,
  ArrangementStatus,
} from '../schemas/ai-race-arrangement-suggestion.schema';
import {
  TrackCondition,
  WeatherCondition,
  RaceType,
} from '../../common/enums/race.enums';
import { StrengthScoreService } from './strength-score.service';
import { LlmService } from './llm.service';
import { ConfigService } from '@nestjs/config';

const DEFAULT_DISTANCE = 1000;
const DEFAULT_MAX_PER_RACE = 8;

interface HorseData {
  registration: RegistrationDocument;
  horse: HorseDocument;
  jockey: JockeyDocument | null;
  score: number;
  ownerId: string;
  jockeyId: string | null;
}

@Injectable()
export class ArrangementEngineService {
  private readonly spreadThreshold: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(RaceResult.name)
    private raceResultModel: Model<RaceResultDocument>,
    @InjectModel(RaceRecord.name)
    private raceRecordModel: Model<RaceRecordDocument>,
    @InjectModel(Jockey.name) private jockeyModel: Model<JockeyDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(AIRaceArrangementSuggestion.name)
    private arrangementModel: Model<AIRaceArrangementSuggestionDocument>,
    private readonly strengthScore: StrengthScoreService,
    private readonly llm: LlmService,
    private readonly config: ConfigService,
  ) {
    this.spreadThreshold = this.config.get<number>(
      'AI_STRENGTH_SPREAD_THRESHOLD',
      15,
    );
  }

  async generateForTournament(
    tournamentId: string,
  ): Promise<AIRaceArrangementSuggestionDocument> {
    const tournament = await this.tournamentModel.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} không tồn tại`);
    }

    const registrations = await this.registrationModel.find({
      tournamentId: new Types.ObjectId(tournamentId),
      status: RegistrationStatus.APPROVED,
    });

    if (!registrations.length) {
      throw new BadRequestException(
        'Tournament chưa có ngựa đăng ký hợp lệ để sắp xếp',
      );
    }

    const horseDataList = await this.buildHorseDataList(
      registrations,
      tournament.startDate,
    );

    const validHorses = horseDataList.filter(
      (h) => h.horse.healthStatus !== HorseHealthStatus.INJURED,
    );

    if (!validHorses.length) {
      throw new BadRequestException(
        'Không có ngựa hợp lệ (không bị chấn thương) để sắp xếp',
      );
    }

    const raceCount = Math.ceil(validHorses.length / DEFAULT_MAX_PER_RACE);
    const groups = snakeDraft(validHorses, raceCount);
    const baseTime = tournament.startDate;

    const proposedRaces = groups.map((group, idx) => {
      const scores = group.map((h) => h.score);
      const avgStrength = scores.reduce((a, b) => a + b, 0) / scores.length;
      const strengthSpread = Math.max(...scores) - Math.min(...scores);
      const startTime = new Date(baseTime.getTime() + idx * 3_600_000);

      return {
        entries: group.map((h) => ({
          horseId: h.horse._id,
          strengthScore: h.score,
          jockeyUserId: h.jockey ? h.jockey._id : undefined,
        })),
        raceType: RaceType.NORMAL,
        distanceMeters: DEFAULT_DISTANCE,
        maxParticipants: DEFAULT_MAX_PER_RACE,
        startTime,
        trackCondition: TrackCondition.GOOD,
        weather: WeatherCondition.SUNNY,
        avgStrength: Math.round(avgStrength * 100) / 100,
        strengthSpread: Math.round(strengthSpread * 100) / 100,
      };
    });

    const fairnessReport = this.buildFairnessReport(groups, proposedRaces);

    const horsesByRace = groups.map((group) =>
      group.map((h) => ({
        name: h.horse.name,
        strengthScore: h.score,
        jockeySkill: h.jockey?.skillLevel,
      })),
    );

    const reasoning =
      (await this.llm.generateArrangementReasoning(
        tournament.name,
        proposedRaces,
        horsesByRace,
      )) ??
      'Đề xuất sắp xếp được tạo tự động dựa trên điểm sức mạnh của các ngựa nhằm đảm bảo cân bằng giữa các race trong giải đấu.';

    return this.arrangementModel.create({
      tournamentId: new Types.ObjectId(tournamentId),
      proposedRaces,
      fairnessReport,
      reasoning,
      status: ArrangementStatus.PENDING,
      createdRaceIds: [],
    });
  }

  async applyArrangement(
    suggestionId: string,
    adminId: string,
  ): Promise<AIRaceArrangementSuggestionDocument> {
    const suggestion = await this.arrangementModel.findById(suggestionId);
    if (!suggestion) {
      throw new NotFoundException('Arrangement suggestion không tồn tại');
    }
    if (suggestion.status !== ArrangementStatus.PENDING) {
      throw new BadRequestException(
        `Chỉ có thể áp dụng đề xuất đang ở trạng thái PENDING (hiện tại: ${suggestion.status})`,
      );
    }

    const session: ClientSession = await this.connection.startSession();
    try {
      session.startTransaction();

      const createdRaceIds: Types.ObjectId[] = [];

      for (const [idx, proposed] of suggestion.proposedRaces.entries()) {
        const race = await this.raceModel.create(
          [
            {
              tournamentId: suggestion.tournamentId,
              name: `Race ${idx + 1} (AI)`,
              startTime: proposed.startTime,
              distanceMeters: proposed.distanceMeters,
              maxParticipants: proposed.maxParticipants,
              status: RaceStatus.SCHEDULED,
              trackCondition: proposed.trackCondition,
              weather: proposed.weather,
              raceType: proposed.raceType,
              createdBy: new Types.ObjectId(adminId),
            },
          ],
          { session },
        );
        createdRaceIds.push(race[0]._id);
      }

      suggestion.status = ArrangementStatus.APPLIED;
      suggestion.createdRaceIds = createdRaceIds;
      await suggestion.save({ session });

      await session.commitTransaction();
      return suggestion;
    } catch (err: unknown) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  private async buildHorseDataList(
    registrations: RegistrationDocument[],
    raceDate: Date,
  ): Promise<HorseData[]> {
    const results = await Promise.all(
      registrations.map(async (reg): Promise<HorseData | null> => {
        try {
          const horse = await this.horseModel.findById(reg.horseId);
          if (!horse) return null;

          const raceResults = await this.raceResultModel
            .find({ horseId: reg.horseId })
            .sort({ createdAt: -1 })
            .limit(20);

          const records = await this.raceRecordModel
            .find({ horseId: reg.horseId })
            .sort({ createdAt: -1 })
            .limit(10);

          let jockey: JockeyDocument | null = null;
          if (reg.jockeyUserId) {
            jockey = await this.jockeyModel.findOne({
              userId: reg.jockeyUserId,
            });
          }

          const lastRaceDate =
            raceResults.length > 0
              ? new Date(
                  (raceResults[0] as RaceResultDocument & { createdAt?: Date })
                    .createdAt ?? 0,
                )
              : null;

          const scoreResult = this.strengthScore.compute(
            horse,
            raceResults,
            records,
            jockey,
            lastRaceDate,
            raceDate,
          );

          const data: HorseData = {
            registration: reg,
            horse,
            jockey,
            score: scoreResult.strengthScore,
            ownerId: reg.ownerId.toString(),
            jockeyId: reg.jockeyUserId?.toString() ?? null,
          };
          return data;
        } catch {
          return null;
        }
      }),
    );
    return results.filter((h): h is HorseData => h !== null);
  }

  private buildFairnessReport(
    groups: HorseData[][],
    proposedRaces: { avgStrength: number; strengthSpread: number }[],
  ): {
    avgStrengthPerRace: number[];
    strengthSpreadPerRace: number[];
    violations: string[];
  } {
    const violations: string[] = [];

    for (const [idx, group] of groups.entries()) {
      const ownerIds = group.map((h) => h.ownerId);
      const uniqueOwners = new Set(ownerIds);
      if (ownerIds.length !== uniqueOwners.size) {
        violations.push(`Race ${idx + 1}: có nhiều ngựa cùng chủ sở hữu`);
      }

      if (proposedRaces[idx].strengthSpread > this.spreadThreshold) {
        violations.push(
          `Race ${idx + 1}: độ lệch sức mạnh (${proposedRaces[idx].strengthSpread.toFixed(1)}) vượt ngưỡng ${this.spreadThreshold}`,
        );
      }
    }

    const jockeyRaceMap = new Map<string, number[]>();
    for (const [idx, group] of groups.entries()) {
      for (const horse of group) {
        if (!horse.jockeyId) continue;
        const existing = jockeyRaceMap.get(horse.jockeyId) ?? [];
        existing.push(idx);
        jockeyRaceMap.set(horse.jockeyId, existing);
      }
    }
    for (const [jId, raceIdxs] of jockeyRaceMap.entries()) {
      if (raceIdxs.length > 1) {
        violations.push(
          `Jockey ${jId} được phân vào nhiều race: ${raceIdxs.map((i) => i + 1).join(', ')}`,
        );
      }
    }

    return {
      avgStrengthPerRace: proposedRaces.map((r) => r.avgStrength),
      strengthSpreadPerRace: proposedRaces.map((r) => r.strengthSpread),
      violations,
    };
  }
}

function snakeDraft<T extends { score: number }>(
  items: T[],
  groupCount: number,
): T[][] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const groups: T[][] = Array.from({ length: groupCount }, () => []);

  let forward = true;
  let groupIdx = 0;

  for (const item of sorted) {
    groups[groupIdx].push(item);

    if (forward) {
      if (groupIdx === groupCount - 1) {
        forward = false;
      } else {
        groupIdx++;
      }
    } else {
      if (groupIdx === 0) {
        forward = true;
      } else {
        groupIdx--;
      }
    }
  }

  return groups;
}
