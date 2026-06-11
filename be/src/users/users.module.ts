import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { Jockey, JockeySchema } from '../jockeys/schemas/jockey.schema';
import {
  RefereeProfile,
  RefereeProfileSchema,
} from '../referee-profiles/schemas/referee-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jockey.name, schema: JockeySchema },
      { name: RefereeProfile.name, schema: RefereeProfileSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
