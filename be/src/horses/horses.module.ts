import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HorsesService } from './horses.service';
import { HorsesController } from './horses.controller';
import { Horse, HorseSchema } from './schemas/horse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Horse.name, schema: HorseSchema }]),
  ],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {}
