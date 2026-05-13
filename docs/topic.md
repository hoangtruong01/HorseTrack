# Hệ thống quản lý giải đua ngựa
## Horse Racing Tournament Management System

---

# 1. Giới thiệu đề tài

Đua ngựa là một hoạt động thể thao và giải trí có nhiều đối tượng tham gia như chủ ngựa, jockey, trọng tài, ban tổ chức và khán giả.

Trong mỗi giải đấu cần quản lý nhiều hoạt động như:
- Đăng ký tham gia giải đấu
- Quản lý thông tin ngựa
- Sắp xếp lịch thi đấu
- Phân công jockey
- Theo dõi kết quả thi đấu
- Quản lý bảng xếp hạng
- Quản lý phần thưởng
- Dự đoán kết quả cuộc đua

Hiện nay, nhiều hoạt động quản lý vẫn còn thực hiện thủ công, gây ra:
- Khó khăn trong quản lý dữ liệu
- Dễ xảy ra sai sót
- Khó theo dõi lịch thi đấu
- Chậm cập nhật kết quả
- Trải nghiệm người dùng chưa tốt

Vì vậy, hệ thống quản lý giải đua ngựa được xây dựng nhằm số hóa và tự động hóa toàn bộ quy trình quản lý giải đấu trên nền tảng web.

---

# 2. Mục tiêu hệ thống

Hệ thống được xây dựng nhằm:
- Hỗ trợ quản lý giải đua ngựa hiệu quả
- Tự động hóa các quy trình quản lý
- Giảm sai sót trong quản lý thủ công
- Hỗ trợ chủ ngựa và jockey tham gia giải đấu thuận tiện hơn
- Giúp khán giả dễ dàng theo dõi và dự đoán kết quả
- Quản lý tập trung toàn bộ thông tin giải đấu

---

# 3. Đối tượng sử dụng

Hệ thống hỗ trợ các vai trò sau:

1. Horse Owner (Chủ ngựa)
2. Jockey (Người điều khiển ngựa)
3. Race Referee (Trọng tài)
4. Spectator (Khán giả)
5. Admin (Quản trị viên)

---

# 4. Phạm vi hệ thống

Hệ thống bao gồm:
- Quản lý tài khoản và phân quyền
- Quản lý giải đấu
- Quản lý đăng ký ngựa
- Quản lý jockey
- Quản lý lịch thi đấu
- Quản lý kết quả thi đấu
- Quản lý bảng xếp hạng và phần thưởng
- Hệ thống dự đoán kết quả
- Quản lý biên bản và vi phạm
- Hệ thống thông báo

---

# 5. Functional Requirements

## 5.1 Horse Owner (Chủ ngựa)

### Quản lý tài khoản
- Đăng ký tài khoản
- Đăng nhập / đăng xuất
- Cập nhật thông tin cá nhân

### Quản lý ngựa
- Thêm thông tin ngựa
- Chỉnh sửa thông tin ngựa
- Upload hình ảnh ngựa
- Xem trạng thái ngựa

### Đăng ký giải đấu
- Đăng ký ngựa tham gia giải
- Xem trạng thái đăng ký
- Xác nhận tham gia cuộc đua

### Quản lý jockey
- Tìm kiếm jockey
- Gửi lời mời jockey
- Xác nhận jockey tham gia
- Quản lý danh sách jockey

### Theo dõi thi đấu
- Xem lịch thi đấu
- Xem thông tin cuộc đua
- Theo dõi kết quả thi đấu
- Xem bảng xếp hạng
- Xem phần thưởng đạt được

---

## 5.2 Jockey

### Quản lý tài khoản
- Đăng ký tài khoản jockey
- Đăng nhập / đăng xuất
- Cập nhật hồ sơ cá nhân

### Quản lý lời mời
- Nhận lời mời điều khiển ngựa
- Chấp nhận lời mời
- Từ chối lời mời

### Theo dõi thi đấu
- Xem danh sách cuộc đua được phân công
- Xem thông tin ngựa điều khiển
- Theo dõi lịch thi đấu

### Theo dõi thành tích
- Xem thành tích cá nhân
- Xem bảng xếp hạng
- Xem lịch sử thi đấu

---

## 5.3 Race Referee (Trọng tài)

### Kiểm tra trước cuộc đua
- Kiểm tra điều kiện ngựa tham gia
- Xác nhận danh sách thi đấu

### Theo dõi cuộc đua
- Theo dõi trạng thái cuộc đua
- Ghi nhận vi phạm
- Áp dụng hình phạt

### Quản lý kết quả
- Nhập kết quả thi đấu
- Xác nhận kết quả
- Lập biên bản thi đấu

---

## 5.4 Spectator (Khán giả)

### Theo dõi giải đấu
- Xem thông tin giải đấu
- Xem lịch đua
- Xem bảng xếp hạng
- Xem kết quả thi đấu

### Dự đoán kết quả
- Dự đoán ngựa chiến thắng
- Xem lịch sử dự đoán
- Theo dõi phần thưởng dự đoán

### Nhận thông báo
- Nhận thông báo kết quả
- Nhận thông báo phần thưởng

---

## 5.5 Admin

### Quản lý tài khoản
- Quản lý người dùng
- Phân quyền người dùng
- Khóa / mở khóa tài khoản

### Quản lý giải đấu
- Tạo giải đấu
- Chỉnh sửa giải đấu
- Quản lý vòng đua
- Sắp xếp lịch thi đấu

### Quản lý đăng ký
- Duyệt đăng ký tham gia
- Từ chối đăng ký không hợp lệ

### Quản lý cuộc đua
- Quản lý danh sách thi đấu
- Phân công trọng tài
- Công bố kết quả

### Quản lý dự đoán
- Quản lý kết quả dự đoán
- Quản lý phần thưởng dự đoán

---

# 6. Business Rules

- Ngựa phải được Admin duyệt trước khi tham gia giải đấu.
- Một jockey không được tham gia hai cuộc đua cùng thời điểm.
- Khán giả chỉ được dự đoán trước khi cuộc đua bắt đầu.
- Trọng tài chỉ được quản lý cuộc đua được phân công.
- Kết quả thi đấu phải được xác nhận trước khi công bố.
- Hệ thống tự động cập nhật bảng xếp hạng và phần thưởng sau khi công bố kết quả.

---

# 7. Main Entities

## Nhóm người dùng
- User
- Role
- Horse Owner
- Jockey

## Nhóm giải đấu
- Tournament
- Race
- Race Round

## Nhóm ngựa & đăng ký
- Horse
- Race Registration
- Jockey Assignment

## Nhóm kết quả
- Race Result
- Ranking
- Prize

## Nhóm báo cáo & dự đoán
- Prediction
- Prediction Reward
- Violation
- Referee Report

## Nhóm hệ thống
- Notification

---


# 8. Các module chính của hệ thống

## Public Module
- Trang chủ
- Danh sách giải đấu
- Xem thông tin cuộc đua

## Authentication Module
- Đăng nhập
- Đăng ký
- Phân quyền theo role

## Horse Owner Module
- Quản lý ngựa
- Đăng ký giải đấu
- Quản lý jockey

## Jockey Module
- Quản lý lời mời
- Theo dõi lịch thi đấu

## Referee Module
- Theo dõi cuộc đua
- Quản lý vi phạm
- Xác nhận kết quả

## Spectator Module
- Dự đoán kết quả
- Theo dõi bảng xếp hạng

## Admin Module
- Quản lý tài khoản
- Quản lý giải đấu
- Quản lý lịch thi đấu
- Công bố kết quả

---

# 9. Kết quả mong đợi

Sau khi hoàn thành, hệ thống cần:
- Quản lý tập trung toàn bộ thông tin giải đấu
- Giảm công việc thủ công
- Tăng hiệu quả quản lý giải đấu
- Hỗ trợ người tham gia thuận tiện hơn
- Hỗ trợ khán giả theo dõi và dự đoán kết quả dễ dàng
- Cập nhật kết quả và bảng xếp hạng chính xác

---

# 10. Kết luận

Hệ thống quản lý giải đua ngựa được xây dựng nhằm hiện đại hóa quy trình quản lý giải đấu đua ngựa thông qua nền tảng web.

Hệ thống hỗ trợ đầy đủ các chức năng cho chủ ngựa, jockey, trọng tài, khán giả và quản trị viên.

Việc tích hợp quản lý giải đấu, lịch thi đấu, kết quả thi đấu và hệ thống dự đoán vào cùng một nền tảng sẽ giúp nâng cao hiệu quả quản lý và cải thiện trải nghiệm người dùng.