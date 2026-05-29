import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;
}
