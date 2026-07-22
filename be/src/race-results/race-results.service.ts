import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { RacesService } from '../races/races.service';
import { RaceStatus } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { CreateRaceResultDto } from './dto/create-race-result.dto';
import { UpdateRaceResultDto } from './dto/update-race-result.dto';
import { BulkRaceResultsDto } from './dto/bulk-race-results.dto';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultOutcome,
  RaceResultStatus,
  RaceIncident,
} from './schemas/race-result.schema';
import {
  PayoutNotifyIntent,
  PredictionsService,
} from '../predictions/predictions.service';
import { PrizesService } from '../prizes/prizes.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Jockey } from '../jockeys/schemas/jockey.schema';
import { Horse, HorseDocument } from '../horses/schemas/horse.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';

import {
  RaceViolation,
  RaceViolationDocument,
  ViolationPenalty,
  ViolationSeverity,
} from '../race-violations/schemas/race-violation.schema';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';

/** Points by finishing rank */
const POINTS_MAP: Record<number, number> = { 1: 10, 2: 7, 3: 5, 4: 3 };
const DEFAULT_POINTS = 1;

@Injectable()
export class RaceResultsService {
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    @InjectModel(Jockey.name)
    private jockeyModel: Model<Jockey>,
    @InjectModel(Horse.name)
    private horseModel: Model<HorseDocument>,
    @InjectModel(RaceViolation.name)
    private violationModel: Model<RaceViolationDocument>,
    private racesService: RacesService,
    private prizesService: PrizesService,
    private predictionsService: PredictionsService,
    private auditLogsService: AuditLogsService,
    private notificationsService: NotificationsService,
    @InjectConnection() private connection: Connection,
    private ledgerService: RewardPointLedgerService,
  ) {}

  private async validateRefereeAssigned(
    raceId: string,
    refereeUserId: string,
  ): Promise<void> {
    const assignment = await this.assignmentModel.findOne({
      raceId: new Types.ObjectId(raceId),
      refereeUserId: new Types.ObjectId(refereeUserId),
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You are not an accepted referee for this race',
      );
    }
  }

  async simulateRaceResults(
    raceId: string,
    refereeId: string,
  ): Promise<RaceResultDocument[]> {
    const race = await this.racesService.findOne(raceId);
    if (race.status !== RaceStatus.LIVE) {
      throw new BadRequestException(
        'Chỉ có thể giả lập kết quả cho cuộc đua có trạng thái LIVE',
      );
    }
    await this.validateRefereeAssigned(raceId, refereeId);

    // Xóa kết quả nháp cũ nếu có
    await this.resultModel.deleteMany({ raceId: new Types.ObjectId(raceId) });

    // Lấy các đăng ký đã duyệt
    const registrations = await this.registrationModel
      .find({
        raceId: new Types.ObjectId(raceId),
        status: RegistrationStatus.APPROVED,
      })
      .populate('horseId')
      .exec();

    if (registrations.length === 0) {
      throw new BadRequestException(
        'Không có ngựa nào đăng ký hợp lệ trong cuộc đua này',
      );
    }

    interface SimulatedPerformance {
      registrationId: Types.ObjectId;
      horseId: Types.ObjectId;
      ownerId: Types.ObjectId;
      jockeyUserId?: Types.ObjectId;
      finishTimeMs?: number;
      incident: RaceIncident;
      outcome: RaceResultOutcome;
      rank?: number;
    }

    const simulatedPerformances: SimulatedPerformance[] = [];
    const distance = race.distanceMeters;

    // Thời gian chạy cơ sở (BaseTimeMs) = (distance / 15) * 1000
    const baseTimeMs = Math.round((distance / 15) * 1000);

    for (const reg of registrations) {
      const horse = reg.horseId as unknown as {
        _id: Types.ObjectId;
        baseSpeed?: number;
        staminaScore?: number;
        weightKg?: number;
      };

      // 1. Điểm thưởng sức mạnh ngựa (HorseMetricsBonus)
      const horseSpeed = horse.baseSpeed || 60;
      const horseStamina = horse.staminaScore || 70;
      const horseBonusMs = horseSpeed * 100 + horseStamina * 50;

      // 2. Điểm thưởng kỹ năng Jockey (JockeySkillBonus)
      let jockeyBonusMs = 0;
      if (reg.jockeyUserId) {
        const jockeyProfile = (await this.jockeyModel.findOne({
          userId: reg.jockeyUserId,
        })) as unknown as {
          skillLevel?: string;
          experienceYears?: number;
        } | null;
        if (jockeyProfile) {
          switch (jockeyProfile.skillLevel as string) {
            case 'professional':
              jockeyBonusMs += 3000;
              break;
            case 'advanced':
              jockeyBonusMs += 2000;
              break;
            case 'intermediate':
              jockeyBonusMs += 1000;
              break;
            case 'beginner':
              jockeyBonusMs += 200;
              break;
          }
          const exp = jockeyProfile.experienceYears || 0;
          jockeyBonusMs += Math.min(exp * 100, 1000);
        }
      }

      // 3. Điểm thưởng thích ứng môi trường (RaceConditionBonus)
      let conditionBonusMs = 0;
      const track = (race.trackCondition as string) || 'Dry';
      const weather = race.weatherSnapshot || 'Sunny';

      const isDryTrack =
        track === 'Dry' ||
        track === 'Dry turf' ||
        track === 'GOOD' ||
        track === 'FIRM';
      const isMuddyTrack =
        track === 'Muddy' || track === 'MUDDY' || track === 'HEAVY';

      if (weather === 'Sunny' && isDryTrack) {
        conditionBonusMs += 2000; // Chạy nhanh hơn 2s
      } else if (weather === 'Rainy' || weather === 'Stormy') {
        conditionBonusMs -= 6000; // Chạy chậm đi 6s
      }

      if (isMuddyTrack) {
        const weight = horse.weightKg || 450;
        conditionBonusMs -= weight < 450 ? 4000 : 1000; // Ngựa nhẹ bị phạt nặng hơn
      }

      // 4. Phong độ ngẫu nhiên trong ngày (DailyFormBonus: từ -2000ms đến +2000ms)
      const dailyFormBonusMs = Math.floor(Math.random() * 4001) - 2000;

      // 5. Xác định Biến cố ngẫu nhiên (Incident & IncidentDelayMs)
      let incident = RaceIncident.NONE;
      let incidentDelayMs = 0;
      let outcome = RaceResultOutcome.FINISHED;

      const rand = Math.random() * 100;
      if (rand < 1) {
        // 1% Disqualified
        incident = RaceIncident.DISQUALIFIED;
        outcome = RaceResultOutcome.DISQUALIFIED;
      } else if (rand < 6) {
        // 5% Tired finish
        incident = RaceIncident.TIRED_FINISH;
        incidentDelayMs = 6000;
      } else if (rand < 13) {
        // 7% Lose rhythm
        incident = RaceIncident.LOSE_RHYTHM;
        incidentDelayMs = 4500;
      } else if (rand < 20) {
        // 7% Bad start
        incident = RaceIncident.BAD_START;
        incidentDelayMs = 3000;
      }

      // 6. Tính toán trực tiếp thời gian hoàn thành (Finish Time Ms)
      let finishTimeMs: number | undefined = undefined;

      if (outcome === RaceResultOutcome.FINISHED) {
        // Công thức tính trực tiếp thời gian
        const calculatedTime =
          baseTimeMs -
          horseBonusMs -
          jockeyBonusMs -
          conditionBonusMs -
          dailyFormBonusMs +
          incidentDelayMs;

        // Giới hạn thời gian chạy tối thiểu để tránh bất hợp lý (Tốc độ tối đa không quá 22 m/s)
        const minAllowedTime = Math.round((distance / 22) * 1000);
        finishTimeMs = Math.max(minAllowedTime, calculatedTime);
      }

      simulatedPerformances.push({
        registrationId: reg._id,
        horseId: horse._id,
        ownerId: reg.ownerId,
        jockeyUserId: reg.jockeyUserId,
        finishTimeMs,
        incident,
        outcome,
      });
    }

    // 7. Sắp xếp thứ hạng tự động
    const finishedHorses = simulatedPerformances.filter(
      (h) => h.outcome === RaceResultOutcome.FINISHED,
    );
    const disqualifiedHorses = simulatedPerformances.filter(
      (h) => h.outcome !== RaceResultOutcome.FINISHED,
    );

    // Sắp xếp tăng dần theo thời gian chạy (ngắn nhất lên đầu)
    finishedHorses.sort(
      (a, b) => (a.finishTimeMs || 0) - (b.finishTimeMs || 0),
    );

    finishedHorses.forEach((horse, idx) => {
      horse.rank = idx + 1;
    });

    const finalResults = [...finishedHorses, ...disqualifiedHorses];

    // 8. Lưu kết quả vào DB dưới dạng DRAFT
    await Promise.all(
      finalResults.map((res) => {
        const points = res.rank ? (POINTS_MAP[res.rank] ?? DEFAULT_POINTS) : 0;
        let note = 'Tự động giả lập kết quả.';
        if (res.incident !== RaceIncident.NONE) {
          note += ` Biến cố xảy ra: ${res.incident}.`;
        }

        return this.resultModel.create({
          tournamentId: race.tournamentId,
          raceId: new Types.ObjectId(raceId),
          raceRegistrationId: res.registrationId,
          horseId: res.horseId,
          ownerId: res.ownerId,
          jockeyUserId: res.jockeyUserId,
          rank: res.rank,
          finishTimeMs: res.finishTimeMs,
          rawFinishTimeMs: res.finishTimeMs,
          outcome: res.outcome,
          incident: res.incident,
          points,
          prizeAmount: 0,
          status: RaceResultStatus.DRAFT,
          recordedBy: new Types.ObjectId(refereeId),
          note,
        });
      }),
    );

    // Cập nhật trạng thái cuộc đua sang FINISHED
    await this.racesService.updateStatus(raceId, RaceStatus.FINISHED);

    // Áp dụng các vi phạm thực tế đã ghi nhận trước/trong cuộc đua vào kết quả nháp
    await this.applyViolationsToResults(raceId);

    return this.resultModel
      .find({ raceId: new Types.ObjectId(raceId) })
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ rank: 1 })
      .exec();
  }

  async create(
    dto: CreateRaceResultDto,
    recordedBy: string,
  ): Promise<RaceResultDocument> {
    const race = await this.racesService.findOne(dto.raceId);

    // Race must be LIVE or FINISHED to record results
    if (
      race.status !== RaceStatus.LIVE &&
      race.status !== RaceStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Can only record results for LIVE or FINISHED races',
      );
    }

    // Only accepted referee can record
    await this.validateRefereeAssigned(dto.raceId, recordedBy);

    // Cross-field validation: rank ↔ outcome
    if (dto.outcome === RaceResultOutcome.FINISHED && !dto.rank) {
      throw new BadRequestException(
        'rank is required when outcome is FINISHED',
      );
    }
    if (dto.outcome !== RaceResultOutcome.FINISHED && dto.rank) {
      throw new BadRequestException(
        'rank must not be set for non-FINISHED outcomes',
      );
    }

    // Validate registration exists and is APPROVED
    const registration = await this.registrationModel.findById(
      dto.raceRegistrationId,
    );
    if (!registration || registration.status !== RegistrationStatus.APPROVED) {
      throw new BadRequestException(
        'Registration not found or not approved for this race',
      );
    }

    // Duplicate horse check
    const existingHorse = await this.resultModel.findOne({
      raceId: new Types.ObjectId(dto.raceId),
      horseId: new Types.ObjectId(dto.horseId),
    });
    if (existingHorse) {
      throw new ConflictException(
        'Result already exists for this horse in this race',
      );
    }

    // Rank duplicate check (only for FINISHED outcome)
    if (dto.outcome === RaceResultOutcome.FINISHED && dto.rank) {
      const existingRank = await this.resultModel.findOne({
        raceId: new Types.ObjectId(dto.raceId),
        rank: dto.rank,
        outcome: RaceResultOutcome.FINISHED,
      });
      if (existingRank) {
        throw new BadRequestException(
          `Rank ${dto.rank} is already taken in this race`,
        );
      }
    }

    const points =
      dto.outcome === RaceResultOutcome.FINISHED && dto.rank
        ? (POINTS_MAP[dto.rank] ?? DEFAULT_POINTS)
        : 0;

    const result = await this.resultModel.create({
      tournamentId: race.tournamentId,
      raceId: new Types.ObjectId(dto.raceId),
      raceRegistrationId: new Types.ObjectId(dto.raceRegistrationId),
      horseId: new Types.ObjectId(dto.horseId),
      ownerId: registration.ownerId,
      jockeyUserId: registration.jockeyUserId,
      rank: dto.rank,
      finishTimeMs: dto.finishTimeMs,
      rawFinishTimeMs: dto.finishTimeMs,
      outcome: dto.outcome,
      points,
      prizeAmount: 0,
      note: dto.note,
      recordedBy: new Types.ObjectId(recordedBy),
    });

    await this.applyViolationsToResults(dto.raceId);
    return this.resultModel
      .findById(result._id)
      .exec() as unknown as RaceResultDocument;
  }

  async findByRace(raceId: string, user?: JwtUser) {
    const isPrivileged =
      user &&
      user.roles &&
      (user.roles.includes(RoleName.ADMIN) ||
        user.roles.includes(RoleName.REFEREE));

    const statusFilter = isPrivileged
      ? {
          $in: [
            RaceResultStatus.DRAFT,
            RaceResultStatus.CONFIRMED,
            RaceResultStatus.PUBLISHED,
          ],
        }
      : RaceResultStatus.PUBLISHED;

    return this.resultModel
      .find({
        raceId: new Types.ObjectId(raceId),
        status: statusFilter,
      })
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ rank: 1 })
      .exec();
  }

  async findByTournament(tournamentId: string, user?: JwtUser) {
    const isPrivileged =
      user &&
      user.roles &&
      (user.roles.includes(RoleName.ADMIN) ||
        user.roles.includes(RoleName.REFEREE));

    const statusFilter = isPrivileged
      ? {
          $in: [
            RaceResultStatus.DRAFT,
            RaceResultStatus.CONFIRMED,
            RaceResultStatus.PUBLISHED,
          ],
        }
      : RaceResultStatus.PUBLISHED;

    return this.resultModel
      .find({
        tournamentId: new Types.ObjectId(tournamentId),
        status: statusFilter,
      })
      .populate('raceId', 'name raceNumber')
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .sort({ raceId: 1, rank: 1 })
      .exec();
  }

  async confirmResultsForRace(raceId: string, refereeId: string) {
    await this.validateRefereeAssigned(raceId, refereeId);

    const results = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
    });
    if (results.length === 0) {
      throw new BadRequestException('No results recorded for this race yet');
    }

    // All results must be DRAFT to confirm
    const alreadyConfirmed = results.some(
      (r) => r.status === RaceResultStatus.CONFIRMED,
    );
    if (alreadyConfirmed) {
      throw new BadRequestException('Results have already been confirmed');
    }

    // All APPROVED registrations must have a result
    const approvedCount = await this.registrationModel.countDocuments({
      raceId: new Types.ObjectId(raceId),
      status: RegistrationStatus.APPROVED,
    });
    if (results.length < approvedCount) {
      throw new BadRequestException(
        `Results are incomplete. Recorded ${results.length}/${approvedCount} horses.`,
      );
    }

    // Quy đổi và cộng dồn tất cả các vi phạm đã ghi nhận vào kết quả trước khi trọng tài xác nhận
    await this.applyViolationsToResults(raceId);

    await this.resultModel.updateMany(
      { raceId: new Types.ObjectId(raceId), status: RaceResultStatus.DRAFT },
      {
        $set: {
          status: RaceResultStatus.CONFIRMED,
          confirmedBy: refereeId,
          confirmedAt: new Date(),
        },
      },
    );

    // Cập nhật trạng thái cuộc đua sang FINISHED nếu cuộc đua đang ở trạng thái LIVE
    const race = await this.racesService.findOne(raceId);
    if (race.status === RaceStatus.LIVE) {
      await this.racesService.updateStatus(raceId, RaceStatus.FINISHED);
    }

    return { message: 'Results confirmed by referee' };
  }

  async rejectResultsForRace(raceId: string, rejectedBy: string) {
    const race = await this.racesService.findOne(raceId);

    if (race.status !== RaceStatus.FINISHED) {
      throw new BadRequestException(
        'Chỉ có thể từ chối kết quả khi cuộc đua ở trạng thái FINISHED',
      );
    }

    const results = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
    });

    if (results.length === 0) {
      throw new BadRequestException(
        'Không có kết quả nào để từ chối cho cuộc đua này',
      );
    }

    // Không cho reject nếu đã PUBLISHED
    const hasPublished = results.some(
      (r) => r.status === RaceResultStatus.PUBLISHED,
    );
    if (hasPublished) {
      throw new BadRequestException(
        'Không thể từ chối kết quả đã được công bố (PUBLISHED)',
      );
    }

    // Xóa tất cả kết quả (DRAFT hoặc CONFIRMED)
    await this.resultModel.deleteMany({
      raceId: new Types.ObjectId(raceId),
    });

    // Chuyển race về READY (sẵn sàng) để trọng tài có thể chạy lại
    await this.racesService.updateStatus(raceId, RaceStatus.READY);

    await this.auditLogsService.log({
      actorId: rejectedBy,
      action: 'race_result.reject',
      entityType: 'Race',
      entityId: raceId,
      after: {
        status: 'READY',
        deletedResults: results.length,
        reason: 'Admin rejected results for re-run',
      },
    });

    return {
      message: `Đã từ chối ${results.length} kết quả. Cuộc đua đã chuyển về trạng thái READY (sẵn sàng) để chạy lại.`,
      deletedCount: results.length,
    };
  }

  async publishByRace(raceId: string, publishedBy: string) {
    const race = await this.racesService.findOne(raceId);

    if (race.status !== RaceStatus.FINISHED) {
      throw new BadRequestException(
        'Race must be in FINISHED status before results can be published',
      );
    }

    const results = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
    });
    if (results.length === 0) {
      throw new BadRequestException('No results to publish for this race');
    }

    const unconfirmed = results.some(
      (r) => r.status !== RaceResultStatus.CONFIRMED,
    );
    if (unconfirmed) {
      throw new BadRequestException(
        'Cannot publish: some results are not confirmed by the referee yet',
      );
    }

    const prizeByRank: Record<number, number> = { 1: race.prize ?? 0 };
    const now = new Date();

    let notifyIntents: PayoutNotifyIntent[] = [];

    // Execute sequentially without transaction (standalone MongoDB does not support multi-doc transactions)
    await Promise.all(
      results.map((result) => {
        const prizeAmount =
          result.outcome === RaceResultOutcome.FINISHED && result.rank
            ? (prizeByRank[result.rank] ?? 0)
            : 0;
        return this.resultModel.findByIdAndUpdate(result._id, {
          $set: {
            status: RaceResultStatus.PUBLISHED,
            prizeAmount,
            publishedBy,
            publishedAt: now,
          },
        });
      }),
    );

    await this.racesService.setStatus(raceId, RaceStatus.RESULT_PUBLISHED);

    await this.prizesService.createPrizesForRace(raceId);

    notifyIntents = await this.predictionsService.payoutBetsForRace(raceId);

    for (const result of results) {
      const pts = result.points ?? 0;
      if (result.outcome === RaceResultOutcome.FINISHED && pts > 0) {
        const alreadyCredited = await this.ledgerService.exists(
          String(result.ownerId),
          LedgerSourceType.RACE_WIN_REWARD,
          String(result._id),
        );
        if (!alreadyCredited) {
          await this.ledgerService.credit({
            userId: String(result.ownerId),
            points: pts,
            sourceType: LedgerSourceType.RACE_WIN_REWARD,
            sourceId: String(result._id),
            note: `Điểm thưởng hạng ${result.rank} giải đua`,
          });
        }
      }
    }

    // ── Sau commit: side-effect best-effort (không rollback tiền) ──
    await this.racesService.syncTournamentStatus(raceId);

    // Update cached win stats on Horse and Jockey documents (best-effort)
    try {
      for (const result of results) {
        const isWin =
          result.rank === 1 && result.outcome === RaceResultOutcome.FINISHED;

        await this.horseModel.findByIdAndUpdate(result.horseId, {
          $inc: { totalRaces: 1, winCount: isWin ? 1 : 0 },
        });

        if (result.jockeyUserId) {
          await this.jockeyModel.findOneAndUpdate(
            { userId: result.jockeyUserId },
            { $inc: { totalRaces: 1, winCount: isWin ? 1 : 0 } },
          );
        }
      }
    } catch (err) {
      console.error(
        'Failed to update cached win stats after race publish:',
        err,
      );
    }

    const winnerResult = results.find((r) => r.rank === 1);
    if (winnerResult) {
      await this.notificationsService.send(
        String(winnerResult.ownerId),
        'Chiến thắng vang dội!',
        `Chúc mừng! Chú ngựa của bạn đã giành chiến thắng vị trí thứ nhất trong cuộc đua ${race.name}.`,
        NotificationType.REWARD,
      );
    }

    for (const intent of notifyIntents) {
      await this.notificationsService.send(
        intent.userId,
        intent.title,
        intent.body,
        intent.type,
      );
    }

    await this.auditLogsService.log({
      actorId: publishedBy,
      action: 'race_result.publish',
      entityType: 'Race',
      entityId: raceId,
      after: { status: 'RESULT_PUBLISHED', resultCount: results.length },
    });

    return {
      message:
        'Results published, race marked as RESULT_PUBLISHED, prizes generated, predictions resolved',
    };
  }

  async applyViolationsToResults(raceId: string): Promise<void> {
    const publishedExists = await this.resultModel.exists({
      raceId: new Types.ObjectId(raceId),
      status: RaceResultStatus.PUBLISHED,
    });
    if (publishedExists) {
      throw new BadRequestException(
        'Không thể áp dụng vi phạm cho kết quả đã công bố',
      );
    }

    const results = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
    });
    if (results.length === 0) return;

    // Fetch all violations recorded for this race
    const violations = await this.violationModel.find({
      raceId: new Types.ObjectId(raceId),
    });

    const PENALTY_TIME_RULES: Record<ViolationSeverity, number> = {
      [ViolationSeverity.MINOR]: 3000,
      [ViolationSeverity.MAJOR]: 6000,
      [ViolationSeverity.CRITICAL]: 12000,
    };

    for (const result of results) {
      if (
        result.rawFinishTimeMs === undefined ||
        result.rawFinishTimeMs === null
      ) {
        result.rawFinishTimeMs = result.finishTimeMs;
      }

      // Find violations for this registration or horse
      const horseViolations = violations.filter(
        (v) =>
          String(v.horseId) === String(result.horseId) ||
          String(v.raceRegistrationId) === String(result.raceRegistrationId),
      );

      let penaltyTimeMs = 0;
      let isDisqualified = false;
      const notes: string[] = [];

      for (const vio of horseViolations) {
        if (vio.penalty === ViolationPenalty.DISQUALIFIED) {
          isDisqualified = true;
          notes.push(`Bị loại do lỗi: ${vio.type}`);
        } else if (vio.penalty === ViolationPenalty.TIME_PENALTY) {
          const penalty = PENALTY_TIME_RULES[vio.severity] ?? 0;
          penaltyTimeMs += penalty;
          notes.push(
            `+${penalty / 1000}s phạt do lỗi: ${vio.type} (${vio.severity})`,
          );
        } else if (vio.penalty === ViolationPenalty.WARNING) {
          notes.push(`Cảnh cáo do lỗi: ${vio.type}`);
        }
      }

      if (isDisqualified) {
        result.outcome = RaceResultOutcome.DISQUALIFIED;
        result.rank = undefined;
        result.finishTimeMs = undefined;
        result.points = 0;
      } else if (
        penaltyTimeMs > 0 &&
        result.outcome === RaceResultOutcome.FINISHED
      ) {
        if (result.rawFinishTimeMs) {
          result.finishTimeMs = result.rawFinishTimeMs + penaltyTimeMs;
        }
      } else {
        result.finishTimeMs = result.rawFinishTimeMs;
      }

      let baseNote = result.note || '';
      const splitIdx = baseNote.indexOf(' | Quy đổi phạt:');
      if (splitIdx !== -1) {
        baseNote = baseNote.substring(0, splitIdx);
      } else if (baseNote.startsWith('Quy đổi phạt:')) {
        baseNote = '';
      }

      if (notes.length > 0) {
        const violationNotes = notes.join(', ');
        result.note = baseNote
          ? `${baseNote} | Quy đổi phạt: ${violationNotes}`
          : `Quy đổi phạt: ${violationNotes}`;
      } else {
        result.note = baseNote || undefined;
      }

      await result.save();
    }

    // Recalculate ranks for all FINISHED outcomes in this race
    const finishedResults = await this.resultModel
      .find({
        raceId: new Types.ObjectId(raceId),
        outcome: RaceResultOutcome.FINISHED,
      })
      .sort({ finishTimeMs: 1 });

    for (let i = 0; i < finishedResults.length; i++) {
      const newRank = i + 1;
      finishedResults[i].rank = newRank;
      finishedResults[i].points = POINTS_MAP[newRank] ?? DEFAULT_POINTS;
      await finishedResults[i].save();
    }

    // Double check disqualified results
    const dqResults = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
      outcome: RaceResultOutcome.DISQUALIFIED,
    });
    for (const dq of dqResults) {
      dq.rank = undefined;
      dq.points = 0;
      await dq.save();
    }
  }

  async update(
    id: string,
    dto: UpdateRaceResultDto,
    refereeUserId: string,
  ): Promise<RaceResultDocument> {
    const result = await this.resultModel.findById(id);
    if (!result) {
      throw new NotFoundException('Race result not found');
    }

    await this.validateRefereeAssigned(String(result.raceId), refereeUserId);

    if (result.status !== RaceResultStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT results can be updated');
    }

    // Cross-field validation: rank ↔ outcome
    if (dto.outcome !== undefined || dto.rank !== undefined) {
      const outcome = dto.outcome ?? result.outcome;
      const rank = dto.rank !== undefined ? dto.rank : result.rank;

      if (outcome === RaceResultOutcome.FINISHED && !rank) {
        throw new BadRequestException(
          'rank is required when outcome is FINISHED',
        );
      }
      if (outcome !== RaceResultOutcome.FINISHED && rank) {
        throw new BadRequestException(
          'rank must not be set for non-FINISHED outcomes',
        );
      }
    }

    if (dto.outcome !== undefined) result.outcome = dto.outcome;
    if (dto.incident !== undefined) result.incident = dto.incident;
    if (dto.rank !== undefined) result.rank = dto.rank;
    if (dto.finishTimeMs !== undefined) {
      result.finishTimeMs = dto.finishTimeMs;
      result.rawFinishTimeMs = dto.finishTimeMs;
    }
    if (dto.note !== undefined) result.note = dto.note;

    if (result.outcome === RaceResultOutcome.FINISHED && result.rank) {
      result.points = POINTS_MAP[result.rank] ?? DEFAULT_POINTS;
    } else {
      result.points = 0;
      result.rank = undefined;
      result.finishTimeMs = undefined;
      result.rawFinishTimeMs = undefined;
    }

    const saved = await result.save();
    await this.applyViolationsToResults(String(saved.raceId));
    return this.resultModel
      .findById(id)
      .exec() as unknown as RaceResultDocument;
  }

  async bulkSave(
    raceId: string,
    dto: BulkRaceResultsDto,
    refereeUserId: string,
  ): Promise<RaceResultDocument[]> {
    const race = await this.racesService.findOne(raceId);

    if (
      race.status !== RaceStatus.LIVE &&
      race.status !== RaceStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Can only record results for LIVE or FINISHED races',
      );
    }

    await this.validateRefereeAssigned(raceId, refereeUserId);

    // Save/update each result
    for (const item of dto.results) {
      // Find existing result
      const result = await this.resultModel.findOne({
        raceId: new Types.ObjectId(raceId),
        horseId: new Types.ObjectId(item.horseId),
      });

      const points =
        item.outcome === RaceResultOutcome.FINISHED && item.rank
          ? (POINTS_MAP[item.rank] ?? DEFAULT_POINTS)
          : 0;

      if (result) {
        if (result.status !== RaceResultStatus.DRAFT) {
          throw new BadRequestException(
            `Result for horse ${item.horseId} has already been confirmed/published and cannot be updated`,
          );
        }

        result.outcome = item.outcome;
        result.incident = item.incident ?? RaceIncident.NONE;
        result.rank = item.rank;
        result.finishTimeMs = item.finishTimeMs;
        result.rawFinishTimeMs = item.finishTimeMs;
        result.note = item.note;
        result.points = points;
        await result.save();
      } else {
        // Validate registration
        const registration = await this.registrationModel.findById(
          item.raceRegistrationId,
        );
        if (
          !registration ||
          registration.status !== RegistrationStatus.APPROVED
        ) {
          throw new BadRequestException(
            `Registration ${item.raceRegistrationId} not found or not approved for this race`,
          );
        }

        await this.resultModel.create({
          tournamentId: race.tournamentId,
          raceId: new Types.ObjectId(raceId),
          raceRegistrationId: new Types.ObjectId(item.raceRegistrationId),
          horseId: new Types.ObjectId(item.horseId),
          ownerId: registration.ownerId,
          jockeyUserId: registration.jockeyUserId,
          rank: item.rank,
          finishTimeMs: item.finishTimeMs,
          rawFinishTimeMs: item.finishTimeMs,
          outcome: item.outcome,
          incident: item.incident ?? RaceIncident.NONE,
          points,
          prizeAmount: 0,
          status: RaceResultStatus.DRAFT,
          recordedBy: new Types.ObjectId(refereeUserId),
          note: item.note,
        });
      }
    }

    // Auto-update race status to FINISHED if it was LIVE
    if (race.status === RaceStatus.LIVE) {
      await this.racesService.updateStatus(raceId, RaceStatus.FINISHED);
    }

    // Apply violations and recalculate ranks
    await this.applyViolationsToResults(raceId);

    return this.resultModel
      .find({ raceId: new Types.ObjectId(raceId) })
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ rank: 1 })
      .exec();
  }
}
