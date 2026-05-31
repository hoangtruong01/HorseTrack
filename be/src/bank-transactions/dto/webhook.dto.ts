import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  BankTransactionDirection,
  BankTransactionProvider,
} from '../schemas/bank-transaction.schema';

export class WebhookDto {
  @ApiProperty({ enum: BankTransactionProvider })
  @IsNotEmpty()
  @IsEnum(BankTransactionProvider)
  provider!: BankTransactionProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerTransactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankTransactionCode?: string;

  @ApiProperty({ enum: BankTransactionDirection })
  @IsNotEmpty()
  @IsEnum(BankTransactionDirection)
  direction!: BankTransactionDirection;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ default: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  counterAccountNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  counterAccountName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  transactionTime!: string;
}
