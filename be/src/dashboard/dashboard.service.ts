import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Horse, HorseDocument, HorseStatus } from '../horses/schemas/horse.schema';
import { Tournament, TournamentDocument } from '../tournaments/schemas/tournament.schema';
import { Race, RaceDocument } from '../races/schemas/race.schema';
import { Registration, RegistrationDocument } from '../registrations/schemas/registration.schema';
import { Prize, PrizeDocument, PrizePaymentStatus } from '../prizes/schemas/prize.schema';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';
import { RaceResult, RaceResultDocument, RaceResultStatus } from '../race-results/schemas/race-result.schema';
import { JockeyInvitation, JockeyInvitationDocument, InvitationStatus } from '../jockey-invitations/schemas/jockey-invitation.schema';
import { RefereeReport, RefereeReportDocument } from '../referee-reports/schemas/referee-report.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Horse.name) private horseModel: Model<HorseDocument>,
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Registration.name) private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Prize.name) private prizeModel: Model<PrizeDocument>,
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(RaceResult.name) private resultModel: Model<RaceResultDocument>,
    @InjectModel(JockeyInvitation.name) private invitationModel: Model<JockeyInvitationDocument>,
    @InjectModel(RefereeReport.name) private reportModel: Model<RefereeReportDocument>,
  ) {}

  async getAdminStats() {
    const [
      totalUsers,
      totalHorses,
      totalTournaments,
      totalRaces,
      totalPrizes,
      totalBets,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.horseModel.countDocuments({ status: { $ne: HorseStatus.DELETED } }),
      this.tournamentModel.countDocuments({ deletedAt: { $exists: false } }),
      this.raceModel.countDocuments({ deletedAt: { $exists: false } }),
      this.prizeModel.aggregate([
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.betModel.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            totalPayout: { $sum: '$payout' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      users: { total: totalUsers },
      horses: { total: totalHorses },
      tournaments: { total: totalTournaments },
      races: { total: totalRaces },
      prizes: totalPrizes.reduce(
        (acc, item) => {
          acc[item._id.toLowerCase()] = item.total;
          acc[`${item._id.toLowerCase()}Count`] = item.count;
          return acc;
        },
        { pending: 0, pendingCount: 0, paid: 0, paidCount: 0 },
      ),
      bets: totalBets.reduce(
        (acc, item) => {
          acc[item._id.toLowerCase()] = {
            count: item.count,
            amount: item.totalAmount,
            payout: item.totalPayout,
          };
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    };
  }

  async getOwnerStats(ownerId: string) {
    const [myHorsesCount, prizesResult, registrationsCount] = await Promise.all([
      this.horseModel.countDocuments({ ownerId, status: { $ne: HorseStatus.DELETED } }),
      this.prizeModel.aggregate([
        { $match: { ownerId: ownerId as any } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
          },
        },
      ]),
      this.registrationModel.countDocuments({ ownerId }),
    ]);

    const prizes = prizesResult.reduce(
      (acc, item) => {
        acc[item._id.toLowerCase()] = item.total;
        acc.total += item.total;
        return acc;
      },
      { pending: 0, paid: 0, total: 0 },
    );

    return {
      horses: { count: myHorsesCount },
      registrations: { count: registrationsCount },
      winnings: prizes,
    };
  }

  async getJockeyStats(jockeyUserId: string) {
    // 1. Find jockey results
    const results = await this.resultModel.find({
      jockeyId: jockeyUserId,
      status: RaceResultStatus.PUBLISHED,
    });

    const totalRaces = results.length;
    const wins = results.filter((r) => r.rank === 1).length;
    const totalPoints = results.reduce((sum, r) => sum + (r.points ?? 0), 0);

    // 2. Count active invitations
    const pendingInvites = await this.invitationModel.countDocuments({
      jockeyId: jockeyUserId as any,
      status: InvitationStatus.PENDING,
    });

    return {
      races: {
        participated: totalRaces,
        wins,
        winRate: totalRaces > 0 ? parseFloat(((wins / totalRaces) * 100).toFixed(2)) : 0,
      },
      totalPoints,
      invitations: {
        pendingCount: pendingInvites,
      },
    };
  }

  async getRefereeStats(refereeId: string) {
    const [assignedRacesCount, reportsSubmittedCount] = await Promise.all([
      this.raceModel.countDocuments({ refereeIds: refereeId as any, deletedAt: { $exists: false } }),
      this.reportModel.countDocuments({ refereeId }),
    ]);

    return {
      races: { assignedCount: assignedRacesCount },
      reports: { submittedCount: reportsSubmittedCount },
    };
  }

  async getSpectatorStats(userId: string) {
    const [betsResult, activeBetsCount] = await Promise.all([
      this.betModel.aggregate([
        { $match: { userId: userId as any } },
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            totalPayout: { $sum: '$payout' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.betModel.countDocuments({ userId: userId as any, status: 'PENDING' as any }),
    ]);

    const stats = betsResult.reduce(
      (acc, item) => {
        acc.totalAmount += item.totalAmount;
        acc.totalPayout += item.totalPayout;
        acc.totalBets += item.count;
        if (item._id === 'WON') acc.wonCount += item.count;
        if (item._id === 'LOST') acc.lostCount += item.count;
        return acc;
      },
      { totalAmount: 0, totalPayout: 0, totalBets: 0, wonCount: 0, lostCount: 0 },
    );

    const winRate =
      stats.wonCount + stats.lostCount > 0
        ? parseFloat(((stats.wonCount / (stats.wonCount + stats.lostCount)) * 100).toFixed(2))
        : 0;

    return {
      bets: {
        total: stats.totalBets,
        active: activeBetsCount,
        totalAmountBet: stats.totalAmount,
        totalPayoutReceived: stats.totalPayout,
        winRate,
      },
    };
  }
}
