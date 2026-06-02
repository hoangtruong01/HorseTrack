import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RaceResultOutcome } from '../schemas/race-result.schema';

export class CreateRaceResultDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

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

  @ApiPropertyOptional({
    example: 1,
    description: 'Finishing rank (required for FINISHED outcome)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;

  @ApiPropertyOptional({
    example: 72500,
    description: 'Finish time in milliseconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finishTimeMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
