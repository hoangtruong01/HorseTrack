import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { HorsesService } from './horses.service';
import { HorsesController } from './horses.controller';
import { Horse, HorseSchema } from './schemas/horse.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Horse.name, schema: HorseSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {}
