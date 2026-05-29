import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../users/schemas/user.schema';
import { RaceRecordsService } from './race-records.service';
import { CreateRaceRecordDto } from './dto/create-race-record.dto';

@ApiTags('Race Records & Performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('race-records')
export class RaceRecordsController {
  constructor(private readonly recordsService: RaceRecordsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.REFEREE)
  @ApiOperation({
    summary: 'Record or update horse detailed performance metrics (Admin / Referee only)',
  })
  create(@Body() dto: CreateRaceRecordDto) {
    return this.recordsService.create(dto);
  }

  @Get('race/:raceId')
  @ApiOperation({ summary: 'Get detailed performance records for a specific race' })
  findByRace(@Param('raceId') raceId: string) {
    return this.recordsService.findByRace(raceId);
  }

  @Get('horse/:horseId')
  @ApiOperation({ summary: 'Get historical performance records for a specific horse' })
  findByHorse(@Param('horseId') horseId: string) {
    return this.recordsService.findByHorse(horseId);
  }
}
