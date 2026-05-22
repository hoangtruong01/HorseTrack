# Hệ thống quản lý giải đua ngựa

## Horse Racing Tournament Management System

---

# 1. Giới thiệu đề tài

Đua ngựa là hoạt động thể thao/giải trí có nhiều vai trò tham gia: chủ ngựa, jockey, trọng tài, ban tổ chức, khán giả.

Hệ thống tập trung vào mô hình đơn giản, phù hợp scope môn WDP:

**Tournament → nhiều Race độc lập → mỗi Race có kết quả/ranking riêng.**

Mỗi tournament chỉ đóng vai trò container để gom nhiều race cùng chủ đề/thời gian. Hệ thống chưa cần Race Round, multi-stage tournament, knockout bracket, playoff, grand final, hay cơ chế cộng điểm phức tạp qua nhiều vòng.

Trong mỗi giải cần quản lý:

- Tài khoản và phân quyền
- Tournament
- Race schedule
- Horse tham gia từng race
- Jockey assignment
- Referee phụ trách race
- Race result
- Ranking theo từng race
- Spectator prediction
- Notification
- Violation và referee report

Mục tiêu là số hóa core flow quản lý giải đua ngựa, dễ build MVP, dễ demo frontend/backend, tránh over-engineering.

---

# 2. Mục tiêu hệ thống

Hệ thống được xây dựng nhằm:

- Quản lý tournament và nhiều race độc lập trong tournament
- Hỗ trợ admin tạo tournament, tạo race, sắp lịch race
- Hỗ trợ owner quản lý horse và đăng ký horse vào race
- Hỗ trợ jockey nhận assignment theo race
- Hỗ trợ referee xác nhận race result
- Hỗ trợ spectator xem live race và prediction
- Công bố race result rõ ràng, đúng quy trình
- Quản lý dữ liệu tập trung, giảm thao tác thủ công

---

# 3. Đối tượng sử dụng

1. **Admin**: quản lý user, tournament, race, registration, result publish.
2. **Horse Owner**: quản lý horse, đăng ký horse vào race, theo dõi kết quả.
3. **Jockey**: nhận assignment, xem race schedule cá nhân.
4. **Race Referee**: kiểm tra race, ghi violation, xác nhận result.
5. **Spectator**: xem race, dự đoán kết quả, nhận notification.

---

# 4. Phạm vi hệ thống

## 4.1 Trong scope MVP

- Auth + RBAC cơ bản
- Tournament management
- Race management
- Horse management
- Race registration
- Jockey assignment
- Referee assignment
- Race schedule
- Live race status cơ bản
- Race result entry/confirm/publish
- Ranking theo từng race
- Spectator prediction
- Notification cơ bản
- Violation và referee report

## 4.2 Ngoài scope MVP

Không làm trong MVP:

- Race Round
- Multi-stage tournament
- Point accumulation system
- Knockout bracket
- Playoff
- Grand final/championship bracket
- Complex tournament leaderboard aggregation
- Ranking logic nhiều vòng
- Season point system

Tournament leaderboard nếu có chỉ là optional/simple, ví dụ thống kê số race thắng hoặc danh sách result đã publish.

---

# 5. Business Flow chính

```txt
Admin tạo Tournament
→ Admin tạo nhiều Race trong Tournament
→ Owner đăng ký Horse vào Race
→ Admin duyệt RaceRegistration
→ Owner/Jockey xác nhận JockeyAssignment
→ Admin/Referee quản lý Race schedule
→ Race bắt đầu
→ Spectator prediction bị lock trước giờ race
→ Race kết thúc
→ Referee nhập và confirm RaceResult
→ Admin hoặc hệ thống publish result
→ Người dùng xem race result + ranking của race đó
→ Notification gửi tới các bên liên quan
```

Nguyên tắc chính:

- Tournament là container.
- Race là đơn vị nghiệp vụ quan trọng nhất.
- Mỗi race độc lập về participant, referee, result, ranking.
- Không có progression qua round/stage.
- Không bắt buộc tính điểm tích lũy giữa các race.

---

# 6. Functional Requirements

## 6.1 Admin

### Quản lý tài khoản

- Xem danh sách user
- Phân quyền user
- Khóa/mở khóa tài khoản

### Quản lý tournament

- Tạo tournament
- Cập nhật thông tin tournament
- Đóng/mở trạng thái tournament
- Xem danh sách race thuộc tournament

### Quản lý race

- Tạo race trong tournament
- Cập nhật race schedule
- Gán referee cho race
- Xem danh sách horse tham gia race
- Quản lý trạng thái race: scheduled, live, finished, result_published

### Quản lý registration

- Xem RaceRegistration
- Duyệt/từ chối horse đăng ký race
- Gửi lý do khi từ chối/yêu cầu bổ sung

### Quản lý result

- Xem RaceResult do referee nhập
- Publish race result sau khi referee confirm
- Xem ranking của từng race

---

## 6.2 Horse Owner

### Quản lý tài khoản

- Đăng ký/đăng nhập/đăng xuất
- Cập nhật thông tin cá nhân

### Quản lý horse

- Thêm horse
- Cập nhật horse
- Upload hình ảnh horse
- Xem trạng thái duyệt horse

### Đăng ký race

- Xem tournament đang mở
- Xem race trong tournament
- Chọn horse đăng ký vào race
- Theo dõi trạng thái RaceRegistration

### Jockey assignment

- Mời/chọn jockey cho horse trong race
- Xem trạng thái assignment

### Theo dõi race

- Xem race schedule
- Xem race detail
- Xem race result
- Xem ranking theo từng race

---

## 6.3 Jockey

### Quản lý tài khoản

- Đăng ký/đăng nhập/đăng xuất
- Cập nhật hồ sơ cá nhân

### Assignment

- Nhận lời mời/assignment
- Chấp nhận/từ chối assignment
- Xem horse được phân công

### Race schedule

- Xem danh sách race được phân công
- Xem thời gian bắt đầu/kết thúc race
- Nhận notification khi race thay đổi trạng thái

---

## 6.4 Race Referee

### Trước race

- Xem race được phân công
- Kiểm tra danh sách horse/jockey
- Ghi chú điều kiện trước race nếu cần

### Trong race

- Theo dõi race status
- Ghi nhận violation
- Tạo referee report

### Sau race

- Nhập RaceResult
- Xác nhận ranking theo race
- Confirm result để chờ publish

---

## 6.5 Spectator

### Xem race

- Xem tournament public
- Xem race schedule
- Xem race detail/live status
- Xem race result đã publish
- Xem ranking của từng race

### Prediction

- Dự đoán horse thắng race
- Prediction lock trước giờ race
- Xem lịch sử prediction
- Nhận notification khi result published

---

# 7. Business Rules

- Một tournament có thể có nhiều race.
- Mỗi race thuộc một tournament.
- Một race có thời gian bắt đầu và kết thúc.
- Một race có danh sách horse tham gia riêng.
- Một race có jockey assignment riêng cho từng horse.
- Một race có một referee chính.
- Một jockey không được tham gia hai race bị trùng thời gian.
- Horse phải được duyệt trước khi đăng ký race.
- RaceRegistration phải được duyệt trước khi horse xuất hiện trong danh sách thi đấu.
- Spectator prediction bị lock trước giờ race theo server time.
- Referee chỉ thao tác trên race được phân công.
- RaceResult chỉ được publish sau khi referee confirm.
- Ranking chỉ cần tính trong phạm vi từng race.
- Tournament leaderboard là optional/simple, không cần cộng điểm nhiều vòng.

---

# 8. Main Entities

## Core entities

- User
- Tournament
- Race
- Horse
- RaceRegistration
- JockeyAssignment
- RaceResult
- Prediction
- Notification
- Violation
- RefereeReport

## Optional/simple entities

- TournamentLeaderboard: optional, chỉ thống kê đơn giản từ published race result.
- Reward: optional nếu demo cần phần thưởng.

## Removed khỏi MVP

- RaceRound
- Qualification
- Stage
- Bracket
- Playoff
- GrandFinal
- SeasonPoint
- ComplexRanking

---

# 9. Entity summary

## User

Đại diện tài khoản hệ thống. Có role: Admin, Horse Owner, Jockey, Referee, Spectator.

## Tournament

Container gom nhiều race. Không xử lý round/stage/progression.

## Race

Đơn vị thi đấu chính. Có schedule, participant list, referee, status, result, ranking.

## Horse

Thông tin ngựa thuộc owner. Horse cần được duyệt trước khi đăng ký race.

## RaceRegistration

Bản ghi owner đăng ký horse vào một race cụ thể.

## JockeyAssignment

Bản ghi jockey được gán cho horse trong một race.

## RaceResult

Kết quả của một race, gồm thứ hạng, thời gian hoàn thành, trạng thái confirm/publish.

## Prediction

Dự đoán của spectator cho một race. Lock trước giờ race.

## Notification

Thông báo trạng thái registration, assignment, race started, race finished, result published.

## Violation

Vi phạm được referee ghi nhận trong race.

## RefereeReport

Biên bản referee cho race, gồm ghi chú, violation, xác nhận result.

---

# 10. Các module chính

## Public Module

- Landing page
- Tournament list
- Tournament detail
- Race list
- Race detail/live view
- Published race result

## Authentication Module

- Login
- Register
- Logout
- Role-based access

## Admin Module

- User management
- Tournament management
- Race management
- RaceRegistration approval
- Referee assignment
- Result publish
- Notification management

## Horse Owner Module

- Horse portfolio
- Race registration
- Jockey assignment
- Race tracking
- Race result view

## Jockey Module

- Assignment inbox
- Race schedule
- Race detail
- Notification

## Referee Module

- Assigned race list
- Pre-race check
- Violation logging
- Result entry
- Referee report

## Spectator Module

- Race browsing
- Live race tracking
- Prediction flow
- Published result view
- Notification

---

# 11. Wording chuẩn

Dùng thống nhất:

- “Race” thay cho “round/stage”.
- “Race result” thay cho “qualification”.
- “Race schedule” thay cho “tournament stage”.
- “Race ranking” cho thứ hạng trong từng race.
- “Tournament leaderboard” chỉ dùng nếu optional/simple.

Không dùng cho MVP:

- Race Round
- Stage progression
- Qualification flow
- Championship bracket
- Grand final
- Season points

---

# 12. Kết quả mong đợi

Sau MVP, hệ thống cần demo được:

1. Admin tạo tournament.
2. Admin tạo nhiều race trong tournament.
3. Owner tạo horse và đăng ký horse vào race.
4. Admin duyệt registration.
5. Jockey nhận assignment.
6. Referee nhập và confirm race result.
7. Admin publish result.
8. Spectator xem live race, prediction, result.
9. Notification cập nhật trạng thái chính.

Kết quả cuối: hệ thống rõ business flow, dễ implement frontend/backend, phù hợp môn WDP, không over-engineering.

---

# 13. Kết luận

Horse Racing Tournament Management System tập trung vào mô hình MVP đơn giản: **Tournament → nhiều Race độc lập → mỗi Race có result/ranking riêng**.

Cách tiếp cận này giữ đúng core flow quản lý giải đua ngựa, giảm độ phức tạp, dễ chia task cho team, dễ build UI/demo bằng AI tools như Stitch, v0, Lovable, và dễ mở rộng sau MVP nếu cần.
