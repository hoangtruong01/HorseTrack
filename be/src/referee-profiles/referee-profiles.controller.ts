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
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination.page, pagination.limit);
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
}
