import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ProposedRaceInfoDto {
  @ApiProperty({ example: 'Race 1: Qualification' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: ['665abc123def456789012346'] })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  horseIds: string[];

  @ApiProperty({ example: ['665abc123def456789012347'] })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  refereeIds: string[];

  @ApiPropertyOptional({ example: 'Good' })
  @IsOptional()
  @IsString()
  trackCondition?: string;
}

export class CreateAiArrangementSuggestionDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  tournamentId: string;

  @ApiProperty({ type: [ProposedRaceInfoDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposedRaceInfoDto)
  proposedRaces: ProposedRaceInfoDto[];

  @ApiPropertyOptional({ example: 'Matchmaking is balanced by horse historical performance.' })
  @IsOptional()
  @IsString()
  reasoning?: string;
}
