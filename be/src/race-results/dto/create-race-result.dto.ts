import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRaceResultDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  horseId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  jockeyId?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  rank: number;

  @ApiPropertyOptional({ example: 72.5, description: 'Finish time in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finishTime?: number;

  @ApiPropertyOptional({ example: 'Crossed lane' })
  @IsOptional()
  @IsString()
  violation?: string;
}
