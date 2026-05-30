import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class HorseEntryDto {
  @ApiProperty()
  @IsMongoId()
  horseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  jockeyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  gateNumber?: number;
}

export class CreateRaceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  tournamentId!: string;

  @ApiProperty({ example: 'Race 1 - Quarter Final' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  raceNumber?: number;

  @ApiProperty({ example: '2026-06-05T14:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional({ example: 'Hanoi Racecourse' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  distance?: number;

  @ApiProperty({ type: [HorseEntryDto], minItems: 2 })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => HorseEntryDto)
  horses!: HorseEntryDto[];

  @ApiProperty({ type: [String], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  refereeIds!: string[];

  @ApiPropertyOptional({ example: 'Dry' })
  @IsOptional()
  @IsString()
  trackCondition?: string;

  @ApiPropertyOptional({
    example: 12,
    description:
      'Max horses allowed in this race (overrides tournament maxHorses)',
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  maxHorses?: number;
}
