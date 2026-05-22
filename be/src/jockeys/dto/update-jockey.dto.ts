import { PartialType } from '@nestjs/swagger';
import { CreateJockeyProfileDto } from './create-jockey.dto';

export class UpdateJockeyProfileDto extends PartialType(CreateJockeyProfileDto) {}
