import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  registrationId!: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  jockeyId!: string;

  @ApiPropertyOptional({
    example:
      'Hey, I would like you to ride my horse Thunder Bolt in the tournament!',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: 30,
    description: 'Percentage of prize shared with jockey (5-50%)',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(50)
  jockeySharePercent!: number;
}
