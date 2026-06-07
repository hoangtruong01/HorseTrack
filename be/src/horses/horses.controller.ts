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
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { HorseGender, HorseHealthStatus } from './schemas/horse.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { HorsesService } from './horses.service';
import { CreateHorseDto } from './dto/create-horse.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { ListHorsesDto } from './dto/list-horses.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const imageUploadOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  storage: memoryStorage(),
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
      description: 'Horse image (jpg/jpeg/png/webp/gif, max 5MB)',
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
  constructor(
    private readonly horsesService: HorsesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: CREATE_HORSE_SCHEMA })
  @ApiOperation({ summary: 'Create a new horse (Owner / Admin)' })
  @ApiResponse({ status: 201 })
  async create(
    @Body() dto: CreateHorseDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtUser,
  ) {
    const imageUrl = file
      ? (await this.cloudinaryService.uploadFile(file.buffer)).secure_url
      : undefined;
    return this.horsesService.create(dto, user.id, imageUrl);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SPECTATOR)
  @ApiOperation({ summary: 'List all horses (Admin & Spectators)' })
  findAll(@Query() query: ListHorsesDto) {
    return this.horsesService.findAll(query.page, query.limit, query.search);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a horse' })
  async approve(@Param('id', ParseObjectIdPipe) id: string) {
    return this.horsesService.approveHorse(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Admin: Reject a horse' })
  async reject(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.horsesService.rejectHorse(id, reason);
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
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.horsesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: UPDATE_HORSE_SCHEMA })
  @ApiOperation({ summary: 'Update horse (Owner / Admin)' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateHorseDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    const imageUrl = file
      ? (await this.cloudinaryService.uploadFile(file.buffer)).secure_url
      : undefined;
    return this.horsesService.update(id, dto, user.id, isAdmin, imageUrl);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete horse (Owner / Admin)' })
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    await this.horsesService.softDelete(id, user.id, isAdmin);
    return { message: 'Horse deleted' };
  }
}
