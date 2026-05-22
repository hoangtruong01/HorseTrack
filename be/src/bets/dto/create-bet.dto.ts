import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBetDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsNotEmpty()
  @IsMongoId()
  raceId: string;

  @ApiProperty({ example: '665abc123def456789012346' })
  @IsNotEmpty()
  @IsMongoId()
  horseId: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(10)
  amount: number;
}
