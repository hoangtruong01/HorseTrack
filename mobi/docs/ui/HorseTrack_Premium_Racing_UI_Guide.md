# UI Style Guide – HorseTrack Premium Racing Operations

## 1. Design Direction

**Tên style:** `HorseTrack Premium Racing Operations`

**Mô tả ngắn:**
- dark tactical racing control
- premium sports management
- mobile-first
- professional horse racing operations

**Nên làm:**
- Tạo cảm giác ứng dụng thể thao chuyên nghiệp, quyền lực và đáng tin cậy.
- Thiết kế mobile-first với bố cục gọn gàng, chạm thuận tiện.
- Dùng dữ liệu thật, terminology thật.

**Không nên làm:**
- Không thiết kế dạng casino, cá cược (betting app) hay ứng dụng crypto.
- Không biến giao diện thành "admin web dashboard thu nhỏ".
- Không tạo nguyên mẫu sinh viên (student prototype) hay game UI.

---

## 2. Visual Principles

- **Mobile-first, không web-dashboard thu nhỏ.**
- **Dark surface layering:** Dùng màu tối phân lớp mượt mà.
- **Red accent chỉ dùng để dẫn hướng/nhấn mạnh:** Điểm xuyết tinh tế.
- **Metrics theo kiểu telemetry:** Thiết kế phẳng, dải lưới phân tách mảnh.
- **Cards ít border, ít boxy.**
- **Typography sentence case.**
- **Status badge nhỏ, không chói.**
- **Không rainbow UI.**
- **Không fake image/data.**
- **Không casino/crypto wording.**

---

## 3. Color System

Chuẩn hóa màu dựa trên bộ `premium-tokens` của dự án.

- **background:** Nền ứng dụng chính.
- **surface / surface2:** Nền các khối nội dung, block phân lớp nổi lên nền chính.
- **elevated surface:** Dùng cho modal.
- **border:** Cực mỏng và mờ (ví dụ: chia cột metric).
- **text primary:** Màu chữ chính (off-white).
- **text secondary:** Màu chữ phụ.
- **text muted:** Màu chữ cho label, meta data.
- **brand red:** Màu đỏ thương hiệu làm điểm nhấn chính.
- **brand soft:** Đỏ nhạt hoặc opacity thấp.
- **success:** Màu báo thành công.
- **warning:** Màu báo lưu ý.
- **danger:** Màu báo rủi ro.
- **info:** Màu thông tin trung tính.
- **gold:** Màu giới hạn cho ví hoặc hạng đặc biệt.

**Rule:**
- Mỗi screen chỉ nên có 1 accent chính.
- Red là identity accent, không spam.
- Status colors chỉ dùng trong badge/status.
- Không dùng quá 2 accent colors trên cùng một screen.

---

## 4. Typography Rules

**Quy tắc:**
- **Screen title:** Sentence case.
- **Eyebrow:** Có thể uppercase nhưng phải thật ngắn.
- **Không uppercase cả paragraph hoặc section title.**
- **Không dùng fontWeight 900 tràn lan.**
- **Section title:** Vừa phải, không arcade.
- **Data number:** Có thể lớn hơn text thường nhưng không quá gắt.
- **Vietnamese copy:** Phải tự nhiên, rõ ràng.

**Ví dụ:**
❌ **Bad:**
```text
BẢNG QUẢN TRỊ OWNER
PHÍM TẮT NHANH
YÊU CẦU GHI DANH MỚI NHẤT
```
✅ **Good:**
```text
Chủ ngựa
Tiện ích
Ghi danh gần đây
```

---

## 5. Layout Patterns

### App screen
- dark background
- safe area
- scroll padding
- bottom spacing để không bị tab che

### Header
- small role/screen title
- không thêm avatar/menu fake nếu không có flow thật

### Hero
- compact
- title + subtitle
- red accent line
- optional operational insight
- không card dày

### Operational intelligence block
- dùng data thật
- ngắn, rõ
- red left line
- surface nhẹ

### Metrics telemetry
- 2 columns
- label nhỏ
- value rõ
- separator nhẹ
- không card boxy

### Quick actions
- 2 columns
- 4 action chính nếu dashboard
- subtitle ngắn
- icon tone thống nhất
- không 6/8 action nếu gây clutter

### Recent list
- compact row
- optional image only if real data
- nếu không có ảnh, dùng placeholder premium
- status badge subtle
- chevron nếu pressable

### Bottom tab
- phase riêng
- safe-area aware
- active red
- inactive muted
- không bị clipped

---

## 6. Component Usage Guidelines

Dựa trên `mobi/components/ui/premium.tsx` và `premium-tokens.ts`:

- **AppScreen:**
  - Dùng khi: Bọc toàn bộ trang, xử lý safe-area và scroll tự động.
- **AppHeader:**
  - Dùng khi: Trang con cần tiêu đề chuyên biệt.
- **HeroPanel:**
  - Dùng khi: Giới thiệu tổng quan ở trên cùng. (Lưu ý: Reference mới ưu tiên layout Hero phẳng hơn là Panel card).
- **MetricCard:**
  - Dùng khi: Thống kê độc lập.
- **ActionGrid & ActionTile:**
  - Dùng khi: Điều hướng chức năng chính ở dashboard (Tiện ích). Nêu bật subtitle và icon.
- **Section:**
  - Dùng khi: Bọc danh sách (Ghi danh gần đây).
- **AppButton:**
  - Dùng khi: Các CTA chính.

*Lưu ý Component Gaps: Telemetry Grid và Operational Intelligence Block đang nằm trực tiếp ở Owner Dashboard (chưa được trích xuất thành component tái sử dụng).*

---

## 7. Role-specific Adaptation

### Owner
- **Focus:** horses, registrations, invitations, wallet
- **Tone:** racing management, stable operations
- **Dashboard pattern:** hero -> intelligence block -> telemetry metrics -> 4 quick actions -> recent registrations

### Spectator
- **Focus:** races, predictions, wallet/reward points, tournaments
- **Tone:** race discovery, live race following
- **Avoid:** betting/casino vibe, gambling language

### Jockey
- **Focus:** schedule, invitations, performance, wallet
- **Tone:** athlete operations, race readiness
- **Avoid:** fake performance stats

### Referee
- **Focus:** assignments, pre-race, results, violations
- **Tone:** race control, operational authority
- **Avoid:** direct route requiring raceId unless race context exists

---

## 8. Screen Migration Rules

Rules for future UI phases:
- Migrate one screen at a time.
- Screenshot review before expanding.
- Do not migrate 4 dashboards at once unless pattern is already approved.
- Do not change API/logic/navigation while migrating UI.
- Use real data only.
- Keep rollback simple.
- Commit per phase.

**Priority suggestion:**
```text
UI-2A: Owner Dashboard
UI-2B: Spectator Dashboard
UI-2C: Jockey Dashboard
UI-2D: Referee Dashboard
UI-3A: Bottom Tab polish
UI-3B: Spectator Races
UI-3C: Race Detail / Prediction
UI-3D: Wallet
UI-4: remaining role workflows
```

---

## 9. Do / Don’t Examples

✅ **DO:**
```text
Racing Owner
Quản lý chuồng đua
9 chiến mã đang quản lý • 2 ghi danh hoạt động
3.184 điểm
Đã duyệt
```

❌ **DON'T:**
```text
BẢNG QUẢN TRỊ OWNER
OWNER CONTROL CENTER
3.184 TOKEN
84 ETH
Fake horse image URL
8 quick action grid
```

---

## 10. Acceptance Checklist

Checklist dùng để review screenshot:
- [ ] Có giống mobile app thật không?
- [ ] Có còn giống admin dashboard không?
- [ ] Có quá nhiều màu không?
- [ ] Có uppercase quá nhiều không?
- [ ] Có card boxy quá không?
- [ ] Có data fake không?
- [ ] Có crypto/casino wording không?
- [ ] CTA chính có rõ không?
- [ ] Metrics có dễ đọc không?
- [ ] Bottom tab có bị cắt không?
- [ ] Có giữ API/logic/navigation không?
- [ ] Validation pass không?

---

## 11. Implementation Rules

- **Mỗi phase chỉ migrate UI**, không đổi API/logic/navigation.
- **Không thêm fake data** để làm đẹp UI.
- **Không dùng remote image URL** từ Stitch hoặc nguồn ngoài.
- Nếu data không có ảnh, dùng premium placeholder/icon block.
- Nếu component premium hiện có chưa đủ, ưu tiên local style trong screen.
- Nếu cần thay đổi `premium.tsx` hoặc `premium-tokens.ts`, phải dừng và báo “Component Gap”.
- Không sửa `shared.tsx` nếu không được approve.
- Không migrate nhiều màn cùng lúc nếu chưa screenshot-review.
- Không dùng crypto/casino wording.
- Không dùng hơn 4 quick actions trên dashboard nếu làm rối.
- Không đổi route strings khi làm UI.

---

## 12. Reusable Dashboard Template

### 1. Header
- Screen title sentence case.
- Không có fake avatar/menu.

### 2. Hero
- Eyebrow ngắn.
- Title rõ.
- Subtitle nghiệp vụ.
- Red accent line.
- Compact height.

### 3. Operational intelligence
- 1 dòng insight từ data thật.
- Red left line.
- Surface nhẹ.
- Không fake insight.

### 4. Telemetry metrics
- 2 columns.
- Labels nhỏ.
- Values rõ.
- Separators nhẹ.
- Không card boxy.

### 5. Quick actions
- Tối đa 4 action chính.
- 2-column grid.
- Subtitle ngắn.
- Route thật.

### 6. Recent/activity list
- Compact rows.
- Status badge subtle.
- Image thật nếu có.
- Placeholder nếu không có ảnh.
- Không fake image.

### 7. Empty/error/loading
- Dùng component chuẩn.
- Copy tự nhiên.
- CTA rõ nếu cần.

---

## 13. Role Dashboard Mapping

### Owner Dashboard
- **Hero:**
  - Racing Owner
  - Quản lý chuồng đua
  - Theo dõi chiến mã, ghi danh và ví thưởng.
- **Insight:**
  - `{horsesCount} chiến mã đang quản lý • {regCount} ghi danh hoạt động`
- **Metrics:**
  - Chiến mã
  - Ghi danh
  - Ví thưởng
  - Tiền thắng
- **Actions:**
  - Chuồng ngựa
  - Đăng ký đua
  - Lời mời
  - Ví thưởng
- **Recent:**
  - Ghi danh gần đây

### Spectator Dashboard
- **Hero:**
  - Race Viewer
  - Đường đua hôm nay
  - Theo dõi lịch đua, dự đoán và điểm thưởng.
- **Insight:**
  - `{activeRaces} trận đua đang mở • {predictionCount} dự đoán của bạn`
- **Metrics:**
  - Trận đua
  - Dự đoán
  - Ví điểm
  - Giải đấu
- **Actions:**
  - Lịch đua
  - Dự đoán
  - Ví điểm
  - Giải đấu
- **Recent:**
  - Trận đua sắp tới hoặc Dự đoán gần đây
- **Important:**
  - Không dùng wording cá cược.
  - Không casino/betting vibe.

### Jockey Dashboard
- **Hero:**
  - Race Athlete
  - Sẵn sàng vào đường đua
  - Theo dõi lịch thi đấu, lời mời và hiệu suất.
- **Insight:**
  - `{invitationCount} lời mời mới • {upcomingRaceCount} lịch thi đấu sắp tới`
- **Metrics:**
  - Lời mời
  - Lịch đua
  - Ví thưởng
  - Hiệu suất
- **Actions:**
  - Lịch thi đấu
  - Lời mời
  - Hiệu suất
  - Ví thưởng
- **Recent:**
  - Lời mời gần đây hoặc Lịch thi đấu sắp tới
- **Important:**
  - Không fake performance.
  - Nếu không có data hiệu suất thật, hiển thị empty/placeholder trung thực.

### Referee Dashboard
- **Hero:**
  - Race Control
  - Điều phối trận đua
  - Quản lý phân công, kiểm tra và kết quả.
- **Insight:**
  - `{pendingCount} nhiệm vụ chờ xử lý • {assignedCount} phân công đã nhận`
- **Metrics:**
  - Chờ xử lý
  - Phân công
  - Kết quả
  - Vi phạm
- **Actions:**
  - Phân công
  - Điểm danh
  - Vi phạm
  - Kết quả
- **Recent:**
  - Phân công gần đây
- **Important:**
  - Không push trực tiếp vào operation route cần raceId nếu chưa có race context.
  - Quick action phải đi tới list screen an toàn.

---

## 14. Screenshot Quality Bar

### Screenshot Review Score
- **0–6.9/10:** Reject. Không nhân rộng pattern.
- **7–7.9/10:** Patch required. Có thể giữ nhưng chưa được replicate.
- **8–8.9/10:** Acceptable. Có thể dùng làm cơ sở migrate tiếp.
- **9–10/10:** Approved visual direction. Có thể replicate sang role khác.

### Checklist đánh giá:
- [ ] Nhìn như production mobile app chưa?
- [ ] Có còn student/admin dashboard không?
- [ ] Có đúng HorseTrack/racing identity không?
- [ ] Có hierarchy rõ không?
- [ ] Có quá xám/phẳng không?
- [ ] Có quá nhiều màu không?
- [ ] Có fake data/image không?
- [ ] Có giữ logic/API/navigation không?
- [ ] Có pass validation không?
