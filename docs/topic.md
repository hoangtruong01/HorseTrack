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

- Auth + RBAC cơ bản & Google OAuth2 Login
- Tournament management
- Race management
- Horse management
- Race registration
- Jockey assignment & Jockey Invitations
- Referee assignment
- Race schedule
- Live race status & Pre-race checks (Jockey roll-call, Health, Equipment checks)
- Race result entry/confirm/publish (với giả lập thông số & quy đổi vi phạm)
- Automatic time penalty & outcomes calculation
- 70/30 Winner prize split & Wallet direct reward point credit
- Wallet balance, Point Ledger & Point Redemption (Jockey/Owner Cashout)
- Ranking theo từng race
- Spectator prediction & automatic prediction payout resolution
- Notification cơ bản & Realtime audit logs

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

Tournament leaderboard nếu có chỉ là đơn giản, ví dụ thống kê số race thắng hoặc danh sách result đã publish.

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
- **Quy trình Kiểm tra trước cuộc đua (Pre-race check / Jockey roll-call):**
  - Trước khi bắt đầu, trọng tài thực hiện điểm danh Jockey, kiểm tra sức khỏe của ngựa và thiết bị.
  - Một cuộc đua chỉ có thể bắt đầu (LIVE) hoặc thực hiện ghi nhận kết quả khi toàn bộ các ngựa đã đăng ký APPROVED đều có bản ghi kiểm tra với trạng thái PASSED.
- **Giả lập thông số (Race simulation):**
  - Thời gian hoàn thành được giả lập tự động dựa trên tốc độ và thể lực cơ bản của ngựa, kỹ năng của nài ngựa (từ beginner đến professional), kinh nghiệm, điều kiện thời tiết (Sunny/Rainy/Stormy), điều kiện đường đua (Dry/Muddy), biến cố ngẫu nhiên (chấn thương, xuống nhịp chạy, xuất phát tệ) và phong độ trong ngày.
- **Quy đổi Vi phạm sang phạt thời gian (Time Penalties):**
  - Trọng tài ghi nhận vi phạm trước/trong cuộc đua với mức độ nghiêm trọng khác nhau:
    - Minor: Phạt cộng thêm 3 giây (+3000ms) vào thời gian chạy.
    - Major: Phạt cộng thêm 6 giây (+6000ms) vào thời gian chạy.
    - Critical: Phạt cộng thêm 12 giây (+12000ms) vào thời gian chạy.
  - Các vi phạm có thể dẫn tới bị loại (`DISQUALIFIED`) ngay lập tức hoặc bị phạt thời gian (`TIME_PENALTY`).
  - Hệ thống tự động quy đổi vi phạm thành giây phạt, cộng vào kết quả chạy nháp (DRAFT) của ngựa, sau đó tự động sắp xếp lại thứ hạng (Rank) và tính điểm.
- **Điểm số xếp hạng:** 1st = 10đ, 2nd = 7đ, 3rd = 5đ, 4th = 3đ, các thứ hạng khác = 1đ. Bị loại (DISQUALIFIED) = 0đ.
- **Cơ chế Chia giải thưởng 70/30 (Winner Prize Split):**
  - Khi kết quả cuộc đua được công bố (`PUBLISHED`), tổng tiền thưởng của cuộc đua (`prize`) được chia theo tỷ lệ:
    - 70% dành cho Chủ ngựa (Horse Owner).
    - 30% dành cho Nài ngựa (Jockey).
  - Tiền thưởng này sẽ được cộng trực tiếp vào số dư điểm thưởng (Reward Points Ledger) của người thắng cuộc.
- **Ví tiền và Quy đổi Điểm (Wallet & Cashout):**
  - Tỷ lệ quy đổi điểm thưởng: `1 điểm = 100 VND`.
  - Chủ ngựa và Jockey có thể yêu cầu rút tiền (Cashout Request) để đổi điểm thưởng thành tiền thật.
  - Số điểm yêu cầu rút sẽ bị trừ ngay khỏi ví điểm thưởng khi gửi yêu cầu.
  - Admin duyệt yêu cầu rút tiền (APPROVED/PAID/REJECTED). Nếu yêu cầu bị từ chối (REJECTED), điểm thưởng sẽ được hoàn lại ví của người dùng.
- Spectator prediction bị lock trước giờ race theo server time.
- Referee chỉ thao tác trên race được phân công.
- RaceResult chỉ được publish sau khi referee confirm.
- Ranking chỉ cần tính trong phạm vi từng race.
- Tournament leaderboard là optional/simple, không cần cộng điểm nhiều vòng.

---

# 8. Main Entities

## Core entities

- **User**: Tài khoản người dùng, lưu trữ số dư ví (balance) và danh sách vai trò (roles).
- **Tournament**: Giải đấu, chứa danh sách các cuộc đua độc lập.
- **Race**: Cuộc đua chính, lưu thời gian, khoảng cách, điều kiện thời tiết, trạng thái, trọng tài phụ trách và tiền thưởng.
- **Horse**: Chú ngựa thi đấu, lưu trữ thông số kỹ thuật (base speed, stamina, weight, breed) phục vụ giả lập.
- **RaceRegistration**: Bản đăng ký tham gia cuộc đua của chủ ngựa.
- **JockeyAssignment**: Giao nhiệm vụ nài ngựa thi đấu.
- **JockeyInvitation**: Lời mời nài ngựa thi đấu từ chủ ngựa gửi tới jockey.
- **RaceCheck**: Bản kiểm tra trước cuộc đua (Jockey roll-call, sức khỏe ngựa, thiết bị).
- **RaceViolation**: Lỗi vi phạm của ngựa/nài ngựa trong cuộc đua.
- **RaceResult**: Kết quả cuộc đua (thứ hạng, thời gian chạy, điểm số, trạng thái DRAFT/CONFIRMED/PUBLISHED).
- **Prize**: Giải thưởng ghi nhận lịch sử trúng thưởng sau khi cuộc đua kết thúc.
- **RewardPointLedger**: Sổ cái ghi nhận lịch sử biến động điểm thưởng (cộng điểm đua, trừ điểm rút tiền, hoàn điểm).
- **WalletTransaction**: Lịch sử giao dịch ví tiền (Nạp tiền, Rút tiền thưởng).
- **CashoutRequest**: Yêu cầu rút tiền đổi từ điểm thưởng của Jockey/Owner.
- **Prediction**: Dự đoán của Spectator cho cuộc đua.
- **Notification**: Thông báo hệ thống gửi theo vai trò.
- **AuditLog**: Nhật ký thao tác hệ thống phục vụ hậu kiểm.

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

Đại diện tài khoản hệ thống. Có role: Admin, Horse Owner, Jockey, Referee, Spectator. Lưu trữ số dư thực tế và liên kết với Ví/Sổ cái điểm thưởng.

## Tournament

Container gom nhiều race. Không xử lý round/stage/progression.

## Race

Đơn vị thi đấu chính. Có schedule, participant list, referee, status, result, ranking, prize pool và thông số thời tiết.

## Horse

Thông tin ngựa thuộc owner. Có thông số tốc độ, thể lực để phục vụ race simulation. Horse cần được duyệt trước khi đăng ký race.

## RaceRegistration

Bản ghi owner đăng ký horse vào một race cụ thể.

## JockeyAssignment

Bản ghi jockey được gán cho horse trong một race.

## RaceCheck

Biên bản kiểm tra kỹ thuật và điểm danh (Jockey roll-call) trước giờ chạy của Referee.

## RaceViolation

Ghi nhận các vi phạm của ngựa/jockey và mức phạt thời gian tương ứng.

## RaceResult

Kết quả của một race, gồm thứ hạng, thời gian hoàn thành (đã cộng phạt), điểm số tích lũy, trạng thái confirm/publish.

## Prediction

Dự đoán của spectator cho một race. Lock trước giờ race.

## Prize

Lịch sử trúng giải và phân chia tiền thưởng 70/30.

## RewardPointLedger

Sổ cái kiểm soát điểm thưởng, đảm bảo tính toàn vẹn tài chính điểm.

## WalletTransaction / CashoutRequest

Quản lý nạp tiền mặt và rút điểm thưởng quy đổi tiền mặt của chủ ngựa/jockey.

## Notification

Thông báo trạng thái registration, assignment, race started, race finished, result published, prize paid, cashout approved.

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

- Login (Email + Password)
- Google OAuth2 Login
- Register
- Logout
- Role-based access

## Admin Module

- User management & Banning status
- Tournament management
- Race management & Weather conditions
- RaceRegistration approval
- Referee assignment
- Result publish (trigger 70/30 split and payout prediction)
- Cashout Request Approval queue (Approve/Pay/Reject)
- Audit Logs viewer
- Notification management

## Horse Owner Module

- Horse portfolio
- Race registration
- Jockey assignment & invitations
- Wallet history & Point Ledger balance
- Cashout Request (Redeem points to VND)
- Race tracking & Published result view

## Jockey Module

- Assignment inbox & Invitations
- Race schedule
- Race detail
- Wallet history & Point Ledger balance
- Cashout Request (Redeem points to VND)
- Notification

## Referee Module

- Assigned race list
- Pre-race check (Jockey roll-call, horse health, equipment)
- Violation logging (Minor/Major/Critical severities mapped to time penalties/disqualifications)
- Result entry & automatic simulation
- Confirm results

## Spectator Module

- Race browsing
- Live race tracking
- Prediction flow (with lock status & countdown)
- Published result view
- Wallet deposit simulation
- Notification

---

# 11. Wording chuẩn

Dùng thống nhất:

- “Race” thay cho “round/stage”.
- “Race result” thay cho “qualification”.
- “Race schedule” thay cho “tournament stage”.
- “Race ranking” cho thứ hạng trong từng race.
- “Tournament leaderboard” chỉ dùng nếu optional/simple.
- “Pre-race check” thay cho “medical check” hoặc “equipment check”.
- “Jockey roll-call” cho việc điểm danh nài ngựa.
- “Reward points” cho số dư điểm thưởng.
- “Cashout” cho việc rút tiền đổi điểm thưởng.

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
