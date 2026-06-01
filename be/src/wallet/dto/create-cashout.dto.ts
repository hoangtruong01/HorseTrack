import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCashoutDto {
  @ApiProperty({ example: 1000, description: 'Points to redeem for cashback' })
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  pointsToRedeem!: number;
}
