import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RaceResultOutcome, RaceIncident } from '../schemas/race-result.schema';

export class UpdateRaceResultDto {
  @ApiPropertyOptional({ enum: RaceResultOutcome })
  @IsOptional()
  @IsEnum(RaceResultOutcome)
  outcome?: RaceResultOutcome;

  @ApiPropertyOptional({ enum: RaceIncident })
  @IsOptional()
  @IsEnum(RaceIncident)
  incident?: RaceIncident;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;

  @ApiPropertyOptional({ example: 72500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finishTimeMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
