import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RewardPointLedgerService } from './reward-point-ledger.service';

@ApiTags('Reward Point Ledger')
@Controller('reward-point-ledger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardPointLedgerController {
  constructor(private readonly ledgerService: RewardPointLedgerService) {}

  @Get('my-balance')
  @ApiOperation({ summary: 'Get my current point balance' })
  async getMyBalance(@CurrentUser() user: JwtUser) {
    const balance = await this.ledgerService.getBalance(user.id);
    return { balance };
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Get my point ledger history' })
  async getMyHistory(
    @CurrentUser() user: JwtUser,
    @Query() pagination: PaginationDto,
  ) {
    return await this.ledgerService.findByUser(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all ledger entries (Admin)' })
  async findAll(@Query() pagination: PaginationDto) {
    return await this.ledgerService.findAll(pagination.page, pagination.limit);
  }
}
