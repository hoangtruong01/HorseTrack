import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';
import { RoleName } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: RoleName, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleName, { each: true })
  roles?: RoleName[];
}
