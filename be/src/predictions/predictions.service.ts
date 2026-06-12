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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

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
    private notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreatePredictionDto,
    userId: string,
  ): Promise<PredictionDocument> {
    const race = await this.raceModel.findById(dto.raceId);
    if (!race) throw new NotFoundException('Race not found');
    if (
      race.status !== RaceStatus.SCHEDULED &&
      race.status !== RaceStatus.CHECKING &&
      race.status !== RaceStatus.READY
    ) {
      throw new BadRequestException(
        'Predictions are closed for this race (race is no longer in SCHEDULED, CHECKING or READY status)',
      );
    }

    const reg = await this.registrationModel.findOne({
      raceId: new Types.ObjectId(dto.raceId),
      horseId: new Types.ObjectId(dto.predictedHorseId),
      status: RegistrationStatus.APPROVED,
    });
    if (!reg) {
      throw new BadRequestException(
        'Horse does not have an approved registration in this race',
      );
    }

    const existing = await this.predictionModel.findOne({
      raceId: new Types.ObjectId(dto.raceId),
      userId: new Types.ObjectId(userId),
      status: { $ne: PredictionStatus.CANCELLED },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a prediction for this race',
      );
    }

    const betAmount = dto.betPoints || 0;
    const balance = await this.ledgerService.getBalance(userId);

    if (balance === 0) {
      if (betAmount !== 1) {
        throw new BadRequestException(
          'Tài khoản chưa có điểm, chỉ chấp nhận cược miễn phí (1 Pts).',
        );
      }
    } else {
      if (betAmount < 2) {
        throw new BadRequestException(
          'Điểm cược không hợp lệ. Bạn đang có điểm thưởng, vui lòng cược từ 2 Pts trở lên.',
        );
      }
      if (balance < betAmount) {
        throw new BadRequestException(
          `Số dư ví không đủ để đặt dự đoán (${betAmount} Pts)`,
        );
      }
    }

    const prediction = await this.predictionModel.create({
      raceId: new Types.ObjectId(dto.raceId),
      userId: new Types.ObjectId(userId),
      predictedHorseId: new Types.ObjectId(dto.predictedHorseId),
      status: PredictionStatus.PENDING,
      betPoints: betAmount,
    });

    if (betAmount >= 2) {
      await this.ledgerService.debit({
        userId,
        points: betAmount,
        sourceType: LedgerSourceType.PREDICTION_REWARD,
        sourceId: String(prediction._id),
        note: `Đặt cược dự đoán ${betAmount} điểm cho trận đấu ${race.name}`,
      });
    }

    return prediction;
  }

  async cancelPrediction(
    predictionId: string,
    userId: string,
  ): Promise<PredictionDocument> {
    const prediction = await this.predictionModel.findById(predictionId);
    if (!prediction) {
      throw new NotFoundException('Dự đoán không tồn tại');
    }
    if (String(prediction.userId) !== userId) {
      throw new BadRequestException('Bạn không có quyền hủy dự đoán này');
    }
    if (prediction.status !== PredictionStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể hủy dự đoán ở trạng thái chờ (PENDING)',
      );
    }

    const race = await this.raceModel.findById(prediction.raceId);
    if (!race) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    // Check time limit: current time must be more than 2 hours before race startTime
    const now = new Date();
    const startTime = new Date(race.startTime);
    const timeDiff = startTime.getTime() - now.getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    if (
      race.status !== RaceStatus.SCHEDULED &&
      race.status !== RaceStatus.CHECKING &&
      race.status !== RaceStatus.READY
    ) {
      throw new BadRequestException(
        'Trận đấu đã diễn ra hoặc không ở trạng thái hợp lệ để hủy cược',
      );
    }

    if (timeDiff < twoHoursInMs) {
      throw new BadRequestException(
        'Không thể hủy dự đoán trước giờ thi đấu dưới 2 tiếng hoặc khi trận đấu đã bắt đầu',
      );
    }

    // Refund bet points if betPoints >= 2
    if (prediction.betPoints && prediction.betPoints >= 2) {
      await this.ledgerService.credit({
        userId,
        points: prediction.betPoints,
        sourceType: LedgerSourceType.PREDICTION_REWARD,
        sourceId: String(prediction._id),
        note: `Hoàn trả cược dự đoán (+${prediction.betPoints} điểm) do người dùng tự hủy cược`,
      });

      await this.notificationsService.send(
        userId,
        'Hủy cược thành công',
        `Bạn đã hủy cược dự đoán thành công cho trận đấu ${race.name} và được hoàn lại ${prediction.betPoints} điểm.`,
        NotificationType.PREDICTION,
      );
    } else {
      await this.notificationsService.send(
        userId,
        'Hủy dự đoán thành công',
        `Bạn đã hủy dự đoán thành công cho trận đấu ${race.name}.`,
        NotificationType.PREDICTION,
      );
    }

    // Delete the prediction document entirely
    await this.predictionModel.findByIdAndDelete(predictionId);

    return prediction;
  }

  async findMyPredictions(userId: string, page = 1, limit = 20) {
    const filter = {
      userId: new Types.ObjectId(userId),
      status: { $ne: PredictionStatus.CANCELLED },
    };
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
    const pending = await this.predictionModel.find({
      raceId: new Types.ObjectId(raceId),
      status: PredictionStatus.PENDING,
    });

    for (const p of pending) {
      if (p.betPoints && p.betPoints >= 2) {
        await this.ledgerService.credit({
          userId: String(p.userId),
          points: p.betPoints,
          sourceType: LedgerSourceType.PREDICTION_REWARD,
          sourceId: String(p._id),
          note: `Hoàn trả cược dự đoán (+${p.betPoints} điểm) do trận đấu bị hủy`,
        });

        await this.notificationsService.send(
          String(p.userId),
          'Dự đoán bị hủy',
          `Trận đấu bị hủy, bạn được hoàn trả ${p.betPoints} điểm cược dự đoán.`,
          NotificationType.PREDICTION,
        );
      }
    }

    await this.predictionModel.updateMany(
      { raceId: new Types.ObjectId(raceId), status: PredictionStatus.PENDING },
      { $set: { status: PredictionStatus.CANCELLED, evaluatedAt: new Date() } },
    );
  }

  async payoutBetsForRace(raceId: string): Promise<void> {
    const winners = await this.resultModel.find({
      raceId: new Types.ObjectId(raceId),
      status: RaceResultStatus.PUBLISHED,
      rank: 1,
    });
    const winnerHorseIds = winners.map((w) => String(w.horseId));

    const predictions = await this.predictionModel.find({
      raceId: new Types.ObjectId(raceId),
      status: PredictionStatus.PENDING,
    });
    if (predictions.length === 0) return;

    const now = new Date();

    // Process each prediction atomically to prevent race conditions (double payouts)
    for (const prediction of predictions) {
      const won =
        winners.length > 0 &&
        winnerHorseIds.includes(String(prediction.predictedHorseId));

      const pointsDelta = won
        ? prediction.betPoints >= 2
          ? prediction.betPoints
          : 1
        : prediction.betPoints >= 2
          ? -prediction.betPoints
          : 0;

      const targetStatus = won ? PredictionStatus.WON : PredictionStatus.LOST;

      // Atomic update. If returned doc is null, another concurrent request processed this prediction.
      const updatedPrediction = await this.predictionModel
        .findOneAndUpdate(
          {
            _id: prediction._id,
            status: PredictionStatus.PENDING,
          },
          {
            $set: {
              status: targetStatus,
              rewardPoints: pointsDelta,
              evaluatedAt: now,
            },
          },
          { new: true },
        )
        .exec();

      if (!updatedPrediction) {
        // Concurrent execution safety: Skip if already processed
        continue;
      }

      const betAmount = prediction.betPoints || 0;

      if (won) {
        const reward = betAmount >= 2 ? betAmount * 2 : 1;

        await this.ledgerService.credit({
          userId: String(prediction.userId),
          points: reward,
          sourceType: LedgerSourceType.PREDICTION_REWARD,
          sourceId: String(prediction._id),
          note:
            betAmount >= 2
              ? `Thắng dự đoán (Nhận lại cược x2: +${reward} điểm) cho trận đấu ${raceId}`
              : `Thắng dự đoán miễn phí (+1 điểm) cho trận đấu ${raceId}`,
        });

        // Send realtime notification
        await this.notificationsService.send(
          String(prediction.userId),
          'Dự đoán chính xác!',
          betAmount > 0
            ? `Chúc mừng! Bạn đã dự đoán chính xác chiến mã vô địch trong cuộc đua và nhận được ${reward} điểm (nhận lại cược x2).`
            : `Chúc mừng! Bạn đã dự đoán chính xác chiến mã vô địch trong cuộc đua và nhận được 1 điểm thưởng.`,
          NotificationType.PREDICTION,
        );
      } else {
        if (betAmount >= 2) {
          // Points were already debited at creation. Just send notification.
          await this.notificationsService.send(
            String(prediction.userId),
            'Dự đoán không chính xác',
            `Rất tiếc, chiến mã bạn dự đoán đã không thể về nhất. Bạn đã mất ${betAmount} điểm đặt cược.`,
            NotificationType.PREDICTION,
          );
        } else {
          // Free prediction: No penalty of 1 point! They bet 0, they lose 0.
          await this.ledgerService.credit({
            userId: String(prediction.userId),
            points: 0,
            sourceType: LedgerSourceType.PREDICTION_REWARD,
            sourceId: String(prediction._id),
            note: `Dự đoán sai trận đấu ${raceId} (Đặt cược miễn phí 0 Pts)`,
          });

          await this.notificationsService.send(
            String(prediction.userId),
            'Dự đoán không chính xác',
            `Rất tiếc, chiến mã bạn dự đoán đã không thể về nhất. Bạn không bị trừ điểm do đã đặt cược miễn phí.`,
            NotificationType.PREDICTION,
          );
        }
      }
    }
  }
}
