# Thiết kế: Hạng cân (Weight Class) cho Race

- Ngày: 2026-06-30
- Trạng thái: Đã duyệt thiết kế, đang triển khai
- Phạm vi: Backend (NestJS/Mongoose) + Frontend (Next.js)

## 1. Bối cảnh & Mục tiêu

Trong chức năng tạo race cho tournament, cần thêm khái niệm **hạng cân** để tăng
tính công bằng — tránh chênh lệch sức mạnh quá lớn giữa các horse trong cùng một
race. Horse đã có sẵn field `weightKg` (optional). Race hiện chưa có bất kỳ khái
niệm phân hạng cân nào.

## 2. Quyết định thiết kế (đã chốt)

1. **Mô hình**: dùng khoảng cân tùy chỉnh `minWeightKg` / `maxWeightKg` trên Race
   (không dùng enum hạng cân định nghĩa sẵn).
2. **Ràng buộc khi đăng ký**: chặn cứng (hard block) ở backend. Frontend hỗ trợ
   bằng cách lọc/đánh dấu ngựa không đủ điều kiện.
3. **Tính bắt buộc**: cả `minWeightKg` và `maxWeightKg` đều **optional và độc lập**.
   Bỏ trống phía nào = không giới hạn phía đó. Race cũ không có field = không
   giới hạn, chạy như cũ.
4. **Ngựa chưa có `weightKg`**: nếu race có đặt giới hạn (min hoặc max), ngựa
   không có `weightKg` bị **chặn đăng ký**.
5. **Cập nhật**: **không** hỗ trợ sửa khoảng cân sau khi tạo. Chỉ đặt lúc tạo race.
   (`UpdateRaceDto` không đụng tới.)

## 3. Mô hình dữ liệu

`be/src/races/schemas/race.schema.ts` — thêm:

```typescript
@Prop({ type: Number, min: 0 })
minWeightKg?: number;

@Prop({ type: Number, min: 0 })
maxWeightKg?: number;
```

Quy tắc hợp lệ của ngựa: `(minWeightKg == null || weightKg >= minWeightKg)` &&
`(maxWeightKg == null || weightKg <= maxWeightKg)`. Chỉ kiểm tra phía nào được đặt.

## 4. Tạo race (DTO + Service)

`be/src/races/dto/create-race.dto.ts` — thêm 2 field optional:

```typescript
@ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
minWeightKg?: number;

@ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
maxWeightKg?: number;
```

`be/src/races/races.service.ts` (hàm `create`): nếu **cả hai** được nhập và
`minWeightKg > maxWeightKg` → ném `BadRequestException`
("Cân tối thiểu không được lớn hơn cân tối đa"). 2 field được lưu cùng các field
khác qua `...dto`.

## 5. Validate khi đăng ký (cốt lõi — `registrations.service.ts`)

Thêm bước kiểm tra cân sau khi đã check HEALTHY/ACTIVE/APPROVED (mục 4), trước
các check slot:

```text
Nếu race.minWeightKg != null HOẶC race.maxWeightKg != null:
  - Nếu horse.weightKg == null  → BadRequestException
      "Ngựa cần có cân nặng để đăng ký race có giới hạn hạng cân"
  - Nếu minWeightKg != null & weightKg < minWeightKg  → BadRequestException
  - Nếu maxWeightKg != null & weightKg > maxWeightKg  → BadRequestException
      "Cân nặng ngựa (X kg) không nằm trong khoảng cho phép của race (min–max kg)"
```

`horse` đã được nạp qua `horsesService.findRaw(dto.horseId)` (có `weightKg`).
Race không đặt giới hạn nào → bỏ qua hoàn toàn bước này (tương thích ngược).

## 6. Frontend — tạo race

- `fe/features/races/components/race-form.tsx`: thêm 2 input số optional
  "Cân nặng tối thiểu (kg)" / "Cân nặng tối đa (kg)", đặt trong nhóm thông số kỹ
  thuật. Validate nhẹ phía client: nhập cả hai mà min > max → báo lỗi.
- `fe/lib/api-client.ts`: thêm `minWeightKg?` / `maxWeightKg?` vào payload
  `racesApi.create` và interface `RaceItem`.

## 7. Frontend — đăng ký

`fe/features/registrations/components/race-registration-form.tsx`:

1. Hiển thị khoảng cân của race trong khối thông tin race
   ("Hạng cân: 400–450 kg" / "≥ 400 kg" / "≤ 450 kg" / ẩn nếu không giới hạn).
2. Mở rộng filter ngựa đủ điều kiện (đang lọc HEALTHY + APPROVED) thêm điều kiện
   cân: ngựa không có `weightKg` hoặc ngoài khoảng → nhóm "không đủ điều kiện",
   kèm lý do ngắn ("chưa có cân nặng", "nặng quá", "nhẹ quá").

Đây là lớp UX hỗ trợ; chốt chặn thật ở backend (mục 5).

## 8. Kiểm thử / xác minh

- Backend: `npm run build` (typecheck) trong `be/`.
- Frontend: typecheck/build trong `fe/`.
- Smoke logic: race có min/max → ngựa ngoài khoảng bị 400; race không giới hạn →
  đăng ký như cũ.

## 9. Ngoài phạm vi (YAGNI)

- Enum hạng cân định nghĩa sẵn.
- Sửa khoảng cân sau khi tạo (update).
- Truy hồi / loại các đăng ký đã duyệt khi đổi khoảng cân.
- Cảnh báo mềm thay vì chặn cứng.
