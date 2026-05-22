import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PrizePaymentStatus } from '../schemas/prize.schema';

export class UpdatePrizeStatusDto {
  @ApiProperty({ enum: PrizePaymentStatus })
  @IsNotEmpty()
  @IsEnum(PrizePaymentStatus)
  status: PrizePaymentStatus;
}
