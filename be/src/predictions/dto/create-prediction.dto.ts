import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiPropertyOptional({ description: 'Predicted 1st place horse' })
  @IsOptional()
  @IsMongoId()
  predictedFirstHorseId?: string;

  @ApiPropertyOptional({ description: 'Predicted 2nd place horse' })
  @IsOptional()
  @IsMongoId()
  predictedSecondHorseId?: string;

  @ApiPropertyOptional({ description: 'Predicted 3rd place horse' })
  @IsOptional()
  @IsMongoId()
  predictedThirdHorseId?: string;
}
