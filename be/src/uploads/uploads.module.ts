import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
