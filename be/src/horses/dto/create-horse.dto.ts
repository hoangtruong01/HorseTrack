import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { HorseGender, HorseHealthStatus } from '../schemas/horse.schema';

export class CreateHorseDto {
  @ApiProperty({ example: 'Thunder Bolt' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Thoroughbred' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
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
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 160 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

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

  @ApiPropertyOptional({ example: 'https://example.com/horse.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'Fast and strong horse' })
  @IsOptional()
  @IsString()
  description?: string;
}
