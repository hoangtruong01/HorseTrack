import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { RoleName, UserStatus } from '../schemas/user.schema';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  fullName: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiPropertyOptional()
  phone?: string;

  @Expose()
  @ApiPropertyOptional()
  address?: string;

  @Expose()
  @ApiPropertyOptional()
  dob?: Date;

  @Expose()
  @ApiPropertyOptional()
  avatar?: string;

  @Expose()
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiProperty({ enum: RoleName, isArray: true })
  roles: RoleName[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
