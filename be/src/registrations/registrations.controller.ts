import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RejectRegistrationDto } from './dto/reject-registration.dto';
import { ListRegistrationsDto } from './dto/list-registrations.dto';
import { RegistrationsService } from './registrations.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@ApiTags('Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Register horse for tournament (Owner)' })
  create(@Body() dto: CreateRegistrationDto, @CurrentUser() user: JwtUser) {
    return this.registrationsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all registrations (Admin / Spectators)',
  })
  @ApiQuery({ name: 'tournamentId', required: false })
  @ApiQuery({ name: 'raceId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query() query: ListRegistrationsDto) {
    return this.registrationsService.findAll(
      query.page,
      query.limit,
      query.tournamentId,
      query.raceId,
      query.status,
    );
  }

  @Get('my-registrations')
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'List my registrations (Owner)' })
  findMine(@Query() pagination: PaginationDto, @CurrentUser() user: JwtUser) {
    return this.registrationsService.findMyRegistrations(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration detail' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Approve registration (Admin)' })
  approve(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.registrationsService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Reject registration (Admin)' })
  reject(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RejectRegistrationDto,
  ) {
    return this.registrationsService.reject(id, dto.reason);
  }

  @Patch(':id/cancel')
  @Roles(RoleName.OWNER)
  @ApiOperation({
    summary: 'Cancel own registration (Owner) — only PENDING/REJECTED',
  })
  cancel(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.registrationsService.cancel(id, user.id);
  }

  @Patch(':id/withdraw')
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Withdraw approved registration (Owner)' })
  withdraw(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.registrationsService.withdraw(id, user.id);
  }
}
