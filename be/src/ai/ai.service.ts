import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleName } from '../users/schemas/user.schema';
import {
  AIPredictionPackage,
  type AIPredictionPackageDocument,
  PackageStatus,
} from './schemas/ai-prediction-package.schema';
import {
  UserSubscription,
  type UserSubscriptionDocument,
  SubscriptionStatus,
} from './schemas/user-subscription.schema';
import { Payment, type PaymentDocument } from './schemas/payment.schema';
import {
  AIPredictionSuggestion,
  type AIPredictionSuggestionDocument,
} from './schemas/ai-prediction-suggestion.schema';
import { CreateAiPackageDto } from './dto/create-package.dto';
import { PredictionEngineService } from './services/prediction-engine.service';
import { PayosService } from './services/payos.service';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(AIPredictionPackage.name)
    private packageModel: Model<AIPredictionPackageDocument>,
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscriptionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(AIPredictionSuggestion.name)
    private predictionModel: Model<AIPredictionSuggestionDocument>,
    private readonly predictionEngine: PredictionEngineService,
    private readonly payosService: PayosService,
  ) {}

  // ─── Packages ────────────────────────────────────────────────────────────────

  async createPackage(
    dto: CreateAiPackageDto,
  ): Promise<AIPredictionPackageDocument> {
    return this.packageModel.create(dto);
  }

  async findAllPackages(): Promise<AIPredictionPackageDocument[]> {
    return this.packageModel.find({ status: PackageStatus.ACTIVE }).exec();
  }

  // ─── Subscription via PayOS ───────────────────────────────────────────────

  async initiateSubscription(
    packageId: string,
    userId: string,
  ): Promise<{ checkoutUrl: string; orderCode: number }> {
    return this.payosService.createPaymentLink(packageId, userId);
  }

  async handlePayosWebhook(body: unknown): Promise<void> {
    return this.payosService.handleWebhook(body);
  }

  async checkSubscriptionActive(userId: string): Promise<boolean> {
    const now = new Date();
    const sub = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
      endDate: { $gt: now },
    });
    return !!sub;
  }

  async getMySubscription(
    userId: string,
  ): Promise<UserSubscriptionDocument | null> {
    const now = new Date();
    return this.subscriptionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gt: now },
      })
      .populate('packageId', 'name description price durationDays accuracyRate')
      .exec();
  }

  // ─── Payments (admin revenue) ─────────────────────────────────────────────

  async findAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find()
      .populate('userId', 'fullName email')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ─── Predictions ─────────────────────────────────────────────────────────

  async generatePrediction(
    raceId: string,
    userId: string,
    userRoles: string[],
  ): Promise<AIPredictionSuggestionDocument> {
    if (!userRoles.includes(RoleName.ADMIN)) {
      const isSubscribed = await this.checkSubscriptionActive(userId);
      if (!isSubscribed) {
        throw new ForbiddenException(
          'Cần có subscription đang hoạt động để sử dụng tính năng AI. Vui lòng mua gói subscription.',
        );
      }
    }
    return this.predictionEngine.generateForRace(raceId);
  }

  async getPredictionSuggestionForRace(
    raceId: string,
    userId: string,
    userRoles: string[],
  ): Promise<AIPredictionSuggestionDocument> {
    if (!userRoles.includes(RoleName.ADMIN)) {
      const isSubscribed = await this.checkSubscriptionActive(userId);
      if (!isSubscribed) {
        throw new ForbiddenException(
          'Cần có subscription đang hoạt động để xem gợi ý AI. Vui lòng mua gói subscription.',
        );
      }
    }

    const suggestion = await this.predictionModel
      .findOne({ raceId: new Types.ObjectId(raceId) })
      .populate('rankings.horseId', 'name breed')
      .exec();

    if (!suggestion) {
      throw new NotFoundException('Chưa có gợi ý AI cho race này');
    }
    return suggestion;
  }
}
