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
import { RefereeAssignmentsService } from './referee-assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { RespondAssignmentDto } from './dto/respond-assignment.dto';

@ApiTags('Referee Assignments')
@Controller('referee-assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RefereeAssignmentsController {
  constructor(private readonly service: RefereeAssignmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Assign referee to race (Admin)' })
  create(@Body() dto: CreateAssignmentDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  @Get('available-referees')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List available referees for a race (Admin)' })
  getAvailableReferees(@Query('raceId') raceId: string) {
    return this.service.getAvailableReferees(raceId);
  }

  @Get('race/:raceId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.REFEREE)
  @ApiOperation({ summary: 'List assignments for a race (Admin/Referee)' })
  findByRace(
    @Param('raceId') raceId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findByRace(raceId, pagination.page, pagination.limit);
  }

  @Get('my-assignments')
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'List my referee assignments (Referee)' })
  findMyAssignments(
    @CurrentUser() user: JwtUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findMyAssignments(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Patch(':id/respond')
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Accept or decline assignment (Referee)' })
  respond(
    @Param('id') id: string,
    @Body() dto: RespondAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.respond(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove referee assignment (Admin)' })
  async remove(@Param('id') id: string) {
    await this.service.removeAssignment(id);
    return { message: 'Assignment removed' };
  }
}
