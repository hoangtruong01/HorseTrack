import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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

@ApiTags('Wallet & Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit money to user wallet' })
  deposit(@Body() dto: DepositDto, @CurrentUser() user: JwtUser) {
    return this.walletService.deposit(user.id, dto.amount);
  }

  @Post('cashout')
  @Roles(RoleName.SPECTATOR, RoleName.OWNER)
  @ApiOperation({
    summary: 'Request to redeem points for cash (Spectator or Owner)',
  })
  requestCashout(@Body() dto: CreateCashoutDto, @CurrentUser() user: JwtUser) {
    return this.walletService.requestCashout(dto, user.id);
  }

  @Patch('cashout/:id/process')
  @Roles(RoleName.ADMIN, RoleName.COUNTER_STAFF)
  @ApiOperation({
    summary: 'Process, Approve, Reject or Pay out cashout requests (Admin / Counter Staff)',
  })
  processCashout(
    @Param('id') id: string,
    @Body() dto: ProcessCashoutDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.walletService.processCashout(id, dto.status, user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get current user transaction history and balances' })
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
  @Roles(RoleName.SPECTATOR, RoleName.OWNER)
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

  @Get('cashout/all')
  @Roles(RoleName.ADMIN, RoleName.COUNTER_STAFF)
  @ApiOperation({
    summary: 'List all cashout requests (Admin / Counter Staff only)',
  })
  findAllCashouts(@Query() pagination: PaginationDto) {
    return this.walletService.findAllCashouts(pagination.page, pagination.limit);
  }
}
