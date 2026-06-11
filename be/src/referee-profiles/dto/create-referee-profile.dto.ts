import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRefereeProfileDto {
  @ApiPropertyOptional({ example: 'REF-2024-001' })
  @IsOptional()
  @IsString()
  licenseNo?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificates?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'URL of uploaded license image' })
  @IsOptional()
  @IsString()
  licenseImage?: string;
}
