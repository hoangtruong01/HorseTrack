import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { RaceResultsService } from './race-results.service';
import { CreateRaceResultDto } from './dto/create-race-result.dto';
import { UpdateRaceResultDto } from './dto/update-race-result.dto';
import { BulkRaceResultsDto } from './dto/bulk-race-results.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@ApiTags('Race Results')
@Controller('race-results')
export class RaceResultsController {
  constructor(private readonly raceResultsService: RaceResultsService) {}

  @Post('race/:raceId/simulate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE, RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simulate results for a race (Referee/Admin)' })
  simulate(
    @Param('raceId', ParseObjectIdPipe) raceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.raceResultsService.simulateRaceResults(raceId, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record race result (Referee)' })
  create(@Body() dto: CreateRaceResultDto, @CurrentUser() user: JwtUser) {
    return this.raceResultsService.create(dto, user.id);
  }

  @Get('race/:raceId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Get results by race (public, draft/confirmed visible to referee/admin)',
  })
  findByRace(
    @Param('raceId', ParseObjectIdPipe) raceId: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.raceResultsService.findByRace(raceId, user);
  }

  @Get('tournament/:tournamentId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Get results by tournament (public, draft/confirmed visible to referee/admin)',
  })
  findByTournament(
    @Param('tournamentId', ParseObjectIdPipe) tournamentId: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.raceResultsService.findByTournament(tournamentId, user);
  }

  @Patch('race/:raceId/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm results for a race (Referee)' })
  confirm(
    @Param('raceId', ParseObjectIdPipe) raceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.raceResultsService.confirmResultsForRace(raceId, user.id);
  }

  @Patch('race/:raceId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish results for a race (Admin)' })
  publish(
    @Param('raceId', ParseObjectIdPipe) raceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.raceResultsService.publishByRace(raceId, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE, RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a race result (Referee/Admin)' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRaceResultDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.raceResultsService.update(id, dto, user.id);
  }

  @Post('race/:raceId/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE, RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk record/update results for a race (Referee/Admin)',
  })
  bulkCreate(
    @Param('raceId', ParseObjectIdPipe) raceId: string,
    @Body() dto: BulkRaceResultsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.raceResultsService.bulkSave(raceId, dto, user.id);
  }
}
