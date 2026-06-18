# E#1: Dead Code Cleanup — AI Arrangement Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xóa hoàn toàn tính năng AI arrangement (đã bị hủy) khỏi `be/src/ai/` mà không ảnh hưởng tới prediction, subscription, và payment code.

**Architecture:** Xóa 5 file dead code, rồi cắt tất cả reference trong 3 file còn lại (`ai.module.ts`, `ai.service.ts`, `ai.controller.ts`). Không viết test vì đây là pure deletion — chỉ cần build + lint + test xanh sau khi xong.

**Tech Stack:** NestJS / TypeScript / Mongoose

---

## File Structure

| Hành động | File |
|-----------|------|
| DELETE | `be/src/ai/services/arrangement-engine.service.ts` |
| DELETE | `be/src/ai/schemas/ai-race-arrangement-suggestion.schema.ts` |
| DELETE | `be/src/ai/dto/create-arrangement-suggestion.dto.ts` |
| DELETE | `be/src/ai/dto/update-arrangement-status.dto.ts` |
| DELETE | `be/src/ai/dto/create-prediction-suggestion.dto.ts` |
| MODIFY | `be/src/ai/ai.module.ts` |
| MODIFY | `be/src/ai/ai.service.ts` |
| MODIFY | `be/src/ai/ai.controller.ts` |

---

## Task 1: Sửa ai.module.ts — xóa arrangement

**Files:**
- Modify: `be/src/ai/ai.module.ts`

- [ ] **Step 1: Thay toàn bộ nội dung ai.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  Tournament,
  TournamentSchema,
} from '../tournaments/schemas/tournament.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import {
  RaceRecord,
  RaceRecordSchema,
} from '../race-records/schemas/race-record.schema';
import { Jockey, JockeySchema } from '../jockeys/schemas/jockey.schema';
import {
  AIPredictionPackage,
  AIPredictionPackageSchema,
} from './schemas/ai-prediction-package.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import {
  UserSubscription,
  UserSubscriptionSchema,
} from './schemas/user-subscription.schema';
import {
  AIPredictionSuggestion,
  AIPredictionSuggestionSchema,
} from './schemas/ai-prediction-suggestion.schema';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmService } from './services/llm.service';
import { StrengthScoreService } from './services/strength-score.service';
import { PredictionEngineService } from './services/prediction-engine.service';
import { PayosService } from './services/payos.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Tournament.name, schema: TournamentSchema },
      { name: Horse.name, schema: HorseSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: RaceRecord.name, schema: RaceRecordSchema },
      { name: Jockey.name, schema: JockeySchema },
      { name: AIPredictionPackage.name, schema: AIPredictionPackageSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
      {
        name: AIPredictionSuggestion.name,
        schema: AIPredictionSuggestionSchema,
      },
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    LlmService,
    StrengthScoreService,
    PredictionEngineService,
    PayosService,
  ],
  exports: [AiService],
})
export class AiModule {}
```

---

## Task 2: Sửa ai.service.ts — xóa arrangement methods

**Files:**
- Modify: `be/src/ai/ai.service.ts`

- [ ] **Step 1: Thay toàn bộ nội dung ai.service.ts**

```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleName } from '../users/schemas/user.schema';
import {
  AIPredictionPackage,
  type AIPredictionPackageDocument,
  PackageStatus,
} from './schemas/ai-prediction-package.schema';
import {
  UserSubscription,
  type UserSubscriptionDocument,
  SubscriptionStatus,
} from './schemas/user-subscription.schema';
import { Payment, type PaymentDocument } from './schemas/payment.schema';
import {
  AIPredictionSuggestion,
  type AIPredictionSuggestionDocument,
} from './schemas/ai-prediction-suggestion.schema';
import { CreateAiPackageDto } from './dto/create-package.dto';
import { PredictionEngineService } from './services/prediction-engine.service';
import { PayosService } from './services/payos.service';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(AIPredictionPackage.name)
    private packageModel: Model<AIPredictionPackageDocument>,
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscriptionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(AIPredictionSuggestion.name)
    private predictionModel: Model<AIPredictionSuggestionDocument>,
    private readonly predictionEngine: PredictionEngineService,
    private readonly payosService: PayosService,
  ) {}

  // ─── Packages ────────────────────────────────────────────────────────────────

  async createPackage(
    dto: CreateAiPackageDto,
  ): Promise<AIPredictionPackageDocument> {
    return this.packageModel.create(dto);
  }

  async findAllPackages(): Promise<AIPredictionPackageDocument[]> {
    return this.packageModel.find({ status: PackageStatus.ACTIVE }).exec();
  }

  // ─── Subscription via PayOS ───────────────────────────────────────────────

  async initiateSubscription(
    packageId: string,
    userId: string,
  ): Promise<{ checkoutUrl: string; orderCode: number }> {
    return this.payosService.createPaymentLink(packageId, userId);
  }

  async handlePayosWebhook(body: unknown): Promise<void> {
    return this.payosService.handleWebhook(body);
  }

  async checkSubscriptionActive(userId: string): Promise<boolean> {
    const now = new Date();
    const sub = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
      endDate: { $gt: now },
    });
    return !!sub;
  }

  async getMySubscription(
    userId: string,
  ): Promise<UserSubscriptionDocument | null> {
    const now = new Date();
    return this.subscriptionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gt: now },
      })
      .populate('packageId', 'name description price durationDays accuracyRate')
      .exec();
  }

  // ─── Payments (admin revenue) ─────────────────────────────────────────────

  async findAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find()
      .populate('userId', 'fullName email')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ─── Predictions ─────────────────────────────────────────────────────────

  async generatePrediction(
    raceId: string,
    userId: string,
    userRoles: string[],
  ): Promise<AIPredictionSuggestionDocument> {
    if (!userRoles.includes(RoleName.ADMIN)) {
      const isSubscribed = await this.checkSubscriptionActive(userId);
      if (!isSubscribed) {
        throw new ForbiddenException(
          'Cần có subscription đang hoạt động để sử dụng tính năng AI. Vui lòng mua gói subscription.',
        );
      }
    }
    return this.predictionEngine.generateForRace(raceId);
  }

  async getPredictionSuggestionForRace(
    raceId: string,
    userId: string,
    userRoles: string[],
  ): Promise<AIPredictionSuggestionDocument> {
    if (!userRoles.includes(RoleName.ADMIN)) {
      const isSubscribed = await this.checkSubscriptionActive(userId);
      if (!isSubscribed) {
        throw new ForbiddenException(
          'Cần có subscription đang hoạt động để xem gợi ý AI. Vui lòng mua gói subscription.',
        );
      }
    }

    const suggestion = await this.predictionModel
      .findOne({ raceId: new Types.ObjectId(raceId) })
      .populate('rankings.horseId', 'name breed')
      .exec();

    if (!suggestion) {
      throw new NotFoundException('Chưa có gợi ý AI cho race này');
    }
    return suggestion;
  }
}
```

---

## Task 3: Sửa ai.controller.ts — xóa 3 arrangement endpoints

**Files:**
- Modify: `be/src/ai/ai.controller.ts`

- [ ] **Step 1: Thay toàn bộ nội dung ai.controller.ts**

```typescript
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
```

---

## Task 4: Xóa 5 file dead code

**Files:**
- Delete: `be/src/ai/services/arrangement-engine.service.ts`
- Delete: `be/src/ai/schemas/ai-race-arrangement-suggestion.schema.ts`
- Delete: `be/src/ai/dto/create-arrangement-suggestion.dto.ts`
- Delete: `be/src/ai/dto/update-arrangement-status.dto.ts`
- Delete: `be/src/ai/dto/create-prediction-suggestion.dto.ts`

- [ ] **Step 1: Xóa 5 file**

Chạy từ thư mục `be/`:

```bash
rm src/ai/services/arrangement-engine.service.ts
rm src/ai/schemas/ai-race-arrangement-suggestion.schema.ts
rm src/ai/dto/create-arrangement-suggestion.dto.ts
rm src/ai/dto/update-arrangement-status.dto.ts
rm src/ai/dto/create-prediction-suggestion.dto.ts
```

---

## Task 5: Verify và commit

**Files:** (không có thay đổi)

- [ ] **Step 1: Chạy build**

```bash
cd be && npm run build
```

Expected: `Found 0 errors. Watching for file changes.` (hoặc build exit 0 không có lỗi TS).

- [ ] **Step 2: Chạy lint**

```bash
cd be && npm run lint
```

Expected: không có warning hay error nào liên quan đến `arrangement`.

- [ ] **Step 3: Chạy test**

```bash
cd be && npm test -- --passWithNoTests
```

Expected: tất cả test suites pass, không có test nào fail.

- [ ] **Step 4: Xác nhận không còn reference nào đến arrangement trong source**

```bash
cd be && git grep -r "arrangement" -- src/
```

Expected: không có output (hoặc chỉ có trong comments không ảnh hưởng build).

- [ ] **Step 5: Commit**

```bash
git add be/src/ai/ai.module.ts \
        be/src/ai/ai.service.ts \
        be/src/ai/ai.controller.ts
git rm be/src/ai/services/arrangement-engine.service.ts \
       be/src/ai/schemas/ai-race-arrangement-suggestion.schema.ts \
       be/src/ai/dto/create-arrangement-suggestion.dto.ts \
       be/src/ai/dto/update-arrangement-status.dto.ts \
       be/src/ai/dto/create-prediction-suggestion.dto.ts
git commit -m "refactor(ai): remove dead arrangement feature code (E#1)"
```
