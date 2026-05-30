import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
  TransactionType,
  TransactionStatus,
} from './schemas/wallet-transaction.schema';
import {
  CashoutRequest,
  CashoutRequestDocument,
  CashoutStatus,
} from './schemas/cashout-request.schema';
import { CreateCashoutDto } from './dto/create-cashout.dto';

// 1 point = 100 cash units
const POINT_CONVERSION_RATE = 100;

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(WalletTransaction.name)
    private transactionModel: Model<WalletTransactionDocument>,
    @InjectModel(CashoutRequest.name)
    private cashoutModel: Model<CashoutRequestDocument>,
  ) {}

  async deposit(
    userId: string,
    amount: number,
  ): Promise<WalletTransactionDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Increment user balance
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { balance: amount },
    });

    // Record transaction
    return this.transactionModel.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount,
      points: 0,
      description: `Deposited ${amount} into wallet.`,
      status: TransactionStatus.SUCCESS,
    });
  }

  async requestCashout(
    dto: CreateCashoutDto,
    userId: string,
  ): Promise<CashoutRequestDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if ((user.points ?? 0) < dto.pointsToRedeem) {
      throw new BadRequestException('Insufficient points to redeem');
    }

    const requestedAmount = dto.pointsToRedeem * POINT_CONVERSION_RATE;

    // Deduct points from user immediately
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { points: -dto.pointsToRedeem },
    });

    // Create cashout request
    const request = await this.cashoutModel.create({
      userId,
      requestedAmount,
      pointsRedeemed: dto.pointsToRedeem,
      status: CashoutStatus.PENDING,
    });

    // Create transaction in pending state, linked to the cashout request
    await this.transactionModel.create({
      userId,
      type: TransactionType.REWARD_CASHOUT,
      amount: requestedAmount,
      points: dto.pointsToRedeem,
      description: `Cashout request of ${requestedAmount} by redeeming ${dto.pointsToRedeem} points.`,
      status: TransactionStatus.PENDING,
      cashoutRequestId: request._id,
    });

    return request;
  }

  async processCashout(
    id: string,
    status: CashoutStatus,
    handlerId: string,
  ): Promise<CashoutRequestDocument> {
    const request = await this.cashoutModel.findById(id);
    if (!request) {
      throw new NotFoundException('Cashout request not found');
    }

    if (
      request.status === CashoutStatus.PAID ||
      request.status === CashoutStatus.REJECTED
    ) {
      throw new BadRequestException('Request has already been processed');
    }

    request.status = status;

    if (status === CashoutStatus.APPROVED) {
      request.approvedBy = new Types.ObjectId(handlerId);
    } else if (status === CashoutStatus.PAID) {
      request.paidBy = new Types.ObjectId(handlerId);
      request.paidAt = new Date();

      // Complete the pending transaction — look up by cashoutRequestId for precision
      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id, status: TransactionStatus.PENDING },
        { status: TransactionStatus.SUCCESS },
      );
    } else if (status === CashoutStatus.REJECTED) {
      request.approvedBy = new Types.ObjectId(handlerId);

      // Refund points back to user
      await this.userModel.findByIdAndUpdate(request.userId, {
        $inc: { points: request.pointsRedeemed },
      });

      // Fail the pending transaction — look up by cashoutRequestId for precision
      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id, status: TransactionStatus.PENDING },
        { status: TransactionStatus.FAILED },
      );
    }

    return request.save();
  }

  async findMyWalletHistory(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    const user = await this.userModel.findById(userId, 'points balance');

    return {
      balance: user?.balance ?? 0,
      points: user?.points ?? 0,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyCashoutRequests(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.cashoutModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.cashoutModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllCashouts(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.cashoutModel
        .find()
        .populate('userId', 'fullName email phone')
        .populate('approvedBy', 'fullName')
        .populate('paidBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.cashoutModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
