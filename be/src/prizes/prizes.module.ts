import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Prize, PrizeSchema } from './schemas/prize.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prize.name, schema: PrizeSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Horse.name, schema: HorseSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    RewardPointLedgerModule,
    NotificationsModule,
  ],
  controllers: [PrizesController],
  providers: [PrizesService],
  exports: [PrizesService],
})
export class PrizesModule {}
