import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { RoleName } from '../schemas/user.schema';

@Exclude()
export class PublicUserResponseDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  fullName!: string;

  @Expose()
  @ApiPropertyOptional()
  avatar?: string;

  @Expose()
  @ApiProperty({ enum: RoleName, isArray: true })
  roles!: RoleName[];

  @Expose()
  @ApiProperty()
  createdAt!: Date;
}
