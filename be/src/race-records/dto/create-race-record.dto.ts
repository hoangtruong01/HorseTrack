import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRaceRecordDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId!: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  position!: number;

  @ApiProperty({ example: 124.5, description: 'Finish time in seconds' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  finishTime!: number;

  @ApiProperty({ example: 4 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  gateNumber!: number;

  @ApiPropertyOptional({ example: 55.4, description: 'Average speed in km/h' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({
    example: 1200,
    description: 'Total distance in meters',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceCovered?: number;

  @ApiPropertyOptional({ example: 'Slight muscle strain on front leg' })
  @IsOptional()
  @IsString()
  injuryNotes?: string;
}
