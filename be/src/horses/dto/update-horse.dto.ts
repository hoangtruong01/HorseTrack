import { PartialType } from '@nestjs/swagger';
import { CreateHorseDto } from './create-horse.dto';

export class UpdateHorseDto extends PartialType(CreateHorseDto) {}
