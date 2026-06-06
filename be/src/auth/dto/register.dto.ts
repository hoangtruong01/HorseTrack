import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsArray,
  Matches,
} from 'class-validator';
import { RoleName } from '../../users/schemas/user.schema';
import { IsIn } from 'class-validator';

/** Only these roles may be chosen during self-registration */
const SELF_REGISTER_ROLES = [RoleName.SPECTATOR, RoleName.OWNER] as const;

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    minLength: 8,
    description:
      'At least 8 chars, must include uppercase, lowercase, and digit',
  })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password!: string;

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

  @ApiPropertyOptional({ enum: SELF_REGISTER_ROLES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(SELF_REGISTER_ROLES, {
    each: true,
    message: 'Self-registration only allows spectator or owner roles',
  })
  roles?: RoleName[];
}
