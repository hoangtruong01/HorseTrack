import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { HorseGender, HorseHealthStatus } from '../schemas/horse.schema';

export class CreateHorseDto {
  @ApiProperty({ example: 'Thunder Bolt' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Thoroughbred' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({ enum: HorseGender, example: HorseGender.MALE })
  @IsOptional()
  @IsEnum(HorseGender)
  gender?: HorseGender;

  @ApiPropertyOptional({ example: 'Bay' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @ApiPropertyOptional({ example: 160 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @ApiPropertyOptional({ example: '2020-03-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: HorseHealthStatus,
    default: HorseHealthStatus.HEALTHY,
  })
  @IsOptional()
  @IsEnum(HorseHealthStatus)
  healthStatus?: HorseHealthStatus;

  @ApiPropertyOptional({ example: 'Fast and strong horse' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 60, minimum: 30, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(100)
  baseSpeed?: number;

  @ApiPropertyOptional({ example: 70, minimum: 30, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(100)
  staminaScore?: number;

  @ApiPropertyOptional({ type: [String], description: 'List of existing image URLs to keep' })
  @IsOptional()
  existingImages?: string[] | string;
}
