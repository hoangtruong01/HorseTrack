import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { JwtUser } from '../common/interfaces/jwt-user.interface';
import { RoleName } from '../users/schemas/user.schema';
import { AiService } from './ai.service';
import { CreateAiPackageDto } from './dto/create-package.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';

@ApiTags('AI Features')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ─── Packages ───────────────────────────────────────────────────────────────

  @Post('packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo gói AI prediction (Admin)' })
  createPackage(@Body() dto: CreateAiPackageDto) {
    return this.aiService.createPackage(dto);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Danh sách gói AI đang hoạt động' })
  findAllPackages() {
    return this.aiService.findAllPackages();
  }

  // ─── Subscription ────────────────────────────────────────────────────────────

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(RoleName.SPECTATOR)
  @ApiOperation({
    summary: 'Khởi tạo thanh toán PayOS để mua subscription AI (Spectator)',
    description:
      'Trả về checkoutUrl để user hoàn thành thanh toán qua PayOS. Subscription được kích hoạt sau khi PayOS gửi webhook thành công.',
  })
  subscribe(@Body() dto: SubscribePackageDto, @CurrentUser() user: JwtUser) {
    return this.aiService.initiateSubscription(dto.packageId, user.id);
  }

  @Post('payments/webhook')
  @ApiOperation({
    summary: 'Webhook nhận callback từ PayOS (public)',
    description: 'Endpoint này dành cho PayOS gọi vào khi thanh toán hoàn tất.',
  })
  payosWebhook(@Req() req: Request) {
    return this.aiService.handlePayosWebhook(req.body as unknown);
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Xem doanh thu từ subscription AI (Admin)' })
  findAllPayments() {
    return this.aiService.findAllPayments();
  }

  @Get('check-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra subscription đang hoạt động' })
  checkSubscription(@CurrentUser() user: JwtUser) {
    return this.aiService.checkSubscriptionActive(user.id);
  }

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin subscription đang hoạt động của user',
  })
  getMySubscription(@CurrentUser() user: JwtUser) {
    return this.aiService.getMySubscription(user.id);
  }

  // ─── Predictions ─────────────────────────────────────────────────────────────

  @Post('predictions/generate/:raceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Sinh gợi ý dự đoán cho một race (Admin hoặc Spectator có subscription)',
    description:
      'Spectator cần subscription đang hoạt động. Admin không cần subscription.',
  })
  @ApiParam({ name: 'raceId', description: 'ID của race' })
  generatePrediction(
    @Param('raceId') raceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.aiService.generatePrediction(raceId, user.id, user.roles);
  }

  @Get('predictions/:raceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Xem gợi ý dự đoán AI của race (Spectator cần subscription đang hoạt động)',
  })
  @ApiParam({ name: 'raceId', description: 'ID của race' })
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
}
