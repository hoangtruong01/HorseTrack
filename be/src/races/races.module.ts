import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { UsersModule } from '../users/users.module';
import { Race, RaceSchema } from './schemas/race.schema';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Race.name, schema: RaceSchema }]),
    TournamentsModule,
    UsersModule,
  ],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
