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
import { User, UserDocument } from '../users/schemas/user.schema';
import { Prediction, PredictionDocument, PredictionStatus } from './schemas/prediction.schema';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name) private predictionModel: Model<PredictionDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(RaceResult.name) private resultModel: Model<RaceResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreatePredictionDto, userId: string): Promise<PredictionDocument> {
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
      throw new BadRequestException('You already predicted this horse in this race');
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
      // If no published results, we cannot resolve predictions yet
      return;
    }

    // 2. Fetch all pending predictions for the race
    const predictions = await this.predictionModel.find({
      raceId,
      status: PredictionStatus.PENDING,
    });

    for (const prediction of predictions) {
      // Find the result corresponding to the horse
      const horseResult = results.find(
        (r) => String(r.horseId) === String(prediction.horseId),
      );

      if (horseResult) {
        // If the horse's rank matches the predicted position
        const isCorrect = horseResult.rank === prediction.predictedPosition;
        if (isCorrect) {
          prediction.status = PredictionStatus.WON;
          prediction.isCorrect = true;
          // Award 100 points for a correct prediction
          prediction.pointsEarned = 100;
          
          // Increment spectator points
          await this.userModel.findByIdAndUpdate(prediction.userId, {
            $inc: { points: 100 },
          });
        } else {
          prediction.status = PredictionStatus.LOST;
          prediction.isCorrect = false;
          prediction.pointsEarned = 0;
        }
      } else {
        // Horse did not finish/no result
        prediction.status = PredictionStatus.LOST;
        prediction.isCorrect = false;
        prediction.pointsEarned = 0;
      }
      await prediction.save();
    }
  }
}
