import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAiPredictionSuggestionDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  raceId: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  suggestedWinnerId: string;

  @ApiProperty({ example: ['665abc123def456789012347'] })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  suggestedPlaceIds: string[];

  @ApiPropertyOptional({ example: 'This horse has higher speed in mud track.' })
  @IsOptional()
  @IsString()
  reasoning?: string;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  confidenceLevel?: number;
}
