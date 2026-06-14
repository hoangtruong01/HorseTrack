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
