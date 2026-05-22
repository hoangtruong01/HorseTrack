import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { PrizesService } from './prizes.service';
import { UpdatePrizeStatusDto } from './dto/update-prize-status.dto';

@ApiTags('Prizes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Get()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all prizes (Admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.prizesService.findAll(pagination.page, pagination.limit);
  }

  @Get('my-prizes')
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'List my won prizes (Owner only)' })
  findMyPrizes(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.prizesService.findMyPrizes(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Update prize payment status (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePrizeStatusDto,
  ) {
    return this.prizesService.updateStatus(id, dto.status);
  }
}
