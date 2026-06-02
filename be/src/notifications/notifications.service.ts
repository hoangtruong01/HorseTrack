import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => NotificationsGateway))
    private gateway: NotificationsGateway,
  ) {}

  /** Programmatic method to send inside other services */
  async send(
    userId: string,
    title: string,
    body: string,
    type: NotificationType = NotificationType.SYSTEM,
    data?: Record<string, unknown>,
  ): Promise<NotificationDocument> {
    const notif = await this.notificationModel.create({
      userId,
      title,
      body,
      type,
      isRead: false,
      data,
    });

    // Send realtime event!
    this.gateway.sendToUser(userId, 'notification', notif);

    return notif;
  }

  async findMyNotifications(userId: string, page = 1, limit = 20) {
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ isRead: 1, createdAt: -1 })
        .exec(),
      this.notificationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notif = await this.notificationModel.findOne({ _id: id, userId });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.isRead = true;
    notif.readAt = new Date();
    return notif.save();
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );
    return { modifiedCount: result.modifiedCount };
  }
}
