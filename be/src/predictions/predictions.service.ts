import {
  BadRequestException,
  ConflictException,
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

/** Points for correct prediction per position */
const POSITION_POINTS = { first: 50, second: 30, third: 20 };

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
  ) {}

  async create(
    dto: CreatePredictionDto,
    userId: string,
  ): Promise<PredictionDocument> {
    // 1. Race must be SCHEDULED or CHECKING — predictions close when race is READY
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

    // 2. At least one horse must be predicted
    const predicted = [
      dto.predictedFirstHorseId,
      dto.predictedSecondHorseId,
      dto.predictedThirdHorseId,
    ].filter(Boolean);
    if (predicted.length === 0) {
      throw new BadRequestException(
        'At least one predicted horse must be provided',
      );
    }

    // 3. Each predicted horse must have an APPROVED registration in this race
    for (const horseId of predicted) {
      const reg = await this.registrationModel.findOne({
        raceId: dto.raceId,
        horseId,
        status: RegistrationStatus.APPROVED,
      });
      if (!reg) {
        throw new BadRequestException(
          `Horse ${horseId} does not have an approved registration in this race`,
        );
      }
    }

    // 4. One prediction per user per race
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
      raceId: dto.raceId,
      userId,
      predictedFirstHorseId: dto.predictedFirstHorseId,
      predictedSecondHorseId: dto.predictedSecondHorseId,
      predictedThirdHorseId: dto.predictedThirdHorseId,
      status: PredictionStatus.PENDING,
    });
  }

  async findMyPredictions(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.predictionModel
        .find(filter)
        .populate('raceId', 'name startTime status')
        .populate('predictedFirstHorseId', 'name breed')
        .populate('predictedSecondHorseId', 'name breed')
        .populate('predictedThirdHorseId', 'name breed')
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
        .populate('predictedFirstHorseId', 'name')
        .populate('predictedSecondHorseId', 'name')
        .populate('predictedThirdHorseId', 'name')
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

  /** Cancel all pending predictions when a race is cancelled */
  async cancelPredictionsForRace(raceId: string): Promise<void> {
    await this.predictionModel.updateMany(
      { raceId, status: PredictionStatus.PENDING },
      { $set: { status: PredictionStatus.CANCELLED, evaluatedAt: new Date() } },
    );
  }

  /** Evaluate top-3 predictions against published results */
  async payoutBetsForRace(raceId: string): Promise<void> {
    // 1. Get published results ranked 1-3
    const results = await this.resultModel
      .find({ raceId, status: RaceResultStatus.PUBLISHED })
      .sort({ rank: 1 });

    const actualFirst = results.find((r) => r.rank === 1);
    const actualSecond = results.find((r) => r.rank === 2);
    const actualThird = results.find((r) => r.rank === 3);

    const predictions = await this.predictionModel.find({
      raceId,
      status: PredictionStatus.PENDING,
    });

    if (predictions.length === 0) return;

    const now = new Date();
    const bulkOps = predictions.map((prediction) => {
      let rewardPoints = 0;

      if (
        actualFirst &&
        prediction.predictedFirstHorseId &&
        String(prediction.predictedFirstHorseId) === String(actualFirst.horseId)
      ) {
        rewardPoints += POSITION_POINTS.first;
      }
      if (
        actualSecond &&
        prediction.predictedSecondHorseId &&
        String(prediction.predictedSecondHorseId) ===
          String(actualSecond.horseId)
      ) {
        rewardPoints += POSITION_POINTS.second;
      }
      if (
        actualThird &&
        prediction.predictedThirdHorseId &&
        String(prediction.predictedThirdHorseId) === String(actualThird.horseId)
      ) {
        rewardPoints += POSITION_POINTS.third;
      }

      return {
        updateOne: {
          filter: { _id: prediction._id },
          update: {
            $set: {
              status:
                rewardPoints > 0 ? PredictionStatus.WON : PredictionStatus.LOST,
              rewardPoints,
              evaluatedAt: now,
            },
          },
        },
      };
    });

    await this.predictionModel.bulkWrite(bulkOps);
  }
}
