# Payment & Points Domain — Implementation Plan (Plan 1/5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dọn mô hình tiền/điểm về đúng nghiệp vụ — bỏ ví tiền mặt, chỉ giữ điểm thưởng (ledger) + subscription (PayOS); làm rõ vòng đời cashout; webhook PayOS fail-loud.

**Architecture:** Hệ thống chỉ còn 2 dòng giá trị: (1) **điểm thưởng** `User.points` qua `reward-point-ledger` là nguồn sự thật duy nhất; (2) **PayOS → user-subscription** cho AI predictions. "Cashout" là quy đổi điểm thủ công tại quầy (role COUNTER_STAFF) bằng mã RWD. Mọi tàn dư của mô hình "ví tiền mặt" (`User.balance`, deposit, `bank-transactions`) bị xoá.

**Tech Stack:** NestJS 11, Mongoose 9, Jest 30 + ts-jest. Test theo pattern `src/wallet/wallet.service.spec.ts` (mock model qua `getModelToken`).

**Cơ sở:** Báo cáo audit `be/docs/audit-2026-06-14-service-integration.md` mục 0 (quyết định brainstorm) + Flow 4 & 5.

**Lệnh verify chuẩn cho mọi task:**
- Build: `npm run build` (từ `be/`) — kỳ vọng exit 0, không lỗi TS.
- Test: `npm test` — kỳ vọng tất cả spec PASS.
- Lint: `npm run lint`.

---

## File Structure

**Xoá hẳn:**
- `be/src/bank-transactions/` (toàn bộ thư mục: controller, service, module, schema, 2 dto).

**Sửa:**
- `be/src/app.module.ts` — bỏ import/registration `BankTransactionsModule`.
- `be/src/wallet/wallet.controller.ts` — bỏ endpoint `deposit/for-user`.
- `be/src/wallet/wallet.service.ts` — bỏ `deposit()`, bỏ tham chiếu `balance`, tách `rejectedBy`.
- `be/src/wallet/dto/deposit.dto.ts` — xoá.
- `be/src/wallet/schemas/wallet-transaction.schema.ts` — gọn `TransactionType` còn `REWARD_CASHOUT`.
- `be/src/wallet/schemas/cashout-request.schema.ts` — thêm `rejectedBy`.
- `be/src/wallet/wallet.module.ts` — bỏ inject `User` model nếu không còn dùng (kiểm tra).
- `be/src/users/schemas/user.schema.ts` — xoá field `balance`.
- `be/src/ai/schemas/user-subscription.schema.ts` — gọn `SubscriptionStatus` còn `ACTIVE`.
- `be/src/ai/services/payos.service.ts` — webhook fail-loud.

**Test:**
- `be/src/wallet/wallet.service.spec.ts` — cập nhật theo thay đổi cashout.
- `be/src/ai/services/payos.service.spec.ts` — tạo mới cho webhook fail-loud.

---

## Task 1: Xoá module `bank-transactions`

Module này hiện thực mô hình đối soát ngân hàng không tồn tại trong nghiệp vụ (`matchedType` luôn `UNKNOWN`, không nối vào số dư). Bỏ hẳn.

**Files:**
- Delete: toàn bộ `be/src/bank-transactions/`
- Modify: `be/src/app.module.ts`

- [ ] **Step 1: Xác nhận không có tham chiếu ngoài module**

Run: `grep -rn "BankTransaction\|bank-transactions" be/src --include=*.ts | grep -v "be/src/bank-transactions/"`
Expected: chỉ còn các dòng trong `be/src/app.module.ts` (import + mảng `imports`). Nếu có nơi khác → dừng, báo lại.

- [ ] **Step 2: Bỏ đăng ký trong app.module**

Trong `be/src/app.module.ts`: xoá dòng `import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';` và phần tử `BankTransactionsModule` trong mảng `imports`.

- [ ] **Step 3: Xoá thư mục module**

```bash
rm -rf be/src/bank-transactions
```

- [ ] **Step 4: Build + test**

Run: `cd be && npm run build && npm test`
Expected: build exit 0; spec hiện có PASS (bank-transactions không có spec).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(wallet): remove unused bank-transactions module"
```

---

## Task 2: Xoá đường nạp tiền mặt (`deposit`)

`User.balance` không phải tính năng. Endpoint admin `deposit/for-user` và `WalletService.deposit` là tàn dư.

**Files:**
- Modify: `be/src/wallet/wallet.controller.ts:33-47`
- Modify: `be/src/wallet/wallet.service.ts:35-54`
- Delete: `be/src/wallet/dto/deposit.dto.ts`

- [ ] **Step 1: Bỏ endpoint deposit trong controller**

Trong `be/src/wallet/wallet.controller.ts` xoá toàn bộ method `depositForUser` (block `@Post('deposit/for-user/:userId')` … `}` ~ dòng 33-47) và import `DepositDto` (dòng 21). Bỏ `BadRequestException` khỏi import nếu sau khi xoá không còn dùng (kiểm tra: còn dùng ở `lookupCashout` guard dòng 137 → **giữ** `BadRequestException`).

- [ ] **Step 2: Bỏ method deposit trong service**

Trong `be/src/wallet/wallet.service.ts` xoá method `deposit()` (dòng 35-54). Xoá import `TransactionType` nếu không còn dùng chỗ khác (sẽ xử lý ở Task 4 — tạm để, build sẽ báo nếu thừa).

- [ ] **Step 3: Xoá DTO**

```bash
rm be/src/wallet/dto/deposit.dto.ts
```

- [ ] **Step 4: Verify không còn tham chiếu deposit**

Run: `grep -rn "deposit\|DepositDto" be/src/wallet`
Expected: không còn (trừ comment không liên quan).

- [ ] **Step 5: Build**

Run: `cd be && npm run build`
Expected: exit 0. (Nếu báo `TransactionType.DEPOSIT` không dùng → đúng kỳ vọng, sẽ dọn ở Task 4; nếu lỗi TS khác → dừng.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(wallet): remove cash deposit endpoint and method"
```

---

## Task 3: Xoá field `User.balance`

`balance` chỉ còn được đọc tại `findMyWalletHistory` sau khi Task 2 bỏ chỗ ghi. Bỏ field, bỏ trả `balance` trong history (chỉ còn `points`).

**Files:**
- Modify: `be/src/users/schemas/user.schema.ts:54-55`
- Modify: `be/src/wallet/wallet.service.ts:186-192`

- [ ] **Step 1: Xoá field balance khỏi schema**

Trong `be/src/users/schemas/user.schema.ts` xoá:
```typescript
  @Prop({ default: 0 })
  balance!: number;
```

- [ ] **Step 2: Bỏ balance khỏi findMyWalletHistory**

Trong `be/src/wallet/wallet.service.ts` thay block dòng 186-194:
```typescript
    const user = await this.userModel.findById(userId, 'balance');
    const pointBalance = await this.ledgerService.getBalance(userId);

    return {
      balance: user?.balance ?? 0,
      points: pointBalance,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
```
bằng:
```typescript
    const pointBalance = await this.ledgerService.getBalance(userId);

    return {
      points: pointBalance,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
```

- [ ] **Step 3: Kiểm tra `userModel` còn được dùng trong WalletService không**

Run: `grep -n "userModel" be/src/wallet/wallet.service.ts`
Nếu không còn dòng nào: xoá field inject `@InjectModel(User.name) private userModel...` (constructor) + import `User`/`UserDocument`, và bỏ `MongooseModule.forFeature` entry `User` trong `be/src/wallet/wallet.module.ts`. Nếu còn dùng → giữ nguyên.

- [ ] **Step 4: Verify không còn tham chiếu balance**

Run: `grep -rn "\.balance\|balance:" be/src`
Expected: không còn dòng nào liên quan tới ví (dòng `balanceAfter` trong reward-point-ledger là khác, được phép tồn tại).

- [ ] **Step 5: Build + test**

Run: `cd be && npm run build && npm test`
Expected: exit 0; spec PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(wallet): drop unused User.balance and cash balance reporting"
```

---

## Task 4: Gọn `TransactionType` về `REWARD_CASHOUT`

Sau Task 2, các type tiền mặt (DEPOSIT/WITHDRAW/PURCHASE/POINT_REDEMPTION/PRIZE_EARNING) không còn được gán ở đâu. Chỉ `REWARD_CASHOUT` được dùng (`wallet.service.ts:101`).

**Files:**
- Modify: `be/src/wallet/schemas/wallet-transaction.schema.ts:6-13`

- [ ] **Step 1: Xác nhận chỉ REWARD_CASHOUT được dùng**

Run: `grep -rn "TransactionType\." be/src`
Expected: chỉ còn `TransactionType.REWARD_CASHOUT` (tại `wallet.service.ts`). Nếu còn type khác → dừng, kiểm tra.

- [ ] **Step 2: Rút gọn enum**

Trong `be/src/wallet/schemas/wallet-transaction.schema.ts` thay enum:
```typescript
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  PURCHASE = 'PURCHASE',
  POINT_REDEMPTION = 'POINT_REDEMPTION',
  PRIZE_EARNING = 'PRIZE_EARNING',
  REWARD_CASHOUT = 'REWARD_CASHOUT',
}
```
bằng:
```typescript
export enum TransactionType {
  REWARD_CASHOUT = 'REWARD_CASHOUT',
}
```

- [ ] **Step 3: Build**

Run: `cd be && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(wallet): prune TransactionType to REWARD_CASHOUT"
```

---

## Task 5: Gọn `SubscriptionStatus` về `ACTIVE`

`EXPIRED`/`CANCELLED` không bao giờ được gán (đã grep: 0 tham chiếu). Hết hạn được chặn bằng filter `endDate > now`. Bỏ hai giá trị thừa để tránh hiểu nhầm có lifecycle.

**Files:**
- Modify: `be/src/ai/schemas/user-subscription.schema.ts:6`

- [ ] **Step 1: Xác nhận 0 tham chiếu EXPIRED/CANCELLED**

Run: `grep -rn "SubscriptionStatus\.\(EXPIRED\|CANCELLED\)" be/src`
Expected: không có kết quả.

- [ ] **Step 2: Rút gọn enum**

Trong `be/src/ai/schemas/user-subscription.schema.ts` sửa enum `SubscriptionStatus` chỉ còn:
```typescript
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
}
```
(Giữ default `ACTIVE` của field `status`.)

- [ ] **Step 3: Build**

Run: `cd be && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(ai): prune SubscriptionStatus to ACTIVE (expiry via endDate filter)"
```

---

## Task 6: PayOS webhook fail-loud

Khi PayOS chưa cấu hình hoặc verify thất bại, `handleWebhook` đang return im lặng (`payos.service.ts:100,109`) → payment kẹt PENDING, không ai biết. Đổi sang **log.error** (loud) để ops phát hiện. Không throw (giữ ack 200 cho PayOS, tránh retry vô ích khi lỗi cấu hình).

**Files:**
- Modify: `be/src/ai/services/payos.service.ts:99-110`
- Test: `be/src/ai/services/payos.service.spec.ts` (tạo mới)

- [ ] **Step 1: Viết test thất bại**

Tạo `be/src/ai/services/payos.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Payment } from '../schemas/payment.schema';
import { UserSubscription } from '../schemas/user-subscription.schema';
import { AIPredictionPackage } from '../schemas/ai-prediction-package.schema';
import { PayosService } from './payos.service';

describe('PayosService.handleWebhook (unconfigured)', () => {
  let service: PayosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayosService,
        // ConfigService trả undefined cho mọi key → payos = null
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: getModelToken(Payment.name), useValue: {} },
        { provide: getModelToken(UserSubscription.name), useValue: {} },
        { provide: getModelToken(AIPredictionPackage.name), useValue: {} },
      ],
    }).compile();

    service = module.get(PayosService);
  });

  it('logs an error instead of silently ignoring when PayOS is not configured', async () => {
    const errorSpy = jest
      .spyOn((service as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);

    await service.handleWebhook({ orderCode: 123 });

    expect(errorSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test cho thất bại**

Run: `cd be && npx jest src/ai/services/payos.service.spec.ts`
Expected: FAIL — `errorSpy` không được gọi (code hiện return im lặng).

- [ ] **Step 3: Sửa handleWebhook fail-loud**

Trong `be/src/ai/services/payos.service.ts`, thay dòng 100:
```typescript
    if (!this.payos) return;
```
bằng:
```typescript
    if (!this.payos) {
      this.logger.error(
        'PayOS webhook nhận được nhưng PAYOS credentials chưa cấu hình — payment sẽ kẹt PENDING. Kiểm tra biến môi trường PAYOS_*.',
      );
      return;
    }
```
Và thay dòng 108 (verify fail) từ `this.logger.warn(...)` thành `this.logger.error(...)`:
```typescript
      this.logger.error(`PayOS webhook verification failed: ${String(err)}`);
```

- [ ] **Step 4: Chạy test cho pass**

Run: `cd be && npx jest src/ai/services/payos.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Build + full test**

Run: `cd be && npm run build && npm test`
Expected: exit 0; tất cả PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(ai): PayOS webhook logs error loudly when unconfigured or verify fails"
```

---

## Task 7: Cashout — tách `rejectedBy` khỏi `approvedBy`

Quyết định brainstorm: giữ 4 trạng thái linh hoạt (PENDING→PAID hoặc PENDING→APPROVED→PAID), guard chặn đổi khi đã PAID/REJECTED (đã có). Cleanup duy nhất: hiện REJECTED ghi đè vào `approvedBy` (`wallet.service.ts:164`) gây nhầm. Thêm field `rejectedBy` riêng.

**Files:**
- Modify: `be/src/wallet/schemas/cashout-request.schema.ts`
- Modify: `be/src/wallet/wallet.service.ts:163-168`
- Test: `be/src/wallet/wallet.service.spec.ts`

- [ ] **Step 1: Thêm field rejectedBy vào schema**

Trong `be/src/wallet/schemas/cashout-request.schema.ts`, sau field `paidBy` thêm:
```typescript
  @Prop({ type: Types.ObjectId, ref: 'User' })
  rejectedBy?: Types.ObjectId;
```

- [ ] **Step 2: Cập nhật test REJECTED khẳng định rejectedBy (thất bại trước)**

Trong `be/src/wallet/wallet.service.spec.ts`:
- Thêm `rejectedBy?: Types.ObjectId;` vào interface `MockCashoutRequest` (sau `paidBy`).
- Trong test `'refunds points and updates ledger note when cashout is rejected'`, thêm trước dòng cuối:
```typescript
    expect(request.rejectedBy).toEqual(new Types.ObjectId(handlerId));
    expect(request.approvedBy).toBeUndefined();
```

- [ ] **Step 3: Chạy test cho thất bại**

Run: `cd be && npx jest src/wallet/wallet.service.spec.ts -t "rejected"`
Expected: FAIL — `rejectedBy` undefined (code đang set `approvedBy`).

- [ ] **Step 4: Sửa nhánh REJECTED trong service**

Trong `be/src/wallet/wallet.service.ts` nhánh `else if (status === CashoutStatus.REJECTED)` (dòng 163-168), đổi:
```typescript
      request.approvedBy = new Types.ObjectId(handlerId);
```
thành:
```typescript
      request.rejectedBy = new Types.ObjectId(handlerId);
```
(Giữ nguyên phần `transactionModel.findOneAndUpdate(... FAILED)`.)

- [ ] **Step 5: Cập nhật populate cho findAllCashouts/lookupCashout**

Trong `be/src/wallet/wallet.service.ts`, tại `findAllCashouts` (sau `.populate('paidBy', 'fullName')` dòng ~220) và `lookupCashout` (sau `.populate('paidBy', 'fullName')` dòng ~238) thêm:
```typescript
      .populate('rejectedBy', 'fullName')
```

- [ ] **Step 6: Chạy test cho pass + full**

Run: `cd be && npx jest src/wallet/wallet.service.spec.ts`
Expected: PASS (tất cả 5+ test).

- [ ] **Step 7: Build + lint + full test**

Run: `cd be && npm run build && npm run lint && npm test`
Expected: exit 0; tất cả PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(wallet): track rejectedBy separately from approvedBy on cashout"
```

---

## Self-Review (đã thực hiện)

- **Spec coverage:** Mục 0 của audit có 5 quyết định → Task 1-3 (bỏ ví tiền mặt), Task 4 (enum tiền mặt), Task 5 (subscription enum), Task 6 (webhook fail-loud), Task 7 (cashout rejectedBy). Quyết định "giữ 4 trạng thái linh hoạt + guard đã có" → không cần task riêng (guard `wallet.service.ts:120-125` đã chặn đổi khi PAID/REJECTED; tính linh hoạt PENDING→PAID được giữ nguyên có chủ đích). "Mã không tự hết hạn" → không cần code (counter REJECTED thủ công, đã hỗ trợ).
- **Placeholder scan:** không có TBD/TODO; mọi step có code/lệnh cụ thể.
- **Type consistency:** `rejectedBy: Types.ObjectId` nhất quán giữa schema (Task 7.1), interface test (7.2) và service (7.4). `TransactionType.REWARD_CASHOUT` giữ nguyên xuyên suốt.

---

## Không thuộc Plan này (các plan kế tiếp)

- **Plan 2 — Transaction integrity:** `ledger.credit/debit` nhận `session`; bọc transaction `publishByRace`, cashout, cascadeCancel; thống nhất nguồn sự thật điểm (`User.points` vs `balanceAfter`).
- **Plan 3 — AI arrangement:** `applyArrangement` tạo Registration từ `proposedRaces[].entries`.
- **Plan 4 — Race-results & state-machine:** `RaceResult.points`, `cascadeCancel` bypass + xung đột guard registration, `RaceCheck` guard.
- **Plan 5 — Service boundary + cleanup:** foreign `@InjectModel` ghi → gọi service chủ, tách module `payments` khỏi `ai`, dedup refund/POINTS_MAP, dọn enum chết còn lại, string-literal → enum.
