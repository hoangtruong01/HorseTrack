import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Spring Cup 2026' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Annual spring horse racing tournament' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Hanoi Racecourse' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ example: '2026-05-30' })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  maxHorses?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prizePool?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
