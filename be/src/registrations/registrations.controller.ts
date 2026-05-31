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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RejectRegistrationDto } from './dto/reject-registration.dto';

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Register horse for tournament (Owner)' })
  create(@Body() dto: CreateRegistrationDto, @CurrentUser() user: JwtUser) {
    return this.registrationsService.create(dto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all registrations (Admin)' })
  @ApiQuery({ name: 'tournamentId', required: false })
  @ApiQuery({ name: 'raceId', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('tournamentId') tournamentId?: string,
    @Query('raceId') raceId?: string,
  ) {
    return this.registrationsService.findAll(
      pagination.page,
      pagination.limit,
      tournamentId,
      raceId,
    );
  }

  @Get('my-registrations')
  @UseGuards(RolesGuard)
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
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Approve registration (Admin)' })
  approve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.registrationsService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Reject registration (Admin)' })
  reject(@Param('id') id: string, @Body() dto: RejectRegistrationDto) {
    return this.registrationsService.reject(id, dto.reason);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER)
  @ApiOperation({
    summary: 'Cancel own registration (Owner) — only PENDING/REJECTED',
  })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.registrationsService.cancel(id, user.id);
  }

  @Patch(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER)
  @ApiOperation({ summary: 'Withdraw approved registration (Owner)' })
  withdraw(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.registrationsService.withdraw(id, user.id);
  }
}
