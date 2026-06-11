import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { RacesService } from './races.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { UpdateRaceStatusDto } from './dto/update-race-status.dto';
import { UpdateRaceConditionsDto } from './dto/update-race-conditions.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@ApiTags('Races')
@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create race (Admin)' })
  create(@Body() dto: CreateRaceDto, @CurrentUser() user: JwtUser) {
    return this.racesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all races (public)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.racesService.findAll(pagination.page, pagination.limit);
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'List races by tournament (public)' })
  findByTournament(
    @Param('tournamentId', ParseObjectIdPipe) tournamentId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.racesService.findByTournament(
      tournamentId,
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get race detail (public)' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.racesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update race (Admin)' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRaceDto,
  ) {
    return this.racesService.update(id, dto);
  }

  @Patch(':id/conditions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update race conditions — track & weather (Admin, Referee)',
  })
  updateConditions(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRaceConditionsDto,
  ) {
    return this.racesService.updateConditions(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change race status (Admin/Referee)' })
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRaceStatusDto,
  ) {
    return this.racesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete race (Admin)' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.racesService.softDelete(id);
    return { message: 'Race deleted' };
  }
}
