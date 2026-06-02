import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RaceResultOutcome, RaceIncident } from '../schemas/race-result.schema';

export class BulkRaceResultItemDto {
  @ApiProperty({ description: 'Registration ID of the horse in this race' })
  @IsNotEmpty()
  @IsMongoId()
  raceRegistrationId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  horseId!: string;

  @ApiProperty({ enum: RaceResultOutcome })
  @IsNotEmpty()
  @IsEnum(RaceResultOutcome)
  outcome!: RaceResultOutcome;

  @ApiPropertyOptional({ enum: RaceIncident, default: RaceIncident.NONE })
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

export class BulkRaceResultsDto {
  @ApiProperty({ type: [BulkRaceResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkRaceResultItemDto)
  results!: BulkRaceResultItemDto[];
}
