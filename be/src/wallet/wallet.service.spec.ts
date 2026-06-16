import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';
import {
  CashoutRequest,
  CashoutStatus,
} from './schemas/cashout-request.schema';
import {
  TransactionStatus,
  WalletTransaction,
} from './schemas/wallet-transaction.schema';
import { CreateCashoutDto } from './dto/create-cashout.dto';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let cashoutModel: {
    findById: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let transactionModel: { findOneAndUpdate: jest.Mock; create: jest.Mock };
  let ledgerService: {
    getBalance: jest.Mock;
    debit: jest.Mock;
    credit: jest.Mock;
    updateNote: jest.Mock;
  };
  let mockConnection: { startSession: jest.Mock };

  function makeSession() {
    const endSession = jest.fn().mockResolvedValue(undefined);
    const withTransaction = jest
      .fn()
      .mockImplementation(async (fn: () => Promise<void>) => {
        await fn();
      });
    return { withTransaction, endSession };
  }

  const userId = new Types.ObjectId();
  const handlerId = new Types.ObjectId().toHexString();
  const cashoutId = new Types.ObjectId();

  interface MockCashoutRequest {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    pointsRedeemed: number;
    redemptionCode: string;
    status: CashoutStatus;
    approvedBy?: Types.ObjectId;
    paidBy?: Types.ObjectId;
    rejectedBy?: Types.ObjectId;
    paidAt?: Date;
    save: jest.Mock;
  }

  function makeRequest(status = CashoutStatus.PENDING): MockCashoutRequest {
    return {
      _id: cashoutId,
      userId,
      pointsRedeemed: 1000,
      redemptionCode: 'RWD-TEST01',
      status,
      save: jest.fn().mockResolvedValue(null),
    };
  }

  beforeEach(async () => {
    cashoutModel = {
      findById: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    transactionModel = {
      findOneAndUpdate: jest.fn(),
      create: jest.fn().mockResolvedValue([{}]),
    };
    ledgerService = {
      getBalance: jest.fn(),
      debit: jest.fn(),
      credit: jest.fn(),
      updateNote: jest.fn(),
    };
    mockConnection = { startSession: jest.fn() };
    mockConnection.startSession.mockResolvedValue(makeSession());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getModelToken(WalletTransaction.name),
          useValue: transactionModel,
        },
        { provide: getModelToken(CashoutRequest.name), useValue: cashoutModel },
        { provide: RewardPointLedgerService, useValue: ledgerService },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get(WalletService);
  });

  it('approves pending cashout without debiting points', async () => {
    const session = makeSession();
    mockConnection.startSession.mockResolvedValue(session);
    const request = makeRequest();
    cashoutModel.findById.mockResolvedValue(request);

    await service.processCashout(
      cashoutId.toHexString(),
      CashoutStatus.APPROVED,
      handlerId,
    );

    expect(ledgerService.getBalance).not.toHaveBeenCalled();
    expect(ledgerService.debit).not.toHaveBeenCalled();
    expect(transactionModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(request.status).toBe(CashoutStatus.APPROVED);
    expect(request.approvedBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.save).toHaveBeenCalledWith({ session });
  });

  it('updates ledger note when cashout is paid', async () => {
    const session = makeSession();
    mockConnection.startSession.mockResolvedValue(session);
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);

    await service.processCashout(
      cashoutId.toHexString(),
      CashoutStatus.PAID,
      handlerId,
    );

    expect(ledgerService.updateNote).toHaveBeenCalledWith(
      cashoutId.toHexString(),
      LedgerSourceType.REDEMPTION,
      `Yêu cầu quy đổi ${request.pointsRedeemed} điểm thưởng (Mã: ${request.redemptionCode}) - Đã thanh toán thành công.`,
    );
    expect(transactionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { cashoutRequestId: cashoutId },
      { status: TransactionStatus.SUCCESS },
      { session },
    );
    expect(request.status).toBe(CashoutStatus.PAID);
    expect(request.paidBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.paidAt).toBeInstanceOf(Date);
    expect(request.save).toHaveBeenCalledWith({ session });
  });

  it('refunds points and updates ledger note when cashout is rejected', async () => {
    const session = makeSession();
    mockConnection.startSession.mockResolvedValue(session);
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);

    await service.processCashout(
      cashoutId.toHexString(),
      CashoutStatus.REJECTED,
      handlerId,
    );

    expect(ledgerService.updateNote).toHaveBeenCalledWith(
      cashoutId.toHexString(),
      LedgerSourceType.REDEMPTION,
      `Yêu cầu quy đổi ${request.pointsRedeemed} điểm thưởng (Mã: ${request.redemptionCode}) - Bị từ chối.`,
    );
    expect(ledgerService.credit).toHaveBeenCalledWith({
      userId: userId.toHexString(),
      points: 1000,
      sourceType: LedgerSourceType.REDEMPTION,
      sourceId: cashoutId.toHexString(),
      note: `Hoàn điểm do yêu cầu quy đổi bị từ chối (Mã: ${request.redemptionCode})`,
      createdBy: handlerId,
      session,
    });
    expect(transactionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { cashoutRequestId: cashoutId },
      { status: TransactionStatus.FAILED },
      { session },
    );
    expect(request.status).toBe(CashoutStatus.REJECTED);
    expect(request.rejectedBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.approvedBy).toBeUndefined();
    expect(request.save).toHaveBeenCalledWith({ session });
  });

  it('blocks already processed requests', async () => {
    cashoutModel.findById.mockResolvedValue(makeRequest(CashoutStatus.PAID));

    await expect(
      service.processCashout(
        cashoutId.toHexString(),
        CashoutStatus.PAID,
        handlerId,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when cashout request does not exist', async () => {
    cashoutModel.findById.mockResolvedValue(null);

    await expect(
      service.processCashout(
        cashoutId.toHexString(),
        CashoutStatus.PAID,
        handlerId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  describe('requestCashout', () => {
    const dto: CreateCashoutDto = { pointsToRedeem: 1000 };
    const requesterId = userId.toHexString();

    it('debits via ledger before creating wallet transaction, all within a session', async () => {
      const session = makeSession();
      mockConnection.startSession.mockResolvedValue(session);
      ledgerService.getBalance.mockResolvedValue(5000);
      const createdDoc = { _id: cashoutId };
      cashoutModel.create.mockResolvedValue([createdDoc]);

      const result = await service.requestCashout(dto, requesterId);

      expect(cashoutModel.create).toHaveBeenCalledWith(
        [expect.objectContaining({ pointsRedeemed: 1000 })],
        { session },
      );
      expect(ledgerService.debit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: requesterId,
          points: 1000,
          sourceId: String(cashoutId),
          session,
        }),
      );
      expect(transactionModel.create).toHaveBeenCalledWith(
        [expect.objectContaining({ cashoutRequestId: cashoutId })],
        { session },
      );
      expect(result).toBe(createdDoc);
    });

    it('throws BadRequest when balance is insufficient (no doc, no debit)', async () => {
      ledgerService.getBalance.mockResolvedValue(100);

      await expect(service.requestCashout(dto, requesterId)).rejects.toThrow(
        BadRequestException,
      );
      expect(cashoutModel.create).not.toHaveBeenCalled();
      expect(ledgerService.debit).not.toHaveBeenCalled();
    });

    it('does not create wallet transaction if debit fails', async () => {
      const session = makeSession();
      mockConnection.startSession.mockResolvedValue(session);
      ledgerService.getBalance.mockResolvedValue(5000);
      cashoutModel.create.mockResolvedValue([{ _id: cashoutId }]);
      ledgerService.debit.mockRejectedValue(new Error('debit failed'));

      await expect(service.requestCashout(dto, requesterId)).rejects.toThrow(
        'debit failed',
      );
      expect(transactionModel.create).not.toHaveBeenCalled();
    });
  });

  it('propagates error and ends session when refund credit fails', async () => {
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);
    const session = makeSession();
    mockConnection.startSession.mockResolvedValue(session);
    ledgerService.credit.mockRejectedValue(new Error('DB fail'));

    await expect(
      service.processCashout(
        cashoutId.toHexString(),
        CashoutStatus.REJECTED,
        handlerId,
      ),
    ).rejects.toThrow('DB fail');
    expect(session.endSession).toHaveBeenCalled();
  });
});
