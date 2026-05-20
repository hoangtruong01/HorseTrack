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
import { RoleName } from './schemas/user.schema';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

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
  @ApiOperation({ summary: 'List users with pagination (admin only)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(@Query() pagination: PaginationDto) {
    const users = await this.usersService.findAll(
      pagination.page,
      pagination.limit,
    );
    return users.map((u) =>
      plainToInstance(UserResponseDto, u.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string) {
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
    @Param('id') id: string,
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
  async remove(@Param('id') id: string) {
    await this.usersService.softDelete(id);
    return { message: 'User deleted' };
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Assign role to user (admin only)' })
  @ApiResponse({ status: 201 })
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    await this.usersService.assignRole(id, dto.role);
    return { message: 'Role assigned' };
  }

  @Delete(':id/roles/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove role from user (admin only)' })
  async removeRole(@Param('id') userId: string, @Param('role') role: RoleName) {
    await this.usersService.removeRole(userId, role);
    return { message: 'Role removed' };
  }
}
