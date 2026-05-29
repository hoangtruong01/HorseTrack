import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CashoutStatus } from '../schemas/cashout-request.schema';

export class ProcessCashoutDto {
  @ApiProperty({
    enum: [CashoutStatus.APPROVED, CashoutStatus.REJECTED, CashoutStatus.PAID],
    example: CashoutStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(CashoutStatus)
  status: CashoutStatus;
}
