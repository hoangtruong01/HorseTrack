import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRaceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  tournamentId!: string;

  @ApiProperty({ example: 'Race 1 - Quarter Final' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  raceNumber?: number;

  @ApiProperty({ example: '2026-06-05T14:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @ApiPropertyOptional({ example: '2026-06-05T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ example: 'Hanoi Racecourse' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 1200, description: 'Distance in meters' })
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  distanceMeters!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  lapCount?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 'Dry' })
  @IsOptional()
  @IsString()
  trackCondition?: string;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prize?: number;
}
