import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
import { RaceResult, RaceResultSchema } from './schemas/race-result.schema';
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';
import { PrizesModule } from '../prizes/prizes.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
    RacesModule,
    PrizesModule,
    PredictionsModule,
  ],
  controllers: [RaceResultsController],
  providers: [RaceResultsService],
  exports: [RaceResultsService],
})
export class RaceResultsModule {}
