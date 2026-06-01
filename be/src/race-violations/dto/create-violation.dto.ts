import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ViolationPenalty,
  ViolationSeverity,
  ViolationType,
} from '../schemas/race-violation.schema';

export class CreateViolationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty({ enum: ViolationType })
  @IsNotEmpty()
  @IsEnum(ViolationType)
  type!: ViolationType;

  @ApiProperty({ enum: ViolationSeverity })
  @IsNotEmpty()
  @IsEnum(ViolationSeverity)
  severity!: ViolationSeverity;

  @ApiProperty({ enum: ViolationPenalty, default: ViolationPenalty.NONE })
  @IsNotEmpty()
  @IsEnum(ViolationPenalty)
  penalty!: ViolationPenalty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  raceRegistrationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  horseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  jockeyUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
