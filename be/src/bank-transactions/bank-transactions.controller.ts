import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BankTransactionsService } from './bank-transactions.service';
import { WebhookDto } from './dto/webhook.dto';
import { BankTransactionMatchedType } from './schemas/bank-transaction.schema';

@ApiTags('Bank Transactions')
@Controller('bank-transactions')
export class BankTransactionsController {
  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive bank webhook (public, idempotent)' })
  processWebhook(@Body() dto: WebhookDto, @Req() req: Request) {
    const raw = req.body as Record<string, unknown>;
    return this.bankTransactionsService.processWebhook(dto, raw);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all bank transactions (Admin)' })
  @ApiQuery({
    name: 'matchedType',
    enum: BankTransactionMatchedType,
    required: false,
  })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('matchedType') matchedType?: BankTransactionMatchedType,
  ) {
    return this.bankTransactionsService.findAll(
      pagination.page,
      pagination.limit,
      matchedType,
    );
  }
}
