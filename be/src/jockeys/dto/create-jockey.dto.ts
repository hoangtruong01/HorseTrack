import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JockeySkillLevel } from '../schemas/jockey.schema';

export class CreateJockeyProfileDto {
  @ApiProperty({ example: 165, description: 'Height in cm' })
  @IsNotEmpty()
  @IsInt()
  @Min(100)
  heightCm!: number;

  @ApiProperty({ example: 52, description: 'Weight in kg' })
  @IsNotEmpty()
  @IsInt()
  @Min(30)
  weightKg!: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({
    enum: JockeySkillLevel,
    example: JockeySkillLevel.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(JockeySkillLevel)
  skillLevel?: JockeySkillLevel;

  @ApiPropertyOptional({
    example: 'Professional jockey with 5 years experience.',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
