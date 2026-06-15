import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { CreateCashoutDto } from './dto/create-cashout.dto';
import { ProcessCashoutDto } from './dto/process-cashout.dto';
import { ListCashoutsDto } from './dto/list-cashouts.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@ApiTags('Wallet & Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit/for-user/:userId')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin deposits money to a specific user wallet' })
  depositForUser(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() dto: DepositDto,
    @CurrentUser() adminUser: JwtUser,
  ) {
    if (userId === adminUser.id) {
      throw new BadRequestException(
        'Admins cannot deposit money into their own wallets',
      );
    }
    return this.walletService.deposit(userId, dto.amount);
  }

  @Post('cashout')
  @Roles(RoleName.SPECTATOR, RoleName.OWNER, RoleName.JOCKEY, RoleName.REFEREE)
  @ApiOperation({
    summary:
      'Request to redeem points for cash (Spectator, Owner, Jockey, or Referee)',
  })
  requestCashout(@Body() dto: CreateCashoutDto, @CurrentUser() user: JwtUser) {
    return this.walletService.requestCashout(dto, user.id);
  }

  @Patch('cashout/:id/process')
  @Roles(RoleName.ADMIN, RoleName.COUNTER_STAFF)
  @ApiOperation({
    summary:
      'Process, Approve, Reject or Pay out cashout requests (Admin / Counter Staff)',
  })
  processCashout(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ProcessCashoutDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.walletService.processCashout(id, dto.status, user.id, dto.rejectReason);
  }

  @Get('all-transactions')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'List all wallet transactions for all users (Admin only)',
  })
  findAllTransactions(@Query() pagination: PaginationDto) {
    return this.walletService.findAllTransactions(
      pagination.page,
      pagination.limit,
    );
  }

  @Get('user/:userId/history')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Get wallet history for a specific user (Admin only)',
  })
  findUserHistory(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.walletService.findMyWalletHistory(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get current user transaction history and balances',
  })
  findMyHistory(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.walletService.findMyWalletHistory(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('cashout/my-requests')
  @Roles(RoleName.SPECTATOR, RoleName.OWNER, RoleName.JOCKEY, RoleName.REFEREE)
  @ApiOperation({ summary: 'Get current user cashout/redemption request list' })
  findMyCashouts(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.walletService.findMyCashoutRequests(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('cashout/lookup')
  @Roles(RoleName.ADMIN, RoleName.COUNTER_STAFF)
  @ApiOperation({
    summary:
      'Lookup a specific cashout request by code (Admin / Counter Staff only)',
  })
  lookupCashout(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Redemption code is required');
    }
    return this.walletService.lookupCashout(code);
  }

  @Get('cashout/all')
  @Roles(RoleName.ADMIN, RoleName.COUNTER_STAFF)
  @ApiOperation({
    summary: 'List all cashout requests (Admin / Counter Staff only)',
  })
  findAllCashouts(@Query() query: ListCashoutsDto) {
    return this.walletService.findAllCashouts(
      query.page,
      query.limit,
      query.status,
    );
  }
}
