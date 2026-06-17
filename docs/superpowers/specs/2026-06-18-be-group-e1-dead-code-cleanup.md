# Spec — Nhóm E#1: Dead code cleanup — AI Arrangement feature (2026-06-18)

> Nhánh `feature/vinh-dev`. Commit local, **không** Co-Authored-By.

## 1. Mục tiêu

Xóa toàn bộ code liên quan đến tính năng "AI race arrangement" đã bị hủy (Plan 3 dropped 2026-06-16). Không thay đổi behavior nào đang hoạt động.

Sau khi xong:
- `ai/` module không còn chứa bất kỳ reference nào đến arrangement.
- `npm run build`, `npm run lint`, `npm test` đều xanh.
- Không ảnh hưởng: prediction-engine, strength-score, llm, payos — tất cả giữ nguyên.

## 2. Phạm vi

**KHÔNG** trong phạm vi: E#2 (payments module), E#3 (service boundary), FE cleanup.

## 3. Files xóa hoàn toàn

| File | Lý do |
|------|-------|
| `be/src/ai/services/arrangement-engine.service.ts` | Toàn bộ service (373 dòng) phục vụ arrangement — không còn dùng |
| `be/src/ai/schemas/ai-race-arrangement-suggestion.schema.ts` | Schema + `ArrangementStatus` enum — chỉ dùng bởi arrangement-engine |
| `be/src/ai/dto/create-arrangement-suggestion.dto.ts` | DTO arrangement — không có caller ngoài arrangement flow |
| `be/src/ai/dto/update-arrangement-status.dto.ts` | DTO cập nhật status arrangement — chỉ dùng trong 3 endpoint bị xóa |
| `be/src/ai/dto/create-prediction-suggestion.dto.ts` | DTO không có caller nào (unused) |

## 4. Files chỉnh sửa

### 4a. `be/src/ai/ai.controller.ts`

Xóa 3 endpoint arrangement (giữ nguyên toàn bộ phần prediction):

```
- POST  /ai/arrangements/generate/:tournamentId
- GET   /ai/arrangements/tournament/:tournamentId
- PATCH /ai/arrangements/:id/status
```

Sau khi xóa, controller chỉ còn các endpoint prediction và subscription.

### 4b. `be/src/ai/ai.service.ts`

**Xóa 3 methods:**
- `generateArrangement(tournamentId: string, requestedBy: string)`
- `getArrangementSuggestions(tournamentId: string)`
- `updateArrangementStatus(id: string, dto: UpdateArrangementStatusDto, updatedBy: string)`

**Xóa khỏi constructor injection:**
- `@InjectModel(AIRaceArrangementSuggestion.name) private arrangementModel: Model<...>`

**Xóa import:**
- `AIRaceArrangementSuggestion`, `AIRaceArrangementSuggestionDocument` từ arrangement schema
- `ArrangementEngineService` từ arrangement-engine.service
- `UpdateArrangementStatusDto` từ DTO

### 4c. `be/src/ai/ai.module.ts`

**Xóa khỏi `MongooseModule.forFeature([...])`:**
- `{ name: AIRaceArrangementSuggestion.name, schema: AIRaceArrangementSuggestionSchema }`

**Xóa khỏi `providers: [...]`:**
- `ArrangementEngineService`

**Xóa import:**
- `AIRaceArrangementSuggestion`, `AIRaceArrangementSuggestionSchema` từ arrangement schema
- `ArrangementEngineService` từ arrangement-engine.service

## 5. Giữ nguyên (không chạm)

- `be/src/ai/services/prediction-engine.service.ts`
- `be/src/ai/services/strength-score.service.ts`
- `be/src/ai/services/llm.service.ts`
- `be/src/ai/services/payos.service.ts`
- `be/src/ai/ai.service.ts` — phần prediction và subscription
- `be/src/ai/schemas/ai-prediction-suggestion.schema.ts`
- `be/src/ai/schemas/ai-prediction-package.schema.ts`
- `be/src/ai/schemas/payment.schema.ts`
- `be/src/ai/schemas/user-subscription.schema.ts`
- `be/src/ai/dto/subscribe-package.dto.ts`

## 6. Tiêu chí thành công

- [ ] `npm run build` exit 0 — không còn reference nào đến arrangement code.
- [ ] `npm run lint` 0 problems — không có import mồ côi.
- [ ] `npm test` toàn bộ xanh — không test nào bị ảnh hưởng.
- [ ] `git grep -r "arrangement"` trong `be/src/` không trả về kết quả nào trong code (chỉ có thể còn trong file spec/plan docs).
