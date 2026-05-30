import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreatePredictionDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  raceId!: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId!: string;

  @ApiProperty({
    example: 1,
    description: 'Predicted rank/position of the horse',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  predictedPosition?: number;
}
