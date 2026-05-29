import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { AiService } from './ai.service';
import { CreateAiPackageDto } from './dto/create-package.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { CreateAiPredictionSuggestionDto } from './dto/create-prediction-suggestion.dto';
import { CreateAiArrangementSuggestionDto } from './dto/create-arrangement-suggestion.dto';

@ApiTags('AI Features')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('packages')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Create a new AI Prediction package (Admin only)' })
  createPackage(@Body() dto: CreateAiPackageDto) {
    return this.aiService.createPackage(dto);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Get list of active AI packages' })
  findAllPackages() {
    return this.aiService.findAllPackages();
  }

  @Post('subscribe')
  @Roles(RoleName.SPECTATOR)
  @ApiOperation({ summary: 'Subscribe/Purchase an AI package (Spectator only)' })
  subscribe(@Body() dto: SubscribePackageDto, @CurrentUser() user: JwtUser) {
    return this.aiService.subscribe(dto.packageId, user.id);
  }

  @Get('check-subscription')
  @ApiOperation({ summary: 'Check if current spectator has active AI subscription' })
  checkSubscription(@CurrentUser() user: JwtUser) {
    return this.aiService.checkSubscriptionActive(user.id);
  }

  @Post('predictions')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Generate/Publish AI prediction suggestion for a race (Admin only)',
  })
  createPredictionSuggestion(@Body() dto: CreateAiPredictionSuggestionDto) {
    return this.aiService.createPredictionSuggestion(dto);
  }

  @Get('predictions/:raceId')
  @ApiOperation({
    summary:
      'Get AI prediction suggestion for a race (Spectators require an active subscription)',
  })
  getPredictionSuggestion(
    @Param('raceId') raceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.aiService.getPredictionSuggestionForRace(
      raceId,
      user.id,
      user.roles,
    );
  }

  @Post('arrangements')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Generate AI race arrangements suggestion for a tournament (Admin only)',
  })
  createArrangementSuggestion(@Body() dto: CreateAiArrangementSuggestionDto) {
    return this.aiService.createArrangementSuggestion(dto);
  }

  @Get('arrangements/tournament/:tournamentId')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'List AI race arrangements suggestions for a tournament (Admin only)',
  })
  getArrangementSuggestions(@Param('tournamentId') tournamentId: string) {
    return this.aiService.getArrangementSuggestions(tournamentId);
  }

  @Patch('arrangements/:id/status')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Apply or Reject an AI arrangement suggestion (Admin only)',
  })
  updateArrangementStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'APPLIED' | 'REJECTED' },
  ) {
    return this.aiService.updateArrangementSuggestionStatus(id, dto.status);
  }
}
