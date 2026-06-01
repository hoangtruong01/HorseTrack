import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Jockey, JockeySchema } from './schemas/jockey.schema';
import { JockeysController } from './jockeys.controller';
import { JockeysService } from './jockeys.service';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jockey.name, schema: JockeySchema },
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
    UsersModule,
  ],
  controllers: [JockeysController],
  providers: [JockeysService],
  exports: [JockeysService],
})
export class JockeysModule {}
