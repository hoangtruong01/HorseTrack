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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Horse.name, schema: HorseSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {}
