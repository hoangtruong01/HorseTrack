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
import { RaceStatus } from './schemas/race.schema';

@ApiTags('Races')
@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create race (Admin)' })
  create(@Body() dto: CreateRaceDto) {
    return this.racesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all races (public)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.racesService.findAll(pagination.page, pagination.limit);
  }

  @Get('my-assigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List races assigned to me (Referee)' })
  findMyAssigned(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.racesService.findMyAssigned(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'List races by tournament (public)' })
  findByTournament(
    @Param('tournamentId') tournamentId: string,
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
  findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update race (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateRaceDto) {
    return this.racesService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change race status (Admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: RaceStatus) {
    return this.racesService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete race (Admin)' })
  async remove(@Param('id') id: string) {
    await this.racesService.softDelete(id);
    return { message: 'Race deleted' };
  }
}
