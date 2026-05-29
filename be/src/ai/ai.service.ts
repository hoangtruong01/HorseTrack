import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, RoleName } from '../users/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
  TransactionType,
  TransactionStatus,
} from '../wallet/schemas/wallet-transaction.schema';
import {
  AIPredictionPackage,
  AIPredictionPackageDocument,
} from './schemas/ai-prediction-package.schema';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { UserSubscription, UserSubscriptionDocument } from './schemas/user-subscription.schema';
import {
  AIPredictionSuggestion,
  AIPredictionSuggestionDocument,
} from './schemas/ai-prediction-suggestion.schema';
import {
  AIRaceArrangementSuggestion,
  AIRaceArrangementSuggestionDocument,
} from './schemas/ai-race-arrangement-suggestion.schema';
import { CreateAiPackageDto } from './dto/create-package.dto';
import { CreateAiPredictionSuggestionDto } from './dto/create-prediction-suggestion.dto';
import { CreateAiArrangementSuggestionDto } from './dto/create-arrangement-suggestion.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(WalletTransaction.name)
    private transactionModel: Model<WalletTransactionDocument>,
    @InjectModel(AIPredictionPackage.name)
    private packageModel: Model<AIPredictionPackageDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscriptionDocument>,
    @InjectModel(AIPredictionSuggestion.name)
    private predictionModel: Model<AIPredictionSuggestionDocument>,
    @InjectModel(AIRaceArrangementSuggestion.name)
    private arrangementModel: Model<AIRaceArrangementSuggestionDocument>,
  ) {}

  async createPackage(dto: CreateAiPackageDto): Promise<AIPredictionPackageDocument> {
    return this.packageModel.create(dto);
  }

  async findAllPackages(): Promise<AIPredictionPackageDocument[]> {
    return this.packageModel.find({ status: 'ACTIVE' }).exec();
  }

  async subscribe(packageId: string, userId: string): Promise<UserSubscriptionDocument> {
    const pkg = await this.packageModel.findById(packageId);
    if (!pkg || pkg.status !== 'ACTIVE') {
      throw new NotFoundException('Prediction package not found or inactive');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if ((user.balance ?? 0) < pkg.price) {
      throw new BadRequestException('Insufficient wallet balance to subscribe');
    }

    // 1. Deduct money
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { balance: -pkg.price },
    });

    // 2. Record Wallet Transaction
    await this.transactionModel.create({
      userId,
      type: TransactionType.PURCHASE,
      amount: pkg.price,
      points: 0,
      description: `Purchased AI package: ${pkg.name}`,
      status: TransactionStatus.SUCCESS,
    });

    // 3. Record Payment
    await this.paymentModel.create({
      userId,
      packageId,
      amount: pkg.price,
      paymentMethod: 'WALLET',
      status: PaymentStatus.SUCCESS,
      transactionId: `TX_${Date.now()}`,
    });

    // 4. Create or extend Subscription
    const now = new Date();
    const existingSub = await this.subscriptionModel.findOne({
      userId,
      packageId,
      status: 'ACTIVE',
      endDate: { $gt: now },
    });

    let startDate = now;
    let endDate = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

    if (existingSub) {
      startDate = existingSub.startDate;
      endDate = new Date(existingSub.endDate.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);
      existingSub.endDate = endDate;
      return existingSub.save();
    }

    return this.subscriptionModel.create({
      userId,
      packageId,
      startDate,
      endDate,
      status: 'ACTIVE',
    });
  }

  async checkSubscriptionActive(userId: string): Promise<boolean> {
    const now = new Date();
    const sub = await this.subscriptionModel.findOne({
      userId,
      status: 'ACTIVE',
      endDate: { $gt: now },
    });
    return !!sub;
  }

  async createPredictionSuggestion(
    dto: CreateAiPredictionSuggestionDto,
  ): Promise<AIPredictionSuggestionDocument> {
    // Upsert so there is only one suggestion per race
    return this.predictionModel.findOneAndUpdate(
      { raceId: dto.raceId },
      dto,
      { upsert: true, new: true },
    );
  }

  async getPredictionSuggestionForRace(
    raceId: string,
    userId: string,
    userRoles: string[],
  ): Promise<AIPredictionSuggestionDocument> {
    // Admin bypasses subscription check
    if (userRoles.includes(RoleName.ADMIN)) {
      const suggestion = await this.predictionModel
        .findOne({ raceId })
        .populate('suggestedWinnerId', 'name breed')
        .populate('suggestedPlaceIds', 'name breed')
        .exec();
      if (!suggestion) {
        throw new NotFoundException('No AI suggestions generated for this race');
      }
      return suggestion;
    }

    // Check if spectator has active subscription
    const isSubscribed = await this.checkSubscriptionActive(userId);
    if (!isSubscribed) {
      throw new ForbiddenException(
        'Subscription required to access premium AI suggestions. Please purchase an AI prediction package.',
      );
    }

    const suggestion = await this.predictionModel
      .findOne({ raceId })
      .populate('suggestedWinnerId', 'name breed')
      .populate('suggestedPlaceIds', 'name breed')
      .exec();
    if (!suggestion) {
      throw new NotFoundException('No AI suggestions generated for this race');
    }
    return suggestion;
  }

  async createArrangementSuggestion(
    dto: CreateAiArrangementSuggestionDto,
  ): Promise<AIRaceArrangementSuggestionDocument> {
    const proposedRaces = dto.proposedRaces.map((r) => ({
      name: r.name,
      trackCondition: r.trackCondition,
      horseIds: r.horseIds.map((id) => new Types.ObjectId(id)),
      refereeIds: r.refereeIds.map((id) => new Types.ObjectId(id)),
    }));

    return this.arrangementModel.create({
      tournamentId: new Types.ObjectId(dto.tournamentId),
      proposedRaces,
      reasoning: dto.reasoning,
    });
  }

  async getArrangementSuggestions(
    tournamentId: string,
  ): Promise<AIRaceArrangementSuggestionDocument[]> {
    return this.arrangementModel
      .find({ tournamentId })
      .populate('proposedRaces.horseIds', 'name breed')
      .populate('proposedRaces.refereeIds', 'fullName')
      .exec();
  }

  async updateArrangementSuggestionStatus(
    id: string,
    status: 'APPLIED' | 'REJECTED',
  ): Promise<AIRaceArrangementSuggestionDocument> {
    const suggestion = await this.arrangementModel.findById(id);
    if (!suggestion) {
      throw new NotFoundException('Arrangement suggestion not found');
    }
    suggestion.status = status;
    return suggestion.save();
  }
}
