import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HorsesModule } from '../horses/horses.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { Registration, RegistrationSchema } from './schemas/registration.schema';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    HorsesModule,
    TournamentsModule,
    NotificationsModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
