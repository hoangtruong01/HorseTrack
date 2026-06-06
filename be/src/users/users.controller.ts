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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RoleName, UserStatus } from './schemas/user.schema';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UsersService } from './users.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Create user (admin only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'List users with pagination, search and filter (admin only)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: RoleName,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: UserStatus,
    description: 'Filter by status',
  })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query() query: ListUsersDto,
  ) {
    const result = await this.usersService.findAll(
      query.page,
      query.limit,
      query.search,
      query.role,
      query.status,
    );
    return {
      data: result.data.map((u) =>
        plainToInstance(UserResponseDto, u.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
      meta: result.meta,
    };
  }

  @Get(':id/public')
  @ApiOperation({
    summary: 'Get public profile of a user (no authentication required)',
  })
  @ApiResponse({ status: 200, type: PublicUserResponseDto })
  async findPublicProfile(@Param('id', ParseObjectIdPipe) id: string) {
    const user = await this.usersService.findById(id);
    return plainToInstance(PublicUserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user (self or admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: JwtUser,
  ) {
    const user = await this.usersService.update(
      id,
      dto,
      currentUser.id,
      currentUser.roles,
    );
    return plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete user (admin only)' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.usersService.softDelete(id);
    return { message: 'User deleted' };
  }

  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban user account (admin only)' })
  async ban(@Param('id', ParseObjectIdPipe) id: string) {
    await this.usersService.ban(id);
    return { message: 'User banned' };
  }

  @Patch(':id/unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban user account (admin only)' })
  async unban(@Param('id', ParseObjectIdPipe) id: string) {
    await this.usersService.unban(id);
    return { message: 'User unbanned' };
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Assign role to user (admin only)' })
  @ApiResponse({ status: 201 })
  async assignRole(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AssignRoleDto,
  ) {
    await this.usersService.assignRole(id, dto.role);
    return { message: 'Role assigned' };
  }

  @Delete(':id/roles/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove role from user (admin only)' })
  async removeRole(
    @Param('id', ParseObjectIdPipe) userId: string,
    @Param('role') role: RoleName,
  ) {
    await this.usersService.removeRole(userId, role);
    return { message: 'Role removed' };
  }
}
