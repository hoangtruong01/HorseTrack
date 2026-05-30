import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
