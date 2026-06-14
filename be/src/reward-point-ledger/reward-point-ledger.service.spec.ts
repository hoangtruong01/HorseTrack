import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RewardPointLedger } from './schemas/reward-point-ledger.schema';
import { User } from '../users/schemas/user.schema';
import { RewardPointLedgerService } from './reward-point-ledger.service';

describe('RewardPointLedgerService.getBalance', () => {
  let service: RewardPointLedgerService;
  let userModel: { findById: jest.Mock };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    userModel = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardPointLedgerService,
        { provide: getModelToken(RewardPointLedger.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getConnectionToken(), useValue: {} },
      ],
    }).compile();

    service = module.get(RewardPointLedgerService);
  });

  it('reads the balance from User.points (source of truth)', async () => {
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ points: 250 }),
      }),
    });

    const balance = await service.getBalance(userId);

    expect(balance).toBe(250);
    expect(userModel.findById).toHaveBeenCalledWith(userId);
  });

  it('returns 0 when user not found', async () => {
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    expect(await service.getBalance(userId)).toBe(0);
  });
});

describe('RewardPointLedgerService.credit (atomic)', () => {
  let service: RewardPointLedgerService;
  let userModel: { findByIdAndUpdate: jest.Mock };
  let ledgerModel: { create: jest.Mock };
  let session: {
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    abortTransaction: jest.Mock;
    endSession: jest.Mock;
    inTransaction: jest.Mock;
  };
  let connection: { startSession: jest.Mock };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
      inTransaction: jest.fn().mockReturnValue(true),
    };
    connection = { startSession: jest.fn().mockResolvedValue(session) };
    userModel = {
      findByIdAndUpdate: jest.fn().mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ points: 300 }),
        }),
      }),
    };
    ledgerModel = {
      create: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId() }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardPointLedgerService,
        {
          provide: getModelToken(RewardPointLedger.name),
          useValue: ledgerModel,
        },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get(RewardPointLedgerService);
  });

  it('commits the $inc and the ledger row in one transaction', async () => {
    await service.credit({
      userId,
      points: 100,
      sourceType: 'race_win_reward' as never,
    });

    expect(connection.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    expect(ledgerModel.create).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ pointsDelta: 100, balanceAfter: 300 }),
      ]),
      { session },
    );
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});

describe('RewardPointLedgerService.debit (insufficient balance)', () => {
  let service: RewardPointLedgerService;
  let userModel: { findOneAndUpdate: jest.Mock; findById: jest.Mock };
  let ledgerModel: { create: jest.Mock };
  let session: {
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    abortTransaction: jest.Mock;
    endSession: jest.Mock;
    inTransaction: jest.Mock;
  };
  let connection: { startSession: jest.Mock };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
      // false after abortTransaction is called in the insufficient-balance path
      inTransaction: jest.fn().mockReturnValue(false),
    };
    connection = { startSession: jest.fn().mockResolvedValue(session) };
    userModel = {
      // atomic conditional update returns null when balance is insufficient
      findOneAndUpdate: jest.fn().mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      }),
      // getBalance fallback (reads User.points outside the aborted txn)
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ points: 5 }),
        }),
      }),
    };
    ledgerModel = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardPointLedgerService,
        {
          provide: getModelToken(RewardPointLedger.name),
          useValue: ledgerModel,
        },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get(RewardPointLedgerService);
  });

  it('aborts the transaction, writes no ledger row, and throws when balance is insufficient', async () => {
    await expect(
      service.debit({
        userId,
        points: 100,
        sourceType: 'redemption' as never,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(ledgerModel.create).not.toHaveBeenCalled();
    expect(session.commitTransaction).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});
