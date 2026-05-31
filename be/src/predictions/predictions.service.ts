import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Race, RaceDocument, RaceStatus } from '../races/schemas/race.schema';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  Prediction,
  PredictionDocument,
  PredictionStatus,
} from './schemas/prediction.schema';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';

const WINNER_POINTS = 50;

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name)
    private predictionModel: Model<PredictionDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    private ledgerService: RewardPointLedgerService,
  ) {}

  async create(
    dto: CreatePredictionDto,
    userId: string,
  ): Promise<PredictionDocument> {
    const race = await this.raceModel.findById(dto.raceId);
    if (!race) throw new NotFoundException('Race not found');
    if (
      race.status !== RaceStatus.SCHEDULED &&
      race.status !== RaceStatus.CHECKING
    ) {
      throw new BadRequestException(
        'Predictions are closed for this race (race is no longer in SCHEDULED or CHECKING status)',
      );
    }

    const reg = await this.registrationModel.findOne({
      raceId: dto.raceId,
      horseId: dto.predictedHorseId,
      status: RegistrationStatus.APPROVED,
    });
    if (!reg) {
      throw new BadRequestException(
        'Horse does not have an approved registration in this race',
      );
    }

    const existing = await this.predictionModel.findOne({
      raceId: dto.raceId,
      userId,
    });
    if (existing) {
      throw new ConflictException(
        'You already have a prediction for this race',
      );
    }

    return this.predictionModel.create({
      raceId: new Types.ObjectId(dto.raceId),
      userId: new Types.ObjectId(userId),
      predictedHorseId: new Types.ObjectId(dto.predictedHorseId),
      status: PredictionStatus.PENDING,
    });
  }

  async findMyPredictions(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.predictionModel
        .find(filter)
        .populate('raceId', 'name startTime status')
        .populate('predictedHorseId', 'name breed')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.predictionModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.predictionModel
        .find()
        .populate('raceId', 'name startTime status')
        .populate('userId', 'fullName email')
        .populate('predictedHorseId', 'name breed')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.predictionModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancelPredictionsForRace(raceId: string): Promise<void> {
    await this.predictionModel.updateMany(
      { raceId, status: PredictionStatus.PENDING },
      { $set: { status: PredictionStatus.CANCELLED, evaluatedAt: new Date() } },
    );
  }

  async payoutBetsForRace(raceId: string): Promise<void> {
    const winner = await this.resultModel.findOne({
      raceId,
      status: RaceResultStatus.PUBLISHED,
      rank: 1,
    });

    const predictions = await this.predictionModel.find({
      raceId,
      status: PredictionStatus.PENDING,
    });
    if (predictions.length === 0) return;

    const now = new Date();
    const winnerIds: { predictionId: string; userId: string }[] = [];

    const bulkOps = predictions.map((prediction) => {
      const won =
        winner != null &&
        String(prediction.predictedHorseId) === String(winner.horseId);

      if (won) {
        winnerIds.push({
          predictionId: String(prediction._id),
          userId: String(prediction.userId),
        });
      }

      return {
        updateOne: {
          filter: { _id: prediction._id },
          update: {
            $set: {
              status: won ? PredictionStatus.WON : PredictionStatus.LOST,
              rewardPoints: won ? WINNER_POINTS : 0,
              evaluatedAt: now,
            },
          },
        },
      };
    });

    await this.predictionModel.bulkWrite(bulkOps);

    await Promise.all(
      winnerIds.map((w) =>
        this.ledgerService.credit({
          userId: w.userId,
          points: WINNER_POINTS,
          sourceType: LedgerSourceType.PREDICTION_REWARD,
          sourceId: w.predictionId,
          note: `Prediction reward for race ${raceId}`,
        }),
      ),
    );
  }
}
