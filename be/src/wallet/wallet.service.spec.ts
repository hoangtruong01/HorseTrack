import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';
import { User } from '../users/schemas/user.schema';
import { CashoutRequest, CashoutStatus } from './schemas/cashout-request.schema';
import {
  TransactionStatus,
  WalletTransaction,
} from './schemas/wallet-transaction.schema';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let cashoutModel: { findById: jest.Mock };
  let transactionModel: { findOneAndUpdate: jest.Mock };
  let ledgerService: { getBalance: jest.Mock; debit: jest.Mock; credit: jest.Mock };

  const userId = new Types.ObjectId();
  const handlerId = new Types.ObjectId().toHexString();
  const cashoutId = new Types.ObjectId();

  function makeRequest(status = CashoutStatus.PENDING) {
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
    cashoutModel = { findById: jest.fn() };
    transactionModel = { findOneAndUpdate: jest.fn() };
    ledgerService = {
      getBalance: jest.fn(),
      debit: jest.fn(),
      credit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getModelToken(User.name), useValue: {} },
        { provide: getModelToken(WalletTransaction.name), useValue: transactionModel },
        { provide: getModelToken(CashoutRequest.name), useValue: cashoutModel },
        { provide: RewardPointLedgerService, useValue: ledgerService },
      ],
    }).compile();

    service = module.get(WalletService);
  });

  it('approves pending cashout without debiting points', async () => {
    const request = makeRequest();
    cashoutModel.findById.mockResolvedValue(request);

    await service.processCashout(cashoutId.toHexString(), CashoutStatus.APPROVED, handlerId);

    expect(ledgerService.getBalance).not.toHaveBeenCalled();
    expect(ledgerService.debit).not.toHaveBeenCalled();
    expect(transactionModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(request.status).toBe(CashoutStatus.APPROVED);
    expect(request.approvedBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.save).toHaveBeenCalled();
  });

  it('debits points when cashout is paid', async () => {
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);
    ledgerService.getBalance.mockResolvedValue(5000);

    await service.processCashout(cashoutId.toHexString(), CashoutStatus.PAID, handlerId);

    expect(ledgerService.debit).toHaveBeenCalledWith({
      userId: userId.toHexString(),
      points: 1000,
      sourceType: LedgerSourceType.REDEMPTION,
      sourceId: cashoutId.toHexString(),
      note: 'Cashout paid (Code: RWD-TEST01)',
      createdBy: handlerId,
    });
    expect(transactionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { cashoutRequestId: cashoutId },
      { status: TransactionStatus.SUCCESS },
    );
    expect(request.status).toBe(CashoutStatus.PAID);
    expect(request.paidBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.paidAt).toBeInstanceOf(Date);
  });

  it('rejects pending or approved cashout without refunding points', async () => {
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);

    await service.processCashout(cashoutId.toHexString(), CashoutStatus.REJECTED, handlerId);

    expect(ledgerService.credit).not.toHaveBeenCalled();
    expect(ledgerService.debit).not.toHaveBeenCalled();
    expect(transactionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { cashoutRequestId: cashoutId },
      { status: TransactionStatus.FAILED },
    );
    expect(request.status).toBe(CashoutStatus.REJECTED);
  });

  it('does not pay cashout when current balance is insufficient', async () => {
    const request = makeRequest(CashoutStatus.APPROVED);
    cashoutModel.findById.mockResolvedValue(request);
    ledgerService.getBalance.mockResolvedValue(500);

    await expect(
      service.processCashout(cashoutId.toHexString(), CashoutStatus.PAID, handlerId),
    ).rejects.toThrow(BadRequestException);

    expect(ledgerService.debit).not.toHaveBeenCalled();
    expect(transactionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('blocks already processed requests', async () => {
    cashoutModel.findById.mockResolvedValue(makeRequest(CashoutStatus.PAID));

    await expect(
      service.processCashout(cashoutId.toHexString(), CashoutStatus.PAID, handlerId),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when cashout request does not exist', async () => {
    cashoutModel.findById.mockResolvedValue(null);

    await expect(
      service.processCashout(cashoutId.toHexString(), CashoutStatus.PAID, handlerId),
    ).rejects.toThrow(NotFoundException);
  });
});
