import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RaceStatus } from '../schemas/race.schema';

export class UpdateRaceStatusDto {
  @ApiProperty({ enum: RaceStatus })
  @IsNotEmpty()
  @IsEnum(RaceStatus)
  status!: RaceStatus;
}
