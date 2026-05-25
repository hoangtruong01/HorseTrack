import {
  Body,
  Controller,
  Get,
  Param,
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
import { RefereeReportsService } from './referee-reports.service';
import { CreateRefereeReportDto } from './dto/create-report.dto';

@ApiTags('Referee Reports')
@Controller('referee-reports')
export class RefereeReportsController {
  constructor(private readonly refereeReportsService: RefereeReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit referee report (Referee only)' })
  create(@Body() dto: CreateRefereeReportDto, @CurrentUser() user: JwtUser) {
    return this.refereeReportsService.create(dto, user.id);
  }

  @Get('race/:raceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reports for a race (Authenticated users)' })
  findByRace(@Param('raceId') raceId: string) {
    return this.refereeReportsService.findByRace(raceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all reports (Admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.refereeReportsService.findAll(
      pagination.page,
      pagination.limit,
    );
  }
}
