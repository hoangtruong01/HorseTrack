import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google OAuth2 credential ID Token' })
  @IsString()
  @IsNotEmpty()
  credential!: string;
}
