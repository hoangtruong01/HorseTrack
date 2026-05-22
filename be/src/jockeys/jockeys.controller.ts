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
import { JockeysService } from './jockeys.service';
import { CreateJockeyProfileDto } from './dto/create-jockey.dto';
import { UpdateJockeyProfileDto } from './dto/update-jockey.dto';
import { JockeyStatus } from './schemas/jockey.schema';

@ApiTags('Jockeys')
@Controller('jockeys')
export class JockeysController {
  constructor(private readonly jockeysService: JockeysService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.JOCKEY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create my Jockey profile (Jockey only)' })
  createProfile(
    @Body() dto: CreateJockeyProfileDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.jockeysService.createProfile(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all active jockeys (public)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.jockeysService.findAll(pagination.page, pagination.limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.JOCKEY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my jockey profile (Jockey only)' })
  findMe(@CurrentUser() user: JwtUser) {
    return this.jockeysService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get jockey profile by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.jockeysService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.JOCKEY, RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update jockey profile (Jockey / Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJockeyProfileDto,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    return this.jockeysService.update(id, dto, user.id, isAdmin);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change jockey profile status (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: JockeyStatus,
  ) {
    return this.jockeysService.changeStatus(id, status);
  }
}
