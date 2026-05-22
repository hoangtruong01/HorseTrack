import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  tournamentId: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId: string;

  @ApiPropertyOptional({ example: '665abc123def456789012347' })
  @IsOptional()
  @IsMongoId()
  jockeyId?: string;
}
