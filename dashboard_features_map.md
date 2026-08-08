# BẢN ĐỒ CHỨC NĂNG DASHBOARD (DỰ ÁN HORSE TRACK)

Tài liệu này chú thích toàn bộ các thư mục, file chức năng và phân quyền trong thư mục `fe/app/(dashboard)`.

---

## 🗺️ TỔNG QUAN HỆ THỐNG PHÂN QUYỀN (ROLES)
Thư mục `fe/app/(dashboard)` được chia thành các thư mục con tương ứng với từng vai trò người dùng trong hệ thống:
1.  **Admin (`admin/`)**: Quản trị viên hệ thống (Quản lý người dùng, tạo giải đấu, cuộc đua, phê duyệt kết quả, cấu hình AI...).
2.  **Owner (`owner/`)**: Chủ ngựa (Quản lý ngựa, thuê nài ngựa, đăng ký giải đấu...).
3.  **Referee (`referee/`)**: Trọng tài (Giám sát cuộc đua, nhập kết quả, báo cáo vi phạm...).
4.  **Spectator (`spectator/`)**: Khán giả/Người chơi (Xem cuộc đua, đặt cược, mua dự đoán AI...).
5.  **Counter Staff (`counter-staff/`)**: Nhân viên tại quầy (Nạp/rút tiền vật lý cho khách hàng).
6.  **Jockey (`jockey/`)**: Nài ngựa (Nhận lời mời từ chủ ngựa, xem lịch đua phân công).

---

## 📂 CHI TIẾT CÁC FILE CHỨC NĂNG THEO QUYỀN

### 1. 🛠️ QUYỀN ADMIN (`admin/`)
*   **Trang chủ Admin**:
    *   `admin/page.tsx`: Trang tổng quan (Dashboard) hiển thị số liệu thống kê chung.
*   **Quản lý người dùng (User Management)**:
    *   `admin/users/page.tsx`: **Chức năng quản lý User** (Tìm kiếm, khóa/mở khóa tài khoản, phân quyền quản trị).
*   **Quản lý giải đấu (Tournaments)**:
    *   `admin/tournaments/page.tsx`: Xem danh sách các giải đấu đã và đang diễn ra.
    *   `admin/tournaments/new/page.tsx`: **Chức năng tạo giải đấu mới** (Thiết lập tên giải, quy định, thời gian).
    *   `admin/tournaments/[tournamentId]/page.tsx`: Chi tiết giải đấu và danh sách các vòng đua thuộc giải đấu.
*   **Quản lý cuộc đua (Races)**:
    *   `admin/races/page.tsx`: Danh sách tất cả các trận đua ngựa.
    *   `admin/races/new/page.tsx`: **Chức năng tạo trận đua mới** (Gán vào giải đấu, định thời gian).
    *   `admin/races/[raceId]/page.tsx`: Xem chi tiết thông số một trận đua.
    *   `admin/races/[raceId]/assignments/page.tsx`: Phân công trọng tài chính và các giám sát cho trận đua.
    *   `admin/races/[raceId]/participants/page.tsx`: Danh sách ngựa đua và nài ngựa chính thức tham gia trận đấu.
*   **Quản lý kết quả & phê duyệt (Results)**:
    *   `admin/results/page.tsx`: Danh sách các trận đua cần phê duyệt kết quả.
    *   `admin/results/[raceId]/page.tsx`: Phê duyệt kết quả chung cuộc do trọng tài gửi lên để thanh toán tiền cược.
*   **Quản lý đặt cược & Rút tiền**:
    *   `admin/bets/page.tsx`: Quản lý và giám sát tất cả các lệnh đặt cược của khán giả.
    *   `admin/cashouts/page.tsx`: Duyệt hoặc từ chối các yêu cầu rút tiền của người dùng.
*   **Quản lý ngựa & Nài ngựa**:
    *   `admin/horses/page.tsx`: Quản lý danh sách ngựa đua toàn hệ thống (Duyệt ngựa mới, cập nhật tình trạng sức khỏe).
    *   `admin/jockeys/page.tsx`: Quản lý danh sách nài ngựa và thông số của họ.
*   **Quản lý trọng tài (Referees)**:
    *   `admin/referees/page.tsx`: Danh sách và cấp tài khoản cho các trọng tài.
    *   `admin/referee-assignments/page.tsx`: Lịch sử và trạng thái phân công công việc của trọng tài.
*   **Quản lý đăng ký thi đấu (Registrations)**:
    *   `admin/registrations/page.tsx`: Quản lý đơn đăng ký tham gia thi đấu của các chủ ngựa.
    *   `admin/registrations/[registrationId]/page.tsx`: Chi tiết đơn đăng ký và thao tác Duyệt/Từ chối.
*   **Quản lý AI dự đoán**:
    *   `admin/ai/packages/page.tsx`: Quản lý gói cước gợi ý dự đoán AI.
    *   `admin/ai/payments/page.tsx`: Lịch sử giao dịch mua gói AI của người dùng.
    *   `admin/ai/predictions/page.tsx`: Cấu hình hoặc xem độ chính xác của dự đoán AI.
*   **Khác**:
    *   `admin/prizes/page.tsx`: Cấu hình cơ cấu giải thưởng.
    *   `admin/rankings/page.tsx`: Quản lý bảng xếp hạng.
    *   `admin/wallet/page.tsx`: Thống kê doanh thu, số dư và dòng tiền hệ thống.

---

### 2. 🐎 QUYỀN CHỦ NGỰA (`owner/`)
*   **Trang chủ Owner**:
    *   `owner/page.tsx`: Tổng quan số lượng ngựa, nài ngựa đang thuê và giải thưởng đã đạt được.
*   **Quản lý ngựa của mình**:
    *   `owner/horses/page.tsx`: Danh sách ngựa đang sở hữu.
    *   `owner/horses/new/page.tsx`: **Chức năng thêm/đăng ký ngựa mới** lên hệ thống.
    *   `owner/horses/[horseId]/page.tsx`: Xem chi tiết thông số, sức khỏe và lịch sử của một con ngựa cụ thể.
*   **Thuê nài ngựa (Jockeys)**:
    *   `owner/jockey-invitations/page.tsx`: **Chức năng gửi lời mời và thương lượng** thuê Jockey điều khiển ngựa của mình.
*   **Đăng ký giải đấu/cuộc đua**:
    *   `owner/races/page.tsx`: Danh sách cuộc đua chuẩn bị diễn ra.
    *   `owner/races/[raceId]/register/page.tsx`: **Đăng ký một con ngựa của mình** vào trận đua cụ thể.
    *   `owner/registrations/page.tsx`: Lịch sử và trạng thái các đơn đăng ký thi đấu (Chờ duyệt/Đã duyệt/Từ chối).
*   **Xem kết quả & tài chính**:
    *   `owner/results/page.tsx`: Xem kết quả thi đấu của ngựa thuộc sở hữu.
    *   `owner/wallet/page.tsx`: Ví của chủ ngựa (Rút tiền thưởng từ giải đấu).
    *   `owner/rankings/page.tsx`: Xem thứ hạng ngựa trên hệ thống.

---

### 3. 🏁 QUYỀN TRỌNG TÀI (`referee/`)
*   **Trang chủ Referee**:
    *   `referee/page.tsx`: Danh sách nhiệm vụ trong ngày của trọng tài.
*   **Giám sát & Điều hành**:
    *   `referee/assignments/page.tsx`: Danh sách các trận đấu được Admin phân công làm trọng tài.
    *   `referee/pre-race/page.tsx`: **Chức năng kiểm tra tiền trận đấu** (cân nặng nài ngựa, kiểm tra trang bị, xác nhận ngựa sẵn sàng).
    *   `referee/monitoring/page.tsx`: Màn hình giám sát trận đấu thời gian thực.
*   **Ghi nhận kết quả & vi phạm**:
    *   `referee/result-entry/page.tsx` & `referee/races/[raceId]/result-entry/page.tsx`: **Chức năng nhập kết quả cuộc đua** (Ghi nhận vị trí Top 1, 2, 3 và thời gian hoàn thành).
    *   `referee/violations/page.tsx` & `referee/races/[raceId]/violations/page.tsx`: **Chức năng ghi nhận lỗi vi phạm** (Ví dụ: Jockey chèn ép đối thủ, chạy sai đường).
*   **Báo cáo & Tài chính**:
    *   `referee/reports/page.tsx`: Gửi báo cáo tổng kết sau cuộc đua cho ban tổ chức.
    *   `referee/wallet/page.tsx`: Thống kê thù lao trọng tài.
    *   `referee/rankings/page.tsx`: Xem bảng xếp hạng chung.

---

### 4. 🎟️ QUYỀN KHÁN GIẢ / NGƯỜI CHƠI (`spectator/`)
*   **Trang chủ Spectator**:
    *   `spectator/page.tsx`: Giao diện xem tổng hợp các trận đấu nổi bật.
*   **Đặt cược & xem lịch**:
    *   `spectator/races/page.tsx`: **Chức năng chính của khán giả**: Xem danh sách trận đua đang/sắp diễn ra, xem trực tiếp và tiến hành **đặt cược (betting)**.
    *   `spectator/tournaments/page.tsx`: Lịch trình các giải đấu lớn.
*   **Kết quả & Xếp hạng**:
    *   `spectator/results/page.tsx`: Xem kết quả chi tiết các trận đua đã kết thúc để kiểm tra vé cược.
    *   `spectator/rankings/page.tsx`: Xem xếp hạng ngựa/jockey để phân tích phong độ trước khi cược.
*   **Dự đoán bằng AI**:
    *   `spectator/ai-packages/page.tsx`: Xem và mua các gói dự đoán kết quả của AI.
    *   `spectator/ai-predictions/page.tsx`: Xem các kết quả gợi ý dự đoán từ AI dành cho các trận đua sắp tới (chức năng Premium).
    *   `spectator/ai-payment-return/page.tsx`: Trang xử lý kết quả thanh toán khi mua gói AI.
*   **Tài chính**:
    *   `spectator/wallet/page.tsx`: Ví cá nhân (Nạp tiền cược, rút tiền thắng cược).
    *   `spectator/predictions/page.tsx`: Lịch sử dự đoán cá nhân.

---

### 5. 💵 QUYỀN NHÂN VIÊN QUẦY (`counter-staff/`)
*   **Trang chủ**:
    *   `counter-staff/page.tsx`: Quản lý phiên làm việc của nhân viên quầy.
*   **Nạp tiền tại quầy**:
    *   `counter-staff/deposit/page.tsx`: **Chức năng nạp tiền mặt trực tiếp**: Khách hàng đưa tiền mặt, nhân viên quầy bắn số dư vào tài khoản (ví) của khách hàng trên hệ thống.
*   **Rút tiền/Đổi thưởng tại quầy**:
    *   `counter-staff/redemptions/page.tsx`: **Chức năng trả tiền mặt trực tiếp**: Khách hàng yêu cầu rút tiền/đổi vé cược trúng thưởng thành tiền mặt tại quầy, nhân viên xác nhận và trừ số dư ví.

---

### 6. 🏇 QUYỀN NÀI NGỰA (`jockey/`)
*   **Trang chủ**:
    *   `jockey/page.tsx`: Tổng quan lịch đua sắp tới và số dư ví.
*   **Lời mời & Công việc**:
    *   `jockey/invite/page.tsx`: **Nhận và phản hồi lời mời làm việc** từ các chủ ngựa (chấp nhận/từ chối thỏa thuận lái ngựa).
    *   `jockey/assign/page.tsx`: Lịch phân công thi đấu chi tiết trong các trận đua của ban tổ chức.
*   **Hồ sơ & Thứ hạng**:
    *   `jockey/profile/page.tsx`: Quản lý hồ sơ cá nhân, cập nhật chiều cao, cân nặng định kỳ.
    *   `jockey/rankings/page.tsx`: Bảng xếp hạng nài ngựa dựa trên tỉ lệ thắng.
    *   `jockey/wallet/page.tsx`: Quản lý ví cá nhân (rút tiền lương, thưởng).

---

### 👤 TRANG HỒ SƠ CHUNG (`profile/`)
*   `profile/page.tsx`: Trang cá nhân dùng chung cho tất cả mọi quyền để thay đổi thông tin cơ bản.
