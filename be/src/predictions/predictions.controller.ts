import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@ApiTags('Predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @Roles(RoleName.SPECTATOR, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Place a prediction on a horse in a race (Spectator / Admin)',
  })
  create(@Body() dto: CreatePredictionDto, @CurrentUser() user: JwtUser) {
    return this.predictionsService.create(dto, user.id);
  }

  @Get('my-predictions')
  @Roles(RoleName.SPECTATOR, RoleName.ADMIN)
  @ApiOperation({ summary: 'List my predictions (Spectator / Admin)' })
  findMyPredictions(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.predictionsService.findMyPredictions(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'List all predictions (Admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.predictionsService.findAll(pagination.page, pagination.limit);
  }
}
