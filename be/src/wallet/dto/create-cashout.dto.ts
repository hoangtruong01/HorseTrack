import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

/** Các mốc điểm cố định được phép quy đổi. */
export const REDEMPTION_TIERS = [5000, 10000, 20000, 50000, 100000];

export class CreateCashoutDto {
  @ApiProperty({
    example: 5000,
    enum: REDEMPTION_TIERS,
    description: 'Points to redeem — must be one of the fixed tiers',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn(REDEMPTION_TIERS)
  pointsToRedeem!: number;
}
