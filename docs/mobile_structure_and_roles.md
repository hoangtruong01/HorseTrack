# Tài Liệu Cấu Trúc & Phân Quyền Ứng Dụng Di Động (mobi)

Tài liệu này mô tả chi tiết kiến trúc thư mục, luồng hoạt động và chức năng theo từng vai trò người dùng (Roles & Permissions) trong ứng dụng di động **HorseTrack**.

---

## 1. Tổng Quan Kỹ Thuật (Architecture Overview)

Ứng dụng di động được xây dựng dựa trên các nền tảng công nghệ hiện đại:
*   **Core:** React Native (Expo SDK 54).
*   **Routing:** Expo Router (File-based routing tương tự Next.js).
*   **State & Auth:** React Context API (`AuthProvider`), tự động lưu token bộ nhớ để tăng tính bảo mật.
*   **API Client:** Trực tiếp kết nối tới NestJS Backend thông qua cấu hình host động tại `lib/config.ts`.
*   **Theme & Styling:** Sleek Dark Mode cao cấp với bảng màu chủ đạo Đỏ đua (#E10600), Xanh lục ngọc (#067E6A) và Vàng hổ phách (#E1A200).

---

## 2. Cấu Trúc Thư Mục Dự Án (`mobi/`)

```bash
mobi/
├── app/
│   ├── (auth)/                  # Phân hệ Xác thực tài khoản
│   │   ├── login.tsx            # Đăng nhập bằng Email/Password
│   │   └── register.tsx         # Đăng ký tài khoản khán giả
│   │
│   ├── (tabs)/                  # Phân hệ Tab chính (Cổng Khán Giả)
│   │   ├── _layout.tsx          # Định cấu hình Bottom Tab Navigator
│   │   ├── index.tsx            # Trang chủ: Giải đấu & Tin tức
│   │   ├── explore.tsx          # Lịch đua, Chi tiết trận, Đặt dự đoán & BXH
│   │   ├── wallet.tsx           # Số dư ví Pts/VNĐ & Biến động số dư
│   │   └── profile.tsx          # Trang cá nhân & Phím chuyển cổng chức năng
│   │
│   ├── competitor/              # Phân hệ Hội Đua Chuyên Nghiệp (Chủ ngựa & Jockey)
│   │   ├── _layout.tsx          # Stack navigation
│   │   ├── dashboard.tsx        # Trang chủ đối tác (Xem ví Pts/VNĐ tích lũy)
│   │   ├── invitation-inbox.tsx # Hòm thư lời mời dành cho Jockey
│   │   ├── my-horses.tsx        # Quản lý chuồng ngựa dành cho Chủ trại
│   │   └── cashout-request.tsx  # Tạo yêu cầu rút tiền đổi thưởng
│   │
│   └── operations/              # Phân hệ Trạm Vận Hành (Trọng tài & Nhân viên quầy)
│       ├── _layout.tsx          # Stack navigation
│       ├── referee/             # Nhiệm vụ Trọng tài
│       │   ├── assigned-races.tsx  # Phê duyệt & Danh sách nhiệm vụ
│       │   ├── pre-race.tsx        # Kiểm duyệt y tế & Điểm danh ngựa trước đua
│       │   ├── violation-log.tsx   # Lập biên bản vi phạm đường đua thời gian thực
│       │   └── result-entry.tsx    # Nhập kết quả về đích, chạy giả lập & Khóa sổ
│       └── counter/             # Nhiệm vụ Nhân viên quầy
│           ├── scan.tsx         # Tra cứu, đối soát mã quà RWD & Phát tiền
│           └── quick-deposit.tsx# Nạp điểm nhanh cho khán giả (Sandbox Mode)
│
├── lib/
│   ├── config.ts                # Cấu hình IP Host Backend động
│   └── api-client.ts            # Client SDK kết nối tất cả API của hệ thống
│
└── providers/
    └── auth-provider.tsx        # Quản lý phiên đăng nhập & JWT token
```

---

## 3. Phân Quyền & Chức Năng Chi Tiết (User Roles & Permissions)

Để đơn giản hóa trải nghiệm di động, hệ thống gộp 6 quyền trên nền tảng Web thành **3 cổng kết nối chính** dựa trên nhóm quyền tài khoản:

### 3.1. Cổng Khán Giả (Spectator Portal)
*Dành cho tất cả tài khoản đăng ký thông thường.*
*   **Trang chủ (Home):** Theo dõi các giải đấu đang diễn ra và tin tức sự kiện nổi bật.
*   **Lịch đua & Đặt cược (Explore):**
    *   Tra cứu thông tin cự ly, thời tiết, tình trạng mặt cỏ sân đua.
    *   Xem danh sách các ngựa đua đã kiểm duyệt thành công cho mỗi trận.
    *   Thực hiện **Đặt dự đoán** chiến mã thắng cuộc bằng điểm thưởng (Pts).
    *   Xem **Bảng xếp hạng chung cuộc** (bao gồm tổng thời gian chạy thực tế và thời gian bị cộng phạt do vi phạm) sau khi trận đua kết thúc.
*   **Quản lý ví (Wallet):** Theo dõi số dư ví điểm dự đoán (Pts), ví tiền mặt Demo (VNĐ) và danh sách lịch sử cược/biến động số dư tài khoản.
*   **Trang cá nhân (Profile):** Quản lý hồ sơ cá nhân và cung cấp các nút điều hướng thông minh sang cổng Competitor hoặc Operations nếu tài khoản được cấp quyền đặc biệt.

---

### 3.2. Hội Đua Chuyên Nghiệp (Competitor Hub)
*Kích hoạt khi tài khoản có quyền `HORSE_OWNER` hoặc `JOCKEY`.*
*   **Xem thu nhập (Partner Wallet):** Hiển thị số dư Pts nhận được từ giải thưởng hoặc tiền mặt Demo khả dụng rút.
*   **Chủ sở hữu chiến mã (`HORSE_OWNER`):**
    *   Quản lý danh sách ngựa đua thuộc chuồng sở hữu.
    *   Theo dõi tiến độ kiểm duyệt ngựa từ ban tổ chức (Đã duyệt, Chờ duyệt, Bị từ chối kèm lý do).
    *   Theo dõi các chỉ số năng lực của ngựa: tốc độ (km/h), thể lực (score/100), tuổi tác và tình trạng sức khỏe.
*   **Nài ngựa chuyên nghiệp (`JOCKEY`):**
    *   Hòm thư tiếp nhận lời mời cưỡi ngựa tranh tài từ các chủ trang trại.
    *   Thực hiện tương tác phản hồi: Chấp nhận (Accepted) hoặc Từ chối (Rejected) lời mời trực tuyến.
*   **Rút tiền đối tác (Cashout Request):** Chuyển đổi điểm thưởng tích lũy thành tiền mặt theo tỷ giá quy ước `1 Pts = 1.000 VNĐ`. Nhận mã quy đổi vật lý dạng `RWD-XXXXXX` để xuất trình tại quầy đổi quà.

---

### 3.3. Trạm Vận Hành Trường Đua (Operations Station)
*Kích hoạt khi tài khoản có quyền `REFEREE` hoặc `COUNTER_STAFF`.*

#### A. Quyền Trọng Tài (Referee)
*   **Phân công lịch bắt (`assigned-races.tsx`):** Xem lịch thi đấu được phân công làm trọng tài giám sát chính, thực hiện chấp thuận hoặc từ chối bắt trận.
*   **Kiểm duyệt trước trận (`pre-race.tsx`):**
    *   Rà soát tình trạng ngựa và nài ngựa tại khu vực phòng chờ trước giờ G.
    *   Đánh dấu ngựa Đạt chuẩn (Passed) để tham gia hoặc Loại (Failed) kèm mô tả lý do chấn thương/phạm quy để trục xuất khỏi danh sách chạy.
*   **Nhật ký vi phạm (`violation-log.tsx`):**
    *   Lập biên bản vi phạm đường đua thời gian thực cho các ngựa phạm quy (ép làn, xuất phát lỗi, dụng cụ không đạt chuẩn).
    *   Hệ thống tự động liên kết hình phạt cộng thời gian chạy: Nhẹ (+3s), Trung bình (+6s), Nặng (+12s), hoặc Loại trực tiếp (Disqualified).
*   **Kết xuất kết quả (`result-entry.tsx`):**
    *   Nhập thủ công thời gian chạy (giây) hoặc bấm nút **Chạy giả lập** thời gian về đích tự động bằng thuật toán.
    *   Lưu nháp bảng thứ hạng và thực hiện **Xác nhận khóa biên bản kết quả**. Khi biên bản khóa, hệ thống sẽ chốt thời gian chạy chính thức, tự động tính thưởng và phân phối điểm thưởng cho khán giả chiến thắng.

#### B. Quyền Nhân Viên Quầy (Counter Staff)
*   **Đối soát đổi quà (`counter/scan.tsx`):**
    *   Nhập mã quà tặng vật lý `RWD-XXXXXX` do Spectator/Owner cung cấp.
    *   Hệ thống tự động tra cứu kiểm tra tính hợp lệ, tên chủ tài khoản và số tiền mặt đối ứng cần chi trả.
    *   Nhân viên quầy tiến hành trao tiền mặt thực tế và bấm duyệt thành công (Status cập nhật thành `COMPLETED`).
*   **Nạp tiền nhanh tại quầy (`quick-deposit.tsx`):**
    *   Hiển thị thông báo quy định nghiệp vụ cấm nạp tiền trực tiếp để bảo vệ tính công bằng tài chính.
    *   Cung cấp tính năng **Sandbox (Demo mode)** dành riêng cho Tester/Developer có thể nhập User ID khán giả và số tiền nạp để cộng điểm thưởng Pts trực tiếp nhằm đẩy nhanh quy trình test tính năng cược.
