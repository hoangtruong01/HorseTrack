import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectRegistrationDto {
  @ApiPropertyOptional({ example: 'Horse does not meet health requirements' })
  @IsOptional()
  @IsString()
  reason?: string;
}
