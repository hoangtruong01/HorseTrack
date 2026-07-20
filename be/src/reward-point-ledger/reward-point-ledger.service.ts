import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
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
  session?: ClientSession;
}

@Injectable()
export class RewardPointLedgerService {
  constructor(
    @InjectModel(RewardPointLedger.name)
    private ledgerModel: Model<RewardPointLedgerDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  private buildUserIdFilter(userId: string) {
    return { $in: [userId, new Types.ObjectId(userId)] };
  }

  async getBalance(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).select('points').exec();
    return user?.points ?? 0;
  }

  async exists(
    userId: string,
    sourceType: LedgerSourceType,
    sourceId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const query = this.ledgerModel.findOne({
      userId: new Types.ObjectId(userId),
      sourceType,
      sourceId: new Types.ObjectId(sourceId),
    });
    if (session) query.session(session);
    const entry = await query.exec();
    return !!entry;
  }

  private async creditCore(
    params: LedgerParams,
    session: ClientSession,
  ): Promise<RewardPointLedgerDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        params.userId,
        { $inc: { points: params.points } },
        { new: true },
      )
      .session(session)
      .exec();

    const balanceAfter = updatedUser?.points ?? params.points;

    const [entry] = await this.ledgerModel.create(
      [
        {
          userId: new Types.ObjectId(params.userId),
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          pointsDelta: params.points,
          balanceAfter,
          note: params.note,
          createdBy: params.createdBy,
        },
      ],
      { session },
    );
    return entry;
  }

  async credit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    if (params.session) {
      return this.creditCore(params, params.session);
    }
    // Try with transaction; fall back to non-transactional for standalone MongoDB
    let session: import('mongoose').ClientSession | undefined;
    try {
      session = await this.connection.startSession();
      session.startTransaction();
      const entry = await this.creditCore(params, session);
      await session.commitTransaction();
      return entry;
    } catch (err) {
      if (session && session.inTransaction()) await session.abortTransaction();
      // Standalone MongoDB: fall back to non-transactional
      if (
        err instanceof Error &&
        (err.message.includes('sharded cluster') ||
          err.message.includes('transaction') ||
          err.name === 'MongoServerError')
      ) {
        return this.creditCoreNoSession(params);
      }
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  }

  private async creditCoreNoSession(
    params: LedgerParams,
  ): Promise<RewardPointLedgerDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        params.userId,
        { $inc: { points: params.points } },
        { new: true },
      )
      .exec();

    const balanceAfter = updatedUser?.points ?? params.points;

    const entry = await this.ledgerModel.create({
      userId: new Types.ObjectId(params.userId),
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      pointsDelta: params.points,
      balanceAfter,
      note: params.note,
      createdBy: params.createdBy,
    });
    return entry;
  }

  async updateNote(
    sourceId: string,
    sourceType: LedgerSourceType,
    newNote: string,
  ): Promise<void> {
    const objectId = Types.ObjectId.isValid(sourceId)
      ? new Types.ObjectId(sourceId)
      : sourceId;
    await this.ledgerModel
      .findOneAndUpdate(
        {
          sourceId: { $in: [sourceId, objectId] },
          sourceType,
        },
        { $set: { note: newNote } },
      )
      .exec();
  }

  private async debitCore(
    params: LedgerParams,
    session: ClientSession,
  ): Promise<RewardPointLedgerDocument> {
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(params.userId),
          points: { $gte: params.points },
        },
        { $inc: { points: -params.points } },
        { new: true },
      )
      .session(session)
      .exec();

    if (!updatedUser) {
      const currentBalance = await this.getBalance(params.userId);
      throw new BadRequestException(
        `Insufficient points. Current balance: ${currentBalance}, required: ${params.points}`,
      );
    }

    const [entry] = await this.ledgerModel.create(
      [
        {
          userId: new Types.ObjectId(params.userId),
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          pointsDelta: -params.points,
          balanceAfter: updatedUser.points,
          note: params.note,
          createdBy: params.createdBy,
        },
      ],
      { session },
    );
    return entry;
  }

  async debit(params: LedgerParams): Promise<RewardPointLedgerDocument> {
    if (params.session) {
      return this.debitCore(params, params.session);
    }
    // Try with transaction; fall back to non-transactional for standalone MongoDB
    let session: import('mongoose').ClientSession | undefined;
    try {
      session = await this.connection.startSession();
      session.startTransaction();
      const entry = await this.debitCore(params, session);
      await session.commitTransaction();
      return entry;
    } catch (err) {
      if (session && session.inTransaction()) await session.abortTransaction();
      // Standalone MongoDB: fall back to non-transactional
      if (
        err instanceof Error &&
        (err.message.includes('sharded cluster') ||
          err.message.includes('transaction') ||
          err.name === 'MongoServerError')
      ) {
        return this.debitCoreNoSession(params);
      }
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  }

  private async debitCoreNoSession(
    params: LedgerParams,
  ): Promise<RewardPointLedgerDocument> {
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(params.userId),
          points: { $gte: params.points },
        },
        { $inc: { points: -params.points } },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      const currentBalance = await this.getBalance(params.userId);
      throw new BadRequestException(
        `Insufficient points. Current balance: ${currentBalance}, required: ${params.points}`,
      );
    }

    const entry = await this.ledgerModel.create({
      userId: new Types.ObjectId(params.userId),
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      pointsDelta: -params.points,
      balanceAfter: updatedUser.points,
      note: params.note,
      createdBy: params.createdBy,
    });
    return entry;
  }

  private async syncRedemptionNotes(entries: RewardPointLedgerDocument[]) {
    const redemptionEntries = entries.filter(
      (e) => e.sourceType === LedgerSourceType.REDEMPTION && e.sourceId,
    );
    if (redemptionEntries.length === 0) return;

    try {
      const CashoutModel = this.connection.models['CashoutRequest'];
      if (!CashoutModel) return;

      for (const entry of redemptionEntries) {
        const cashout = await CashoutModel.findById(entry.sourceId).exec();
        if (!cashout) continue;

        let newNote: string | null = null;
        const noteLower = entry.note?.toLowerCase() || '';

        if (
          cashout.status === 'PAID' &&
          !noteLower.includes('thành công') &&
          !noteLower.includes('paid')
        ) {
          newNote = `Yêu cầu quy đổi ${cashout.pointsRedeemed} điểm thưởng (Mã: ${cashout.redemptionCode}) - Đã thanh toán thành công.`;
        } else if (
          cashout.status === 'APPROVED' &&
          !noteLower.includes('phê duyệt') &&
          !noteLower.includes('approved')
        ) {
          newNote = `Yêu cầu quy đổi ${cashout.pointsRedeemed} điểm thưởng (Mã: ${cashout.redemptionCode}) - Đã phê duyệt.`;
        } else if (
          cashout.status === 'REJECTED' &&
          !noteLower.includes('từ chối') &&
          !noteLower.includes('rejected')
        ) {
          newNote = `Yêu cầu quy đổi ${cashout.pointsRedeemed} điểm thưởng (Mã: ${cashout.redemptionCode}) - Bị từ chối.`;
        } else if (
          cashout.status === 'FAILED' &&
          !noteLower.includes('thất bại') &&
          !noteLower.includes('failed')
        ) {
          newNote = `Yêu cầu quy đổi ${cashout.pointsRedeemed} điểm thưởng (Mã: ${cashout.redemptionCode}) - Thất bại/Lỗi.`;
        }

        if (newNote) {
          entry.note = newNote;
          await this.ledgerModel
            .updateOne({ _id: entry._id }, { $set: { note: newNote } })
            .exec();
        }
      }
    } catch {
      // Bỏ qua lỗi trong quá trình tự đồng bộ dữ liệu cũ
    }
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

    await this.syncRedemptionNotes(data);

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

    await this.syncRedemptionNotes(data);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
