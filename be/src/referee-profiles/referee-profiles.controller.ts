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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RefereeProfilesService } from './referee-profiles.service';
import { CreateRefereeProfileDto } from './dto/create-referee-profile.dto';
import { ListRefereeProfilesDto } from './dto/list-referee-profiles.dto';
import {
  RefereeApprovalStatus,
  RefereeProfileStatus,
} from './schemas/referee-profile.schema';

@ApiTags('Referee Profiles')
@Controller('referee-profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RefereeProfilesController {
  constructor(private readonly service: RefereeProfilesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Create my referee profile (Referee)' })
  create(@Body() dto: CreateRefereeProfileDto, @CurrentUser() user: JwtUser) {
    return this.service.createProfile(dto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all referee profiles (Admin)' })
  findAll(
    @Query() query: ListRefereeProfilesDto,
  ) {
    return this.service.findAll(
      query.page,
      query.limit,
      query.approvalStatus,
    );
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE)
  @ApiOperation({ summary: 'Get my referee profile (Referee)' })
  getMe(@CurrentUser() user: JwtUser) {
    return this.service.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get referee profile by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.REFEREE, RoleName.ADMIN)
  @ApiOperation({ summary: 'Update referee profile (Referee/Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: CreateRefereeProfileDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.update(
      id,
      dto,
      user.id,
      user.roles.includes(RoleName.ADMIN),
    );
  }

  @Patch(':id/approval')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Approve or Reject referee profile (Admin)' })
  changeApproval(
    @Param('id') id: string,
    @Body('approvalStatus') approvalStatus: RefereeApprovalStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.service.changeApproval(id, approvalStatus, rejectionReason);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Suspend or activate referee profile (Admin)' })
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: RefereeProfileStatus,
  ) {
    return this.service.changeStatus(id, status);
  }
}
