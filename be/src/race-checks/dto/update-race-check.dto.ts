import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RaceCheckStatus } from '../schemas/race-check.schema';

export class UpdateRaceCheckDto {
  @ApiProperty({ enum: RaceCheckStatus })
  @IsNotEmpty()
  @IsEnum(RaceCheckStatus)
  status!: RaceCheckStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  healthNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equipmentNote?: string;
}
