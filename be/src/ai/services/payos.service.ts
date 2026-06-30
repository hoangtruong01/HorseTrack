import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Webhook } from '@payos/node';
import { PayOS } from '@payos/node';
import { Model, Types } from 'mongoose';
import {
  AIPredictionPackage,
  type AIPredictionPackageDocument,
  PackageStatus,
} from '../schemas/ai-prediction-package.schema';
import {
  Payment,
  type PaymentDocument,
  PaymentStatus,
} from '../schemas/payment.schema';
import {
  SubscriptionStatus,
  UserSubscription,
  type UserSubscriptionDocument,
} from '../schemas/user-subscription.schema';

@Injectable()
export class PayosService {
  private readonly logger = new Logger(PayosService.name);
  private readonly payos: InstanceType<typeof PayOS> | null;
  private readonly returnUrl: string;
  private readonly cancelUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscriptionDocument>,
    @InjectModel(AIPredictionPackage.name)
    private packageModel: Model<AIPredictionPackageDocument>,
  ) {
    const clientId = this.config.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.config.get<string>('PAYOS_API_KEY');
    const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      this.logger.warn(
        'PAYOS credentials not configured — subscription payment unavailable',
      );
      this.payos = null;
    } else {
      this.payos = new PayOS({ clientId, apiKey, checksumKey });
    }

    this.returnUrl = this.config.get<string>(
      'PAYOS_RETURN_URL',
      'http://localhost:3001/payment/success',
    );
    this.cancelUrl = this.config.get<string>(
      'PAYOS_CANCEL_URL',
      'http://localhost:3001/payment/cancel',
    );
  }

  async createPaymentLink(
    packageId: string,
    userId: string,
  ): Promise<{ checkoutUrl: string; orderCode: number }> {
    if (!this.payos) {
      throw new BadRequestException('PayOS chưa được cấu hình trên server');
    }

    const pkg = await this.packageModel.findById(packageId);
    if (!pkg || pkg.status !== PackageStatus.ACTIVE) {
      throw new BadRequestException(
        'Package không tồn tại hoặc không còn hoạt động',
      );
    }

    const orderCode = Date.now() % 9_007_199_254_740_991;

    const linkResponse = await this.payos.paymentRequests.create({
      orderCode,
      amount: pkg.price,
      description: `Gói AI: ${pkg.name}`.substring(0, 25),
      returnUrl: this.returnUrl,
      cancelUrl: this.cancelUrl,
    });

    await this.paymentModel.create({
      userId: new Types.ObjectId(userId),
      packageId: new Types.ObjectId(packageId),
      amount: pkg.price,
      paymentMethod: 'PAYOS',
      status: PaymentStatus.PENDING,
      payosOrderCode: orderCode,
      payosPaymentLinkId: linkResponse.paymentLinkId,
    });

    return { checkoutUrl: linkResponse.checkoutUrl, orderCode };
  }

  async handleWebhook(body: unknown): Promise<void> {
    if (!this.payos) {
      this.logger.error(
        'PayOS webhook nhận được nhưng PAYOS credentials chưa cấu hình. Kiểm tra biến môi trường PAYOS_*.',
      );
      throw new BadRequestException(
        'PayOS chưa được cấu hình — webhook bị từ chối',
      );
    }

    let webhookData: Awaited<
      ReturnType<InstanceType<typeof PayOS>['webhooks']['verify']>
    >;
    try {
      webhookData = await this.payos.webhooks.verify(body as Webhook);
    } catch (err: unknown) {
      this.logger.error(`PayOS webhook verification failed: ${String(err)}`);
      return;
    }

    const orderCode = webhookData?.orderCode;
    if (!orderCode) return;

    const payment = await this.paymentModel.findOne({
      payosOrderCode: orderCode,
    });
    if (!payment) {
      this.logger.warn(
        `PayOS webhook: payment not found for orderCode ${orderCode}`,
      );
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) return;

    if (webhookData.code === '00') {
      payment.status = PaymentStatus.SUCCESS;
      await payment.save();
      await this.activateSubscription(
        payment.userId.toString(),
        payment.packageId.toString(),
      );
    } else {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
    }
  }

  async syncPaymentStatus(orderCode: number): Promise<PaymentStatus> {
    if (!this.payos) {
      throw new BadRequestException('PayOS chưa được cấu hình');
    }

    const payment = await this.paymentModel.findOne({
      payosOrderCode: orderCode,
    });
    if (!payment) {
      throw new NotFoundException(
        `Không tìm thấy payment với orderCode ${orderCode}`,
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return payment.status;
    }

    try {
      const info = await this.payos.paymentRequests.get(orderCode);
      if (info.status === 'PAID') {
        payment.status = PaymentStatus.SUCCESS;
        await payment.save();
        await this.activateSubscription(
          payment.userId.toString(),
          payment.packageId.toString(),
        );
      } else if (info.status === 'CANCELLED' || info.status === 'EXPIRED') {
        payment.status = PaymentStatus.FAILED;
        await payment.save();
      }
    } catch (err: unknown) {
      this.logger.error(
        `PayOS sync failed for orderCode ${orderCode}: ${String(err)}`,
      );
    }

    return payment.status;
  }

  private async activateSubscription(
    userId: string,
    packageId: string,
  ): Promise<void> {
    const pkg = await this.packageModel.findById(packageId);
    if (!pkg) return;

    const now = new Date();
    const durationMs = pkg.durationDays * 24 * 60 * 60 * 1000;

    const existing = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
      endDate: { $gt: now },
    });

    if (existing) {
      existing.endDate = new Date(existing.endDate.getTime() + durationMs);
      await existing.save();
    } else {
      await this.subscriptionModel.create({
        userId: new Types.ObjectId(userId),
        packageId: new Types.ObjectId(packageId),
        startDate: now,
        endDate: new Date(now.getTime() + durationMs),
        status: SubscriptionStatus.ACTIVE,
      });
    }
  }
}
