import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CashoutStatus } from '../schemas/cashout-request.schema';
 
export class ProcessCashoutDto {
  @ApiProperty({
    enum: [CashoutStatus.APPROVED, CashoutStatus.REJECTED, CashoutStatus.PAID, CashoutStatus.FAILED],
    example: CashoutStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(CashoutStatus)
  status!: CashoutStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
