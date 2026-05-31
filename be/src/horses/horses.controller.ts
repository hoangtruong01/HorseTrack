import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { HorsesService } from './horses.service';
import { HorseGender, HorseHealthStatus } from './schemas/horse.schema';

interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
}

const imageUploadOptions = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (
      _req: unknown,
      file: MulterFile,
      cb: (err: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: MulterFile,
    cb: (err: Error | null, accept: boolean) => void,
  ) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

const CREATE_HORSE_SCHEMA = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', example: 'Thunder Bolt' },
    breed: { type: 'string', example: 'Thoroughbred' },
    age: { type: 'number', example: 5 },
    gender: { type: 'string', enum: Object.values(HorseGender) },
    color: { type: 'string', example: 'Bay' },
    weightKg: { type: 'number', example: 500 },
    heightCm: { type: 'number', example: 160 },
    dateOfBirth: { type: 'string', example: '2020-03-15' },
    healthStatus: { type: 'string', enum: Object.values(HorseHealthStatus) },
    description: { type: 'string', example: 'Fast and strong horse' },
    image: {
      type: 'string',
      format: 'binary',
      description: 'Horse image file (jpg/jpeg/png/webp/gif, max 5MB)',
    },
  },
};

const UPDATE_HORSE_SCHEMA = {
  type: 'object',
  properties: { ...CREATE_HORSE_SCHEMA.properties },
};

@ApiTags('Horses')
@ApiBearerAuth()
@Controller('horses')
@UseGuards(JwtAuthGuard)
export class HorsesController {
  constructor(private readonly horsesService: HorsesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: CREATE_HORSE_SCHEMA })
  @ApiOperation({ summary: 'Create a new horse (Owner / Admin)' })
  @ApiResponse({ status: 201 })
  create(
    @Body() dto: CreateHorseDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtUser,
  ) {
    const imageUrl = file
      ? `${process.env.HOST_URL ?? 'http://localhost:3000'}/uploads/${file.filename}`
      : undefined;
    return this.horsesService.create(dto, user.id, imageUrl);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all horses (Admin)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.horsesService.findAll(pagination.page, pagination.limit);
  }

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

  @Get(':id')
  @ApiOperation({ summary: 'Get horse detail' })
  findOne(@Param('id') id: string) {
    return this.horsesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: UPDATE_HORSE_SCHEMA })
  @ApiOperation({ summary: 'Update horse (Owner / Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHorseDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    const imageUrl = file
      ? `${process.env.HOST_URL ?? 'http://localhost:3000'}/uploads/${file.filename}`
      : undefined;
    return this.horsesService.update(id, dto, user.id, isAdmin, imageUrl);
  }

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
