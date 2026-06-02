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
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';



@Injectable()
export class WalletService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(WalletTransaction.name)
    private transactionModel: Model<WalletTransactionDocument>,
    @InjectModel(CashoutRequest.name)
    private cashoutModel: Model<CashoutRequestDocument>,
    private ledgerService: RewardPointLedgerService,
  ) {}

  async deposit(
    userId: string,
    amount: number,
  ): Promise<WalletTransactionDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { balance: amount },
    });

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
    // Use ledger as source of truth for points balance
    const currentPoints = await this.ledgerService.getBalance(userId);
    if (currentPoints < dto.pointsToRedeem) {
      throw new BadRequestException(
        `Insufficient points. Available: ${currentPoints}, required: ${dto.pointsToRedeem}`,
      );
    }

    // Generate unique 6-digit uppercase alphanumeric redemption code
    let redemptionCode = '';
    let isUnique = false;
    while (!isUnique) {
      redemptionCode =
        'RWD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await this.cashoutModel.findOne({ redemptionCode });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create cashout request (do not debit points yet)
    const request = await this.cashoutModel.create({
      userId,
      requestedAmount: 0,
      redemptionCode,
      pointsRedeemed: dto.pointsToRedeem,
      status: CashoutStatus.PENDING,
    });

    // Record pending wallet transaction
    await this.transactionModel.create({
      userId,
      type: TransactionType.REWARD_CASHOUT,
      amount: 0,
      points: dto.pointsToRedeem,
      description: `Yêu cầu quy đổi ${dto.pointsToRedeem} điểm thưởng (Mã: ${redemptionCode}). mang mã này ra quầy để nhận thưởng.`,
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
    if (!request) throw new NotFoundException('Cashout request not found');

    if (
      request.status === CashoutStatus.PAID ||
      request.status === CashoutStatus.REJECTED
    ) {
      throw new BadRequestException('Request has already been processed');
    }

    // Debit points only when transitioning from PENDING to APPROVED or PAID
    if (
      request.status === CashoutStatus.PENDING &&
      (status === CashoutStatus.APPROVED || status === CashoutStatus.PAID)
    ) {
      const currentPoints = await this.ledgerService.getBalance(
        String(request.userId),
      );
      if (currentPoints < request.pointsRedeemed) {
        throw new BadRequestException(
          `User does not have enough points. Current: ${currentPoints}, required: ${request.pointsRedeemed}`,
        );
      }

      // Debit points via ledger
      await this.ledgerService.debit({
        userId: String(request.userId),
        points: request.pointsRedeemed,
        sourceType: LedgerSourceType.REDEMPTION,
        sourceId: String(request._id),
        note: `Đổi thưởng thành công (Mã: ${request.redemptionCode})`,
        createdBy: handlerId,
      });
    }

    // Update status
    const previousStatus = request.status;
    request.status = status;

    if (status === CashoutStatus.APPROVED) {
      request.approvedBy = new Types.ObjectId(handlerId);
      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id, status: TransactionStatus.PENDING },
        { status: TransactionStatus.SUCCESS },
      );
    } else if (status === CashoutStatus.PAID) {
      request.paidBy = new Types.ObjectId(handlerId);
      request.paidAt = new Date();
      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id },
        { status: TransactionStatus.SUCCESS },
      );
    } else if (status === CashoutStatus.REJECTED) {
      request.approvedBy = new Types.ObjectId(handlerId);

      // Refund points only if they were already debited (i.e. status was APPROVED)
      if (previousStatus === CashoutStatus.APPROVED) {
        await this.ledgerService.credit({
          userId: String(request.userId),
          points: request.pointsRedeemed,
          sourceType: LedgerSourceType.REDEMPTION,
          sourceId: String(request._id),
          note: `Refund: cashout request ${id} rejected after approval`,
          createdBy: handlerId,
        });
      }

      await this.transactionModel.findOneAndUpdate(
        { cashoutRequestId: request._id },
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

    const user = await this.userModel.findById(userId, 'balance');
    const pointBalance = await this.ledgerService.getBalance(userId);

    return {
      balance: user?.balance ?? 0,
      points: pointBalance,
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

  async findAllTransactions(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.transactionModel
        .find()
        .populate('userId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.transactionModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
