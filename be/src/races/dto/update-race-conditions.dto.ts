import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRaceConditionsDto {
  @ApiPropertyOptional({ example: 'Dry' })
  @IsOptional()
  @IsString()
  trackCondition?: string;

  @ApiPropertyOptional({ example: 'Sunny' })
  @IsOptional()
  @IsString()
  weatherSnapshot?: string;
}
