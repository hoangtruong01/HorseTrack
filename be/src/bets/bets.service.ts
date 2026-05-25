import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Race, RaceDocument, RaceStatus } from '../races/schemas/race.schema';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import { Bet, BetDocument, BetStatus } from './schemas/bet.schema';
import { CreateBetDto } from './dto/create-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
  ) {}

  async create(dto: CreateBetDto, userId: string): Promise<BetDocument> {
    // 1. Verify race exists and is open for betting
    const race = await this.raceModel.findById(dto.raceId);
    if (!race) {
      throw new NotFoundException('Race not found');
    }
    if (
      race.status !== RaceStatus.SCHEDULED &&
      race.status !== RaceStatus.CHECKING
    ) {
      throw new BadRequestException('Betting is closed for this race');
    }

    // 2. Verify horse is participating in this race
    const participates = race.horses.some(
      (h) => String(h.horseId) === dto.horseId,
    );
    if (!participates) {
      throw new BadRequestException(
        'Target horse is not participating in this race',
      );
    }

    // Deterministic mock odds based on horseId and raceId string hash:
    const hashStr = String(dto.horseId) + String(dto.raceId);
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
      hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Normalize to a float between 1.50 and 5.50
    const odds = parseFloat((1.5 + (Math.abs(hash) % 401) / 100).toFixed(2));

    return this.betModel.create({
      ...dto,
      userId,
      odds,
      status: BetStatus.PENDING,
    });
  }

  async findMyBets(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.betModel
        .find(filter)
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.betModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.betModel
        .find()
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
        .populate('userId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.betModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Calculate and resolve all bets for a race based on the published result */
  async payoutBetsForRace(raceId: string): Promise<void> {
    // 1. Get the rank 1 winner
    const winnerResult = await this.resultModel.findOne({
      raceId,
      rank: 1,
      status: RaceResultStatus.PUBLISHED,
    });

    if (!winnerResult) {
      // If no published results, we cannot payout yet
      return;
    }

    const winningHorseId = winnerResult.horseId;

    // 2. Update winning bets
    await this.betModel.updateMany(
      {
        raceId,
        horseId: winningHorseId,
        status: BetStatus.PENDING,
      },
      [
        {
          $set: {
            status: BetStatus.WON,
            payout: { $multiply: ['$amount', '$odds'] },
          },
        },
      ],
    );

    // 3. Update losing bets
    await this.betModel.updateMany(
      {
        raceId,
        horseId: { $ne: winningHorseId },
        status: BetStatus.PENDING,
      },
      {
        $set: {
          status: BetStatus.LOST,
          payout: 0,
        },
      },
    );
  }
}
