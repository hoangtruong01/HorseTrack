import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { RefereeRole } from '../schemas/referee-assignment.schema';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  refereeUserId!: string;

  @ApiPropertyOptional({ enum: RefereeRole, default: RefereeRole.MAIN })
  @IsOptional()
  @IsEnum(RefereeRole)
  role?: RefereeRole;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;
}
