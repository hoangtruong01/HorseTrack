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
import { RaceChecksService } from './race-checks.service';
import { CreateRaceCheckDto } from './dto/create-race-check.dto';
import { UpdateRaceCheckDto } from './dto/update-race-check.dto';

@ApiTags('Race Checks')
@Controller('race-checks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RaceChecksController {
  constructor(private readonly service: RaceChecksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Submit pre-race check for a horse (Referee)' })
  create(@Body() dto: CreateRaceCheckDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Update race check status (Referee)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRaceCheckDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.updateStatus(id, dto, user.id);
  }

  @Get('race/:raceId')
  @ApiOperation({ summary: 'List race checks for a race' })
  findByRace(@Param('raceId') raceId: string) {
    return this.service.findByRace(raceId);
  }
}
