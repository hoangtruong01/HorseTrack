import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
