import {
  Body,
  Controller,
  Get,
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
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';

@ApiTags('Bets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @Roles(RoleName.SPECTATOR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Place a bet on a horse in a race (Spectator / Admin)' })
  create(@Body() dto: CreateBetDto, @CurrentUser() user: JwtUser) {
    return this.betsService.create(dto, user.id);
  }

  @Get('my-bets')
  @Roles(RoleName.SPECTATOR, RoleName.ADMIN)
  @ApiOperation({ summary: 'List my placed bets (Spectator / Admin)' })
  findMyBets(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.betsService.findMyBets(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all placed bets (Admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.betsService.findAll(pagination.page, pagination.limit);
  }
}
