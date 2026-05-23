import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard Statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics for Admin' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('owner')
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Get dashboard statistics for Horse Owner' })
  getOwnerStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getOwnerStats(user.id);
  }

  @Get('jockey')
  @Roles(RoleName.JOCKEY)
  @ApiOperation({ summary: 'Get dashboard statistics for Jockey' })
  getJockeyStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getJockeyStats(user.id);
  }

  @Get('referee')
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Get dashboard statistics for Referee' })
  getRefereeStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getRefereeStats(user.id);
  }

  @Get('spectator')
  @Roles(RoleName.SPECTATOR)
  @ApiOperation({ summary: 'Get dashboard statistics for Spectator' })
  getSpectatorStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getSpectatorStats(user.id);
  }
}
