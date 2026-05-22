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

@ApiTags('Race Results')
@Controller('race-results')
export class RaceResultsController {
  constructor(private readonly raceResultsService: RaceResultsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record race result (Referee)' })
  create(@Body() dto: CreateRaceResultDto, @CurrentUser() user: JwtUser) {
    return this.raceResultsService.create(dto, user.id);
  }

  @Get('race/:raceId')
  @ApiOperation({ summary: 'Get results by race (public)' })
  findByRace(@Param('raceId') raceId: string) {
    return this.raceResultsService.findByRace(raceId);
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'Get results by tournament (public)' })
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.raceResultsService.findByTournament(tournamentId);
  }

  @Patch('race/:raceId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish results for a race (Admin)' })
  publish(@Param('raceId') raceId: string, @CurrentUser() user: JwtUser) {
    return this.raceResultsService.publishByRace(raceId, user.id);
  }
}
