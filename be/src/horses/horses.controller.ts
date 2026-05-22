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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { HorsesService } from './horses.service';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';

@ApiTags('Horses')
@ApiBearerAuth()
@Controller('horses')
@UseGuards(JwtAuthGuard)
export class HorsesController {
  constructor(private readonly horsesService: HorsesService) {}

  /** Horse Owner creates a new horse */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Create a new horse (Owner / Admin)' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateHorseDto, @CurrentUser() user: JwtUser) {
    return this.horsesService.create(dto, user.id);
  }

  /** Admin: list all horses */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all horses (Admin)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.horsesService.findAll(pagination.page, pagination.limit);
  }

  /** Owner: list own horses */
  @Get('my-horses')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @ApiOperation({ summary: 'List my horses (Owner)' })
  findMyHorses(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.horsesService.findMyHorses(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  /** Get horse by id – any authenticated user */
  @Get(':id')
  @ApiOperation({ summary: 'Get horse detail' })
  findOne(@Param('id') id: string) {
    return this.horsesService.findOne(id);
  }

  /** Update horse – owner of the horse or admin */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Update horse (Owner of the horse / Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHorseDto,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    return this.horsesService.update(id, dto, user.id, isAdmin);
  }

  /** Soft-delete horse – owner of the horse or admin */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete horse (Owner / Admin)' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    await this.horsesService.softDelete(id, user.id, isAdmin);
    return { message: 'Horse deleted' };
  }
}
