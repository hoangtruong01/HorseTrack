import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import {
  RefereeProfile,
  RefereeProfileSchema,
} from './schemas/referee-profile.schema';
import { RefereeProfilesController } from './referee-profiles.controller';
import { RefereeProfilesService } from './referee-profiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefereeProfile.name, schema: RefereeProfileSchema },
    ]),
    UsersModule,
  ],
  controllers: [RefereeProfilesController],
  providers: [RefereeProfilesService],
  exports: [RefereeProfilesService],
})
export class RefereeProfilesModule {}
