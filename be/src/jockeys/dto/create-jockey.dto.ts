import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateJockeyProfileDto {
  @ApiProperty({ example: 165 })
  @IsNotEmpty()
  @IsInt()
  @Min(100)
  height: number;

  @ApiProperty({ example: 52 })
  @IsNotEmpty()
  @IsInt()
  @Min(30)
  weight: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'Professional jockey with 5 years experience.' })
  @IsOptional()
  @IsString()
  bio?: string;
}
