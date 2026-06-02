import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreatePredictionDto {
  @ApiProperty({ description: 'Race ID to place prediction for' })
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty({ description: 'Predicted winner horse ID' })
  @IsNotEmpty()
  @IsMongoId()
  predictedHorseId!: string;
}
