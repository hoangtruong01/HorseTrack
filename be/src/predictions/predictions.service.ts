import {
  BadRequestException,
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
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Prediction,
  PredictionDocument,
  PredictionStatus,
} from './schemas/prediction.schema';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name)
    private predictionModel: Model<PredictionDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    dto: CreatePredictionDto,
    userId: string,
  ): Promise<PredictionDocument> {
    // 1. Verify race exists and is open for predictions
    const race = await this.raceModel.findById(dto.raceId);
    if (!race) {
      throw new NotFoundException('Race not found');
    }
    if (
      race.status !== RaceStatus.SCHEDULED &&
      race.status !== RaceStatus.CHECKING
    ) {
      throw new BadRequestException('Predictions are closed for this race');
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

    const predictedPosition = dto.predictedPosition ?? 1;

    // 3. Prevent duplicate predictions by same user for same horse/race
    const existing = await this.predictionModel.findOne({
      raceId: dto.raceId,
      userId,
      horseId: dto.horseId,
    });
    if (existing) {
      throw new BadRequestException(
        'You already predicted this horse in this race',
      );
    }

    return this.predictionModel.create({
      ...dto,
      userId,
      predictedPosition,
      status: PredictionStatus.PENDING,
    });
  }

  async findMyPredictions(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.predictionModel
        .find(filter)
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
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
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
        .populate('userId', 'fullName email')
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

  /** Calculate and resolve all predictions for a race based on the published result */
  async payoutBetsForRace(raceId: string): Promise<void> {
    // 1. Get all published results for this race
    const results = await this.resultModel.find({
      raceId,
      status: RaceResultStatus.PUBLISHED,
    });

    if (results.length === 0) {
      return;
    }

    // Build a map: horseId → rank for O(1) lookup
    const rankByHorse = new Map<string, number>(
      results.map((r) => [String(r.horseId), r.rank]),
    );

    // 2. Fetch all pending predictions for the race
    const predictions = await this.predictionModel.find({
      raceId,
      status: PredictionStatus.PENDING,
    });

    if (predictions.length === 0) return;

    const POINTS_AWARD = 100;
    const winnerIds: Types.ObjectId[] = [];

    // 3. Build bulk update operations
    const predictionOps = predictions.map((prediction) => {
      const rank = rankByHorse.get(String(prediction.horseId));
      const isCorrect =
        rank !== undefined && rank === prediction.predictedPosition;

      if (isCorrect) {
        winnerIds.push(prediction.userId);
      }

      return {
        updateOne: {
          filter: { _id: prediction._id },
          update: {
            $set: {
              status: isCorrect ? PredictionStatus.WON : PredictionStatus.LOST,
              isCorrect,
              pointsEarned: isCorrect ? POINTS_AWARD : 0,
            },
          },
        },
      };
    });

    // 4. Execute bulk writes in parallel
    await Promise.all([
      this.predictionModel.bulkWrite(predictionOps),
      winnerIds.length > 0
        ? this.userModel.updateMany(
            { _id: { $in: winnerIds } },
            { $inc: { points: POINTS_AWARD } },
          )
        : Promise.resolve(),
    ]);
  }
}
