import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePredictionDto {
  @ApiProperty({ description: 'Race ID to place prediction for' })
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty({ description: 'Predicted winner horse ID' })
  @IsNotEmpty()
  @IsMongoId()
  predictedHorseId!: string;

  @ApiPropertyOptional({
    description: 'Number of points to bet (0 for free prediction)',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  betPoints?: number;
}
