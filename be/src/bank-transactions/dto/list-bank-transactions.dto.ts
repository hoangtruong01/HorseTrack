import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BankTransactionMatchedType } from '../schemas/bank-transaction.schema';

export class ListBankTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BankTransactionMatchedType })
  @IsOptional()
  @IsEnum(BankTransactionMatchedType)
  matchedType?: BankTransactionMatchedType;
}
