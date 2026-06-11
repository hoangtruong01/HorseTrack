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
  Registration,
  RegistrationDocument,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
  RefereeRole,
} from '../referee-assignments/schemas/referee-assignment.schema';
import {
  Prize,
  PrizeDocument,
  PrizePaymentStatus,
} from './schemas/prize.schema';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';

@Injectable()
export class PrizesService {
  constructor(
    @InjectModel(Prize.name) private prizeModel: Model<PrizeDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    private ledgerService: RewardPointLedgerService,
  ) {}

  /** Generate prize for the race winner when results are published and credit wallets */
  async createPrizesForRace(raceId: string): Promise<PrizeDocument[]> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');

    const createdPrizes: PrizeDocument[] = [];
    const totalPrize = race.prize ?? 0;

    if (totalPrize > 0) {
      const winnerResult = await this.resultModel.findOne({
        raceId,
        status: RaceResultStatus.PUBLISHED,
        rank: 1,
      });

      if (winnerResult) {
        const horse = await this.horseModel.findById(winnerResult.horseId);
        if (horse) {
          // Read jockeySharePercent from registration (fallback to 30% if not set)
          let jockeySharePct = 30;
          const registration = await this.registrationModel.findOne({
            raceId,
            horseId: winnerResult.horseId,
          });
          if (registration?.jockeySharePercent) {
            jockeySharePct = registration.jockeySharePercent;
          }

          const ownerSharePct = 100 - jockeySharePct;
          const ownerAmount = Math.round(totalPrize * (ownerSharePct / 100));
          const jockeyAmount = totalPrize - ownerAmount;

          // 1. Process Horse Owner Prize
          if (ownerAmount > 0 && horse.ownerId) {
            const existingOwnerPrize = await this.prizeModel.findOne({
              raceId,
              horseId: winnerResult.horseId,
              ownerId: horse.ownerId,
            });

            if (!existingOwnerPrize) {
              // Credit owner's ledger directly
              await this.ledgerService.credit({
                userId: String(horse.ownerId),
                points: ownerAmount,
                sourceType: LedgerSourceType.RACE_WIN_REWARD,
                sourceId: raceId,
                note: `Received ${ownerSharePct}% winner reward for race "${race.name}" (Horse: ${horse.name})`,
              });

              const ownerPrize = await this.prizeModel.create({
                tournamentId: race.tournamentId,
                raceId: new Types.ObjectId(raceId),
                horseId: winnerResult.horseId,
                ownerId: horse.ownerId,
                rank: 1,
                amount: ownerAmount,
                status: PrizePaymentStatus.PAID,
                paidAt: new Date(),
              });
              createdPrizes.push(ownerPrize);
            }
          }

          // 2. Process Jockey Prize
          if (jockeyAmount > 0 && winnerResult.jockeyUserId) {
            const existingJockeyPrize = await this.prizeModel.findOne({
              raceId,
              horseId: winnerResult.horseId,
              ownerId: winnerResult.jockeyUserId,
            });

            if (!existingJockeyPrize) {
              // Credit jockey's ledger directly
              await this.ledgerService.credit({
                userId: String(winnerResult.jockeyUserId),
                points: jockeyAmount,
                sourceType: LedgerSourceType.RACE_WIN_REWARD,
                sourceId: raceId,
                note: `Received ${jockeySharePct}% winner reward for race "${race.name}" (Jockey share)`,
              });

              const jockeyPrize = await this.prizeModel.create({
                tournamentId: race.tournamentId,
                raceId: new Types.ObjectId(raceId),
                horseId: winnerResult.horseId,
                ownerId: winnerResult.jockeyUserId,
                rank: 1,
                amount: jockeyAmount,
                status: PrizePaymentStatus.PAID,
                paidAt: new Date(),
              });
              createdPrizes.push(jockeyPrize);
            }
          }
        }
      }
    }

    // 3. Process Referee Salaries
    const refereeAssignments = await this.assignmentModel.find({
      raceId: new Types.ObjectId(raceId),
      status: RefereeAssignmentStatus.ACCEPTED,
    });

    for (const ass of refereeAssignments) {
      if (ass.salary > 0 && ass.refereeUserId) {
        const alreadyPaid = await this.ledgerService.exists(
          String(ass.refereeUserId),
          LedgerSourceType.REFEREE_SALARY,
          raceId,
        );

        if (!alreadyPaid) {
          await this.ledgerService.credit({
            userId: String(ass.refereeUserId),
            points: ass.salary,
            sourceType: LedgerSourceType.REFEREE_SALARY,
            sourceId: raceId,
            note: `Lương điều hành cuộc đua "${race.name}" với vai trò ${
              ass.role === RefereeRole.MAIN ? 'Trọng tài chính' : 'Trọng tài phụ'
            }`,
          });
        }
      }
    }

    return createdPrizes;
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
