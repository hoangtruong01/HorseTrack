import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
  @ApiPropertyOptional({ example: '665abc123def456789012345' })
  @IsOptional()
  @IsMongoId()
  tournamentId?: string;

  @ApiProperty({ example: '665abc123def456789012348' })
  @IsNotEmpty()
  @IsMongoId()
  raceId: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId: string;

  @ApiPropertyOptional({ example: '665abc123def456789012347' })
  @IsOptional()
  @IsMongoId()
  jockeyId?: string;
}
