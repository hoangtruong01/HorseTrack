import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LedgerSourceType,
  RewardPointLedger,
  RewardPointLedgerDocument,
} from './schemas/reward-point-ledger.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

export interface LedgerParams {
  userId: string;
  points: number;
  sourceType: LedgerSourceType;
  sourceId?: string;
  note?: string;
  createdBy?: string;
}

@Injectable()
export class RewardPointLedgerService {
  constructor(
    @InjectModel(RewardPointLedger.name)
    private ledgerModel: Model<RewardPointLedgerDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  private buildUserIdFilter(userId: string) {
    return { $in: [userId, new Types.ObjectId(userId)] };
  }

  async getBalance(userId: string): Promise<number> {
    const latest = await this.ledgerModel
      .findOne({ userId: this.buildUserIdFilter(userId) })
      .sort({ createdAt: -1 })
      .exec();
    return latest?.balanceAfter ?? 0;
  }
  async credit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    const current = await this.getBalance(params.userId);
    const balanceAfter = current + params.points;
    const entry = await this.ledgerModel.create({
      userId: new Types.ObjectId(params.userId),
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      pointsDelta: params.points,
      balanceAfter,
      note: params.note,
      createdBy: params.createdBy,
    });

    // Synchronize current reward points to user wallet/points field
    await this.userModel
      .findByIdAndUpdate(params.userId, {
        $set: { points: balanceAfter },
      })
      .exec();

    return entry;
  }

  async debit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    const current = await this.getBalance(params.userId);
    if (current < params.points) {
      throw new BadRequestException(
        `Insufficient points. Current balance: ${current}, required: ${params.points}`,
      );
    }
    const balanceAfter = current - params.points;
    const entry = await this.ledgerModel.create({
      userId: new Types.ObjectId(params.userId),
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      pointsDelta: -params.points,
      balanceAfter,
      note: params.note,
      createdBy: params.createdBy,
    });

    // Synchronize current reward points to user wallet/points field
    await this.userModel
      .findByIdAndUpdate(params.userId, {
        $set: { points: balanceAfter },
      })
      .exec();

    return entry;
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const filter = { userId: this.buildUserIdFilter(userId) };
    const [data, total] = await Promise.all([
      this.ledgerModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.ledgerModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.ledgerModel
        .find()
        .populate('userId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.ledgerModel.countDocuments(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
