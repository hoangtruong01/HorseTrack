import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRefereeProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

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

  @ApiPropertyOptional({ description: 'URL of uploaded portrait image' })
  @IsOptional()
  @IsString()
  portraitImage?: string;

  @ApiPropertyOptional({ description: 'URL of uploaded certificate image' })
  @IsOptional()
  @IsString()
  certificateImage?: string;

  @ApiPropertyOptional({
    description: 'Array of uploaded certificate image URLs (max 7)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsString({ each: true })
  certificateImages?: string[];
}
