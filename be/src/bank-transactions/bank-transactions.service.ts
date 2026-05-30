import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BankTransaction,
  BankTransactionDocument,
  BankTransactionMatchedType,
} from './schemas/bank-transaction.schema';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class BankTransactionsService {
  constructor(
    @InjectModel(BankTransaction.name)
    private bankTxModel: Model<BankTransactionDocument>,
  ) {}

  async processWebhook(
    payload: WebhookDto,
    rawPayload: Record<string, unknown>,
  ): Promise<BankTransactionDocument> {
    // Idempotency: if providerTransactionId exists and already recorded, return existing
    if (payload.providerTransactionId) {
      const existing = await this.bankTxModel.findOne({
        provider: payload.provider,
        providerTransactionId: payload.providerTransactionId,
      });
      if (existing) {
        // Already processed — idempotent response
        return existing;
      }
    }

    // Check bankTransactionCode uniqueness as secondary idempotency key
    if (payload.bankTransactionCode) {
      const existing = await this.bankTxModel.findOne({
        bankTransactionCode: payload.bankTransactionCode,
      });
      if (existing) {
        return existing;
      }
    }

    return this.bankTxModel.create({
      provider: payload.provider,
      providerTransactionId: payload.providerTransactionId,
      bankTransactionCode: payload.bankTransactionCode,
      direction: payload.direction,
      amount: payload.amount,
      currency: payload.currency ?? 'VND',
      description: payload.description,
      counterAccountNo: payload.counterAccountNo,
      counterAccountName: payload.counterAccountName,
      transactionTime: new Date(payload.transactionTime),
      matchedType: BankTransactionMatchedType.UNKNOWN,
      rawPayload,
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    matchedType?: BankTransactionMatchedType,
  ) {
    const filter: Record<string, unknown> = {};
    if (matchedType) filter.matchedType = matchedType;

    const [data, total] = await Promise.all([
      this.bankTxModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ transactionTime: -1 })
        .exec(),
      this.bankTxModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<BankTransactionDocument | null> {
    return this.bankTxModel.findById(id).exec();
  }
}
