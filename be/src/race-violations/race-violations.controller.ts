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
import { RaceViolationsService } from './race-violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';

@ApiTags('Race Violations')
@Controller('race-violations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RaceViolationsController {
  constructor(private readonly service: RaceViolationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Report a race violation (Referee)' })
  create(@Body() dto: CreateViolationDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  @Get('race/:raceId')
  @ApiOperation({ summary: 'Get violations for a race' })
  findByRace(@Param('raceId') raceId: string) {
    return this.service.findByRace(raceId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all violations (Admin)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination.page, pagination.limit);
  }
}
