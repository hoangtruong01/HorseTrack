import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAiPackageDto {
  @ApiProperty({ example: 'Gold VIP Package' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Access to top-tier AI predictions with 90% confidence',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 30 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durationDays!: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  accuracyRate?: number;
}
