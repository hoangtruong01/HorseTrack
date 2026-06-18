import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Payment } from '../schemas/payment.schema';
import { UserSubscription } from '../schemas/user-subscription.schema';
import { AIPredictionPackage } from '../schemas/ai-prediction-package.schema';
import { PayosService } from './payos.service';

describe('PayosService.handleWebhook (unconfigured)', () => {
  let service: PayosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayosService,
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: getModelToken(Payment.name), useValue: {} },
        { provide: getModelToken(UserSubscription.name), useValue: {} },
        { provide: getModelToken(AIPredictionPackage.name), useValue: {} },
      ],
    }).compile();

    service = module.get(PayosService);
  });

  it('logs an error and throws BadRequestException when PayOS is not configured', async () => {
    const errorSpy = jest
      .spyOn(
        (service as unknown as { logger: { error: jest.Mock } }).logger,
        'error',
      )
      .mockImplementation(() => undefined);

    await expect(service.handleWebhook({ orderCode: 123 })).rejects.toThrow(
      BadRequestException,
    );

    expect(errorSpy).toHaveBeenCalled();
  });
});
